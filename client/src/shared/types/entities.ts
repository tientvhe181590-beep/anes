/**
 * Shared entity types matching Dexie table records and API response interfaces.
 *
 * Dexie record types are defined in `@/app/db.ts` and re-exported here
 * for convenient access from feature modules. API-specific response
 * wrappers are defined below.
 */

// Re-export all Dexie record types for feature-module usage
export type {
  UserRecord,
  UserPhysicalStatsRecord,
  UserPreferencesRecord,
  HealthConditionRecord,
  UserHealthConstraintRecord,
  WorkoutProgramRecord,
  WorkoutTemplateRecord,
  ExerciseRecord,
  WorkoutTemplateExerciseRecord,
  UserWorkoutScheduleRecord,
  WorkoutSessionExerciseRecord,
  WorkoutSessionSetRecord,
  IngredientRecord,
  RecipeRecord,
  RecipeIngredientRecord,
  UserDailyNutritionRecord,
  ChatLogRecord,
  SymptomRecord,
  ConditionSymptomRecord,
  HealthRecommendationRecord,
  RefreshTokenRecord,
  MembershipTierRecord,
  SubscriptionRecord,
  PaymentRecord,
  SystemMessageRecord,
} from "@/app/db";

// ── Standard API envelope ────────────────────────────────────────────

/** Standard success response from the server. */
export interface ApiSuccessResponse<T> {
  data: T;
  message: string;
  timestamp?: string;
}

/** Standard error response from the server. */
export interface ApiErrorResponse {
  error: string;
  message: string;
  timestamp?: string;
  details?: Record<string, string>;
}

/** Paginated list envelope. */
export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// ── Common API DTOs ──────────────────────────────────────────────────

/** Minimal user profile returned in auth responses. */
export interface UserProfileDTO {
  id: number;
  email: string;
  fullName: string;
  onboardingComplete: boolean;
}

/** JWT pair returned by auth endpoints. */
export interface AuthTokensDTO {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserProfileDTO;
}

/** Workout plan summary returned after onboarding/plan generation. */
export interface PlanSummaryDTO {
  programId: number;
  programName: string;
  durationWeeks: number;
  daysPerWeek: number;
  focusAreas: string[];
}

/** Single exercise in a generated template. */
export interface TemplateExerciseDTO {
  name: string;
  sets: number;
  reps: number;
  restTimeSec: number;
}

/** Single day template in a generated plan. */
export interface TemplateDayDTO {
  dayNumber: number;
  focusArea: string;
  estimatedDurationMins: number;
  exercises: TemplateExerciseDTO[];
}

/** Full generated plan (from POST /api/v1/ai/generate-plan). */
export interface GeneratedPlanDTO {
  programId: number;
  programName: string;
  durationWeeks: number;
  templates: TemplateDayDTO[];
}
