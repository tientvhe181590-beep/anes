package com.anes.server.ai.service;

import com.anes.server.ai.dto.ChatResponse;
import com.anes.server.ai.dto.GeneratePlanRequest;
import com.anes.server.ai.dto.GeneratePlanResponse;
import com.anes.server.ai.dto.GeminiRequest;
import com.anes.server.ai.dto.GeminiResponse;
import com.anes.server.ai.dto.PlanExerciseDto;
import com.anes.server.ai.dto.PlanTemplateDto;
import com.anes.server.common.exception.AiServiceTimeoutException;
import com.anes.server.common.exception.AiServiceUnavailableException;
import com.anes.server.common.exception.EntityNotFoundException;
import com.anes.server.common.exception.RateLimitExceededException;
import com.anes.server.config.AiProperties;
import com.anes.server.user.entity.ExperienceLevel;
import com.anes.server.user.entity.User;
import com.anes.server.user.entity.UserPreferences;
import com.anes.server.user.repository.UserPreferencesRepository;
import com.anes.server.user.repository.UserRepository;
import com.anes.server.workout.entity.DifficultyLevel;
import com.anes.server.workout.entity.Exercise;
import com.anes.server.workout.entity.ExerciseType;
import com.anes.server.workout.entity.ScheduleStatus;
import com.anes.server.workout.entity.UserWorkoutSchedule;
import com.anes.server.workout.entity.VideoSource;
import com.anes.server.workout.entity.WorkoutProgram;
import com.anes.server.workout.entity.WorkoutTemplate;
import com.anes.server.workout.entity.WorkoutTemplateExercise;
import com.anes.server.workout.repository.ExerciseRepository;
import com.anes.server.workout.repository.UserWorkoutScheduleRepository;
import com.anes.server.workout.repository.WorkoutProgramRepository;
import com.anes.server.workout.repository.WorkoutTemplateExerciseRepository;
import com.anes.server.workout.repository.WorkoutTemplateRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

import java.net.http.HttpClient;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AiService {

    private static final String ENDPOINT_GENERATE_PLAN = "generate-plan";
    private static final String ENDPOINT_CHAT = "chat";

    private final AiProperties aiProperties;
    private final AiContextBuilder aiContextBuilder;
    private final AiRateLimiter aiRateLimiter;
    private final AiUsageService aiUsageService;
    private final AiUsageWindowService aiUsageWindowService;
    private final UserRepository userRepository;
    private final UserPreferencesRepository userPreferencesRepository;
    private final WorkoutProgramRepository workoutProgramRepository;
    private final WorkoutTemplateRepository workoutTemplateRepository;
    private final WorkoutTemplateExerciseRepository workoutTemplateExerciseRepository;
    private final ExerciseRepository exerciseRepository;
    private final UserWorkoutScheduleRepository userWorkoutScheduleRepository;
    private final ObjectMapper objectMapper;
    private final RestClient restClient;

    public AiService(
            AiProperties aiProperties,
            AiContextBuilder aiContextBuilder,
            AiRateLimiter aiRateLimiter,
            AiUsageService aiUsageService,
            AiUsageWindowService aiUsageWindowService,
            UserRepository userRepository,
            UserPreferencesRepository userPreferencesRepository,
            WorkoutProgramRepository workoutProgramRepository,
            WorkoutTemplateRepository workoutTemplateRepository,
            WorkoutTemplateExerciseRepository workoutTemplateExerciseRepository,
            ExerciseRepository exerciseRepository,
            UserWorkoutScheduleRepository userWorkoutScheduleRepository,
            ObjectMapper objectMapper,
            RestClient.Builder restClientBuilder
    ) {
        this.aiProperties = aiProperties;
        this.aiContextBuilder = aiContextBuilder;
        this.aiRateLimiter = aiRateLimiter;
        this.aiUsageService = aiUsageService;
        this.aiUsageWindowService = aiUsageWindowService;
        this.userRepository = userRepository;
        this.userPreferencesRepository = userPreferencesRepository;
        this.workoutProgramRepository = workoutProgramRepository;
        this.workoutTemplateRepository = workoutTemplateRepository;
        this.workoutTemplateExerciseRepository = workoutTemplateExerciseRepository;
        this.exerciseRepository = exerciseRepository;
        this.userWorkoutScheduleRepository = userWorkoutScheduleRepository;
        this.objectMapper = objectMapper;
        this.restClient = buildRestClient(restClientBuilder);
    }

    public GeneratePlanResponse generatePlan(Long userId, GeneratePlanRequest request) {
        User user = userRepository.findByIdAndDeletedFalse(userId)
                .orElseThrow(() -> new EntityNotFoundException("User", userId));

        enforceRateLimit(user);

        if (request.regenerate() && !user.isPremium()) {
            if (aiUsageWindowService.hasGeneratedPlanToday(userId)) {
                throw new RateLimitExceededException("Plan regeneration limit reached. Upgrade for more.");
            }
        }

        String context = aiContextBuilder.buildContext(userId);
        String prompt = buildPlanPrompt(context, request.regenerate());
        GeminiResponse response = callGemini(prompt);

        String json = extractText(response);
        PlanDraft planDraft = parsePlan(json);

        GeneratePlanResponse summary = persistPlan(user, planDraft);
        logUsage(user, ENDPOINT_GENERATE_PLAN, response);
        return summary;
    }

    public ChatResponse chat(Long userId, String message) {
        User user = userRepository.findByIdAndDeletedFalse(userId)
                .orElseThrow(() -> new EntityNotFoundException("User", userId));

        enforceRateLimit(user);
        String context = aiContextBuilder.buildContext(userId);
        String prompt = buildChatPrompt(context, message);
        GeminiResponse response = callGemini(prompt);

        String reply = extractText(response);
        logUsage(user, ENDPOINT_CHAT, response);

        int tokens = Optional.ofNullable(response.usageMetadata())
                .map(GeminiResponse.UsageMetadata::totalTokenCount)
                .orElse(0);

        return new ChatResponse(reply, tokens);
    }

    private RestClient buildRestClient(RestClient.Builder restClientBuilder) {
        HttpClient httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(3))
                .build();
        JdkClientHttpRequestFactory factory = new JdkClientHttpRequestFactory(httpClient);
        factory.setReadTimeout(Duration.ofSeconds(8));

        return restClientBuilder
                .requestFactory(factory)
                .baseUrl("https://generativelanguage.googleapis.com/v1beta")
                .build();
    }

    private void enforceRateLimit(User user) {
        int limit = user.isPremium()
                ? aiProperties.rateLimit().premiumTier()
                : aiProperties.rateLimit().freeTier();

        if (!aiRateLimiter.tryConsume(user.getId(), limit)) {
            throw new RateLimitExceededException("Rate limit exceeded. Please wait before making more AI requests.");
        }
    }

    private GeminiResponse callGemini(String prompt) {
        GeminiRequest request = new GeminiRequest(
                List.of(new GeminiRequest.Content(
                        "user",
                        List.of(new GeminiRequest.Part(prompt))
                )),
                new GeminiRequest.GenerationConfig(
                        aiProperties.temperature(),
                        aiProperties.maxOutputTokens()
                )
        );

        try {
            return restClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .path("/models/{model}:generateContent")
                            .queryParam("key", aiProperties.apiKey())
                            .build(aiProperties.model()))
                    .body(request)
                    .retrieve()
                    .body(GeminiResponse.class);
        } catch (ResourceAccessException ex) {
            throw new AiServiceTimeoutException("AI service took too long. Please try again.");
        } catch (Exception ex) {
            throw new AiServiceUnavailableException("AI service is temporarily unavailable.");
        }
    }

    private String extractText(GeminiResponse response) {
        if (response == null || response.candidates() == null || response.candidates().isEmpty()) {
            throw new AiServiceUnavailableException("AI service is temporarily unavailable.");
        }
        GeminiResponse.Candidate candidate = response.candidates().getFirst();
        if (candidate.content() == null || candidate.content().parts() == null || candidate.content().parts().isEmpty()) {
            throw new AiServiceUnavailableException("AI service is temporarily unavailable.");
        }
        return candidate.content().parts().getFirst().text();
    }

    private PlanDraft parsePlan(String json) {
        try {
            return objectMapper.readValue(json, PlanDraft.class);
        } catch (Exception ex) {
            throw new AiServiceUnavailableException("AI service is temporarily unavailable.");
        }
    }

    private GeneratePlanResponse persistPlan(User user, PlanDraft planDraft) {
        WorkoutProgram program = new WorkoutProgram();
        program.setUser(user);
        program.setName(planDraft.programName());
        program.setDescription("AI-generated program");
        program.setDurationWeeks(planDraft.durationWeeks());
        program.setIsAiGenerated(true);
        WorkoutProgram savedProgram = workoutProgramRepository.save(program);

        List<PlanTemplateDto> templates = planDraft.templates();
        for (PlanTemplateDto templateDto : templates) {
            WorkoutTemplate template = new WorkoutTemplate();
            template.setProgram(savedProgram);
            template.setDayNumber(templateDto.dayNumber());
            template.setFocusArea(templateDto.focusArea());
            template.setEstimatedDurationMins(templateDto.estimatedDurationMins());
            WorkoutTemplate savedTemplate = workoutTemplateRepository.save(template);

            int orderIndex = 0;
            for (PlanExerciseDto exerciseDto : templateDto.exercises()) {
                Exercise exercise = resolveExercise(exerciseDto, user.getId());

                WorkoutTemplateExercise templateExercise = new WorkoutTemplateExercise();
                templateExercise.setTemplate(savedTemplate);
                templateExercise.setExercise(exercise);
                templateExercise.setOrderIndex(orderIndex++);
                templateExercise.setTargetSets(exerciseDto.sets());
                templateExercise.setTargetReps(exerciseDto.reps());
                templateExercise.setRestTimeSec(exerciseDto.restTimeSec());
                workoutTemplateExerciseRepository.save(templateExercise);
            }

            UserWorkoutSchedule schedule = new UserWorkoutSchedule();
            schedule.setUser(user);
            schedule.setTemplate(savedTemplate);
            schedule.setScheduledDate(LocalDate.now().plusDays(templateDto.dayNumber() - 1L));
            schedule.setStatus(templateDto.dayNumber() == 1 ? ScheduleStatus.UNLOCKED : ScheduleStatus.LOCKED);
            userWorkoutScheduleRepository.save(schedule);
        }

        return new GeneratePlanResponse(
                savedProgram.getId(),
                savedProgram.getName(),
                savedProgram.getDurationWeeks(),
                templates
        );
    }

    private Exercise resolveExercise(PlanExerciseDto exerciseDto, Long userId) {
        Optional<Exercise> existing = exerciseRepository.findByNameAndDeletedFalse(exerciseDto.name());
        if (existing.isPresent()) {
            return existing.get();
        }

        Exercise exercise = new Exercise();
        exercise.setName(exerciseDto.name());
        exercise.setType(ExerciseType.REP_BASED);
        exercise.setDifficulty(deriveDifficulty(userId));
        exercise.setVideoSource(VideoSource.YOUTUBE);
        return exerciseRepository.save(exercise);
    }

    private DifficultyLevel deriveDifficulty(Long userId) {
        return userPreferencesRepository.findByUserIdAndDeletedFalse(userId)
                .map(UserPreferences::getExperienceLevel)
                .map(level -> switch (level) {
                    case BEGINNER -> DifficultyLevel.BEGINNER;
                    case INTERMEDIATE -> DifficultyLevel.INTERMEDIATE;
                    case ADVANCED -> DifficultyLevel.ADVANCED;
                })
                .orElse(DifficultyLevel.BEGINNER);
    }

    private void logUsage(User user, String endpoint, GeminiResponse response) {
        GeminiResponse.UsageMetadata usage = response.usageMetadata();
        int inputTokens = usage != null && usage.promptTokenCount() != null ? usage.promptTokenCount() : 0;
        int outputTokens = usage != null && usage.candidatesTokenCount() != null ? usage.candidatesTokenCount() : 0;
        aiUsageService.logUsage(user, endpoint, inputTokens, outputTokens);
    }

    private String buildPlanPrompt(String context, boolean regenerate) {
        String action = regenerate ? "Regenerate" : "Generate";
        return """
                You are a fitness coach. %s a 7-day workout plan based on the user context.
                Return ONLY valid JSON in this schema:
                {
                  "programName": "string",
                  "durationWeeks": number,
                  "templates": [
                    {
                      "dayNumber": number,
                      "focusArea": "string",
                      "estimatedDurationMins": number,
                      "exercises": [
                        { "name": "string", "sets": number, "reps": number, "restTimeSec": number }
                      ]
                    }
                  ]
                }

                User context:
                %s
                """.formatted(action, context);
    }

    private String buildChatPrompt(String context, String message) {
        return """
                Use the user context to answer the question.

                User context:
                %s

                User question:
                %s
                """.formatted(context, message);
    }

    private record PlanDraft(String programName, Integer durationWeeks, List<PlanTemplateDto> templates) {
    }
}
