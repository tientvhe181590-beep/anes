// RxDB Schema barrel - re-export all schemas for database initialization
export { userSchema, type User } from './users.schema';
export { userPhysicalStatsSchema, type UserPhysicalStats } from './user-physical-stats.schema';
export { userPreferencesSchema, type UserPreferences } from './user-preferences.schema';
export { healthConditionsSchema, type HealthCondition } from './health-conditions.schema';
export {
  userHealthConstraintsSchema,
  type UserHealthConstraint,
} from './user-health-constraints.schema';
export { workoutProgramsSchema, type WorkoutProgram } from './workout-programs.schema';
export { workoutTemplatesSchema, type WorkoutTemplate } from './workout-templates.schema';
export { exercisesSchema, type Exercise } from './exercises.schema';
export {
  workoutTemplateExercisesSchema,
  type WorkoutTemplateExercise,
} from './workout-template-exercises.schema';
export {
  userWorkoutScheduleSchema,
  type UserWorkoutSchedule,
} from './user-workout-schedule.schema';
export {
  workoutSessionExercisesSchema,
  type WorkoutSessionExercise,
} from './workout-session-exercises.schema';
export { workoutSessionSetsSchema, type WorkoutSessionSet } from './workout-session-sets.schema';
export { ingredientsSchema, type Ingredient } from './ingredients.schema';
export { recipesSchema, type Recipe } from './recipes.schema';
export { recipeIngredientsSchema, type RecipeIngredient } from './recipe-ingredients.schema';
export { userDailyNutritionSchema, type UserDailyNutrition } from './user-daily-nutrition.schema';
export { chatLogsSchema, type ChatLog } from './chat-logs.schema';
