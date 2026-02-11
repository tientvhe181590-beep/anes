import Dexie, { type Table } from "dexie";

export interface UserRecord {
  id?: number;
  email: string;
  fullName?: string;
  onboardingComplete?: boolean;
  deleted?: boolean;
}

export interface UserPhysicalStatsRecord {
  id?: number;
  userId: number;
  weightKg?: number;
  heightCm?: number;
  bmi?: number;
  bmr?: number;
  tdee?: number;
  activityLevel?: string;
  recordedAt?: string;
  deleted?: boolean;
}

export interface UserPreferencesRecord {
  id?: number;
  userId: number;
  goalType?: string;
  targetWeight?: number;
  sessionsPerWeek?: number;
  trainingLocation?: string;
  availableTools?: string;
  targetMuscleGroups?: string;
  experienceLevel?: string;
  deleted?: boolean;
}

export interface HealthConditionRecord {
  id?: number;
  name: string;
  type: string;
  description?: string;
}

export interface UserHealthConstraintRecord {
  id?: number;
  userId: number;
  conditionId: number;
  severityNotes?: string;
  deleted?: boolean;
}

export interface WorkoutProgramRecord {
  id?: number;
  userId?: number;
  name: string;
  description?: string;
  goalType?: string;
  durationWeeks?: number;
  difficultyLevel?: string;
  isAiGenerated?: boolean;
  deleted?: boolean;
}

export interface WorkoutTemplateRecord {
  id?: number;
  programId: number;
  dayNumber: number;
  focusArea?: string;
  estimatedDurationMins?: number;
  deleted?: boolean;
}

export interface ExerciseRecord {
  id?: number;
  name: string;
  type?: string;
  primaryMuscleGroup?: string;
  equipment?: string;
  difficulty?: string;
  videoUrl?: string;
  deleted?: boolean;
}

export interface WorkoutTemplateExerciseRecord {
  id?: number;
  templateId: number;
  exerciseId: number;
  orderIndex?: number;
  targetSets?: number;
  targetReps?: number;
  targetDurationSec?: number;
  restTimeSec?: number;
}

export interface UserWorkoutScheduleRecord {
  id?: number;
  userId: number;
  templateId: number;
  scheduledDate: string;
  status?: string;
  completedAt?: string;
  totalCaloriesBurned?: number;
  rating?: number;
  deleted?: boolean;
}

export interface WorkoutSessionExerciseRecord {
  id?: number;
  scheduleId: number;
  exerciseId: number;
  isExtra?: boolean;
  orderIndex?: number;
  notes?: string;
}

export interface WorkoutSessionSetRecord {
  id?: number;
  sessionExerciseId: number;
  setNumber: number;
  reps?: number;
  weightKg?: number;
  durationSec?: number;
  completedAt?: string;
}

export interface IngredientRecord {
  id?: number;
  name: string;
  category?: string;
  caloriesPer100g?: number;
  proteinPer100g?: number;
  carbsPer100g?: number;
  fatPer100g?: number;
  deleted?: boolean;
}

export interface RecipeRecord {
  id?: number;
  name: string;
  mealType?: string;
  instructions?: string;
  totalCalories?: number;
  prepTimeMins?: number;
  imageUrl?: string;
  deleted?: boolean;
}

export interface RecipeIngredientRecord {
  id?: number;
  recipeId: number;
  ingredientId: number;
  quantity?: number;
  unit?: string;
}

export interface UserDailyNutritionRecord {
  id?: number;
  userId: number;
  date: string;
  totalCalories?: number;
  totalProtein?: number;
  totalCarbs?: number;
  totalFat?: number;
  metricsData?: string;
  deleted?: boolean;
}

export interface ChatLogRecord {
  id?: number;
  userId: number;
  sessionId?: string;
  role: string;
  message: string;
  createdAt?: string;
}

export interface SymptomRecord {
  id?: number;
  name: string;
  description?: string;
}

export interface ConditionSymptomRecord {
  conditionId: number;
  symptomId: number;
  significance?: string;
}

export interface HealthRecommendationRecord {
  id?: number;
  conditionId: number;
  type: string;
  title?: string;
  content?: string;
  isAiGenerated?: boolean;
  verifiedByAdmin?: boolean;
}

export interface RefreshTokenRecord {
  id?: number;
  userId: number;
  token: string;
  expiresAt: string;
  revoked?: boolean;
}

export interface MembershipTierRecord {
  id?: number;
  name: string;
  price?: number;
}

export interface SubscriptionRecord {
  id?: number;
  userId: number;
  plan?: string;
  startDate: string;
  endDate?: string;
  status?: string;
  deleted?: boolean;
}

export interface PaymentRecord {
  id?: number;
  userId: number;
  subscriptionId?: number;
  amount: number;
  currency?: string;
  transactionId?: string;
  status?: string;
}

export interface SystemMessageRecord {
  id?: number;
  title: string;
  body: string;
  createdAt?: string;
}

export class AppDatabase extends Dexie {
  users!: Table<UserRecord>;
  userPhysicalStats!: Table<UserPhysicalStatsRecord>;
  userPreferences!: Table<UserPreferencesRecord>;
  healthConditions!: Table<HealthConditionRecord>;
  userHealthConstraints!: Table<UserHealthConstraintRecord>;
  workoutPrograms!: Table<WorkoutProgramRecord>;
  workoutTemplates!: Table<WorkoutTemplateRecord>;
  exercises!: Table<ExerciseRecord>;
  workoutTemplateExercises!: Table<WorkoutTemplateExerciseRecord>;
  userWorkoutSchedule!: Table<UserWorkoutScheduleRecord>;
  workoutSessionExercises!: Table<WorkoutSessionExerciseRecord>;
  workoutSessionSets!: Table<WorkoutSessionSetRecord>;
  ingredients!: Table<IngredientRecord>;
  recipes!: Table<RecipeRecord>;
  recipeIngredients!: Table<RecipeIngredientRecord>;
  userDailyNutrition!: Table<UserDailyNutritionRecord>;
  chatLogs!: Table<ChatLogRecord>;
  symptoms!: Table<SymptomRecord>;
  conditionSymptoms!: Table<ConditionSymptomRecord>;
  healthRecommendations!: Table<HealthRecommendationRecord>;
  refreshTokens!: Table<RefreshTokenRecord>;
  membershipTiers!: Table<MembershipTierRecord>;
  subscriptions!: Table<SubscriptionRecord>;
  payments!: Table<PaymentRecord>;
  systemMessages!: Table<SystemMessageRecord>;

  constructor() {
    super("anes-local");
    this.version(1).stores({
      users: "++id,email,deleted",
      userPhysicalStats: "++id,userId,recordedAt,deleted",
      userPreferences: "++id,userId,deleted",
      healthConditions: "++id,name,type",
      userHealthConstraints: "++id,userId,conditionId,deleted",
      workoutPrograms: "++id,userId,goalType,deleted",
      workoutTemplates: "++id,programId,dayNumber,deleted",
      exercises: "++id,name,primaryMuscleGroup,deleted",
      workoutTemplateExercises: "++id,templateId,exerciseId",
      userWorkoutSchedule: "++id,userId,scheduledDate,status,deleted",
      workoutSessionExercises: "++id,scheduleId,exerciseId",
      workoutSessionSets: "++id,sessionExerciseId,setNumber",
      ingredients: "++id,name,category,deleted",
      recipes: "++id,name,mealType,deleted",
      recipeIngredients: "++id,recipeId,ingredientId",
      userDailyNutrition: "++id,userId,date,deleted",
      chatLogs: "++id,userId,sessionId,role",
      symptoms: "++id,name",
      conditionSymptoms: "conditionId,symptomId",
      healthRecommendations: "++id,conditionId,type",
      refreshTokens: "++id,userId,token,revoked",
      membershipTiers: "++id,name",
      subscriptions: "++id,userId,plan,status,deleted",
      payments: "++id,userId,subscriptionId,status",
      systemMessages: "++id,title",
    });
  }
}

export const db = new AppDatabase();
