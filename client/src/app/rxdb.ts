import { createRxDatabase, type RxDatabase, type RxCollection } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { createContext, useContext } from 'react';

import {
  userSchema,
  userPhysicalStatsSchema,
  userPreferencesSchema,
  healthConditionsSchema,
  userHealthConstraintsSchema,
  workoutProgramsSchema,
  workoutTemplatesSchema,
  exercisesSchema,
  workoutTemplateExercisesSchema,
  userWorkoutScheduleSchema,
  workoutSessionExercisesSchema,
  workoutSessionSetsSchema,
  ingredientsSchema,
  recipesSchema,
  recipeIngredientsSchema,
  userDailyNutritionSchema,
} from './schemas';

import type {
  User,
  UserPhysicalStats,
  UserPreferences,
  HealthCondition,
  UserHealthConstraint,
  WorkoutProgram,
  WorkoutTemplate,
  Exercise,
  WorkoutTemplateExercise,
  UserWorkoutSchedule,
  WorkoutSessionExercise,
  WorkoutSessionSet,
  Ingredient,
  Recipe,
  RecipeIngredient,
  UserDailyNutrition,
} from './schemas';

/**
 * Typed database collections map.
 */
export type AnesCollections = {
  users: RxCollection<User>;
  user_physical_stats: RxCollection<UserPhysicalStats>;
  user_preferences: RxCollection<UserPreferences>;
  health_conditions: RxCollection<HealthCondition>;
  user_health_constraints: RxCollection<UserHealthConstraint>;
  workout_programs: RxCollection<WorkoutProgram>;
  workout_templates: RxCollection<WorkoutTemplate>;
  exercises: RxCollection<Exercise>;
  workout_template_exercises: RxCollection<WorkoutTemplateExercise>;
  user_workout_schedule: RxCollection<UserWorkoutSchedule>;
  workout_session_exercises: RxCollection<WorkoutSessionExercise>;
  workout_session_sets: RxCollection<WorkoutSessionSet>;
  ingredients: RxCollection<Ingredient>;
  recipes: RxCollection<Recipe>;
  recipe_ingredients: RxCollection<RecipeIngredient>;
  user_daily_nutrition: RxCollection<UserDailyNutrition>;
};

export type AnesDatabase = RxDatabase<AnesCollections>;

type GlobalRxDbCache = {
  __anes_rxdb_promise__?: Promise<AnesDatabase> | null;
};

const globalCache = globalThis as GlobalRxDbCache;

let dbPromise: Promise<AnesDatabase> | null = globalCache.__anes_rxdb_promise__ ?? null;

/**
 * Initialize or return the singleton RxDB database.
 * Uses Dexie (IndexedDB) storage adapter.
 */
export async function getDatabase(): Promise<AnesDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = createRxDatabase<AnesCollections>({
    name: 'anes_db',
    storage: getRxStorageDexie(),
    multiInstance: true,
    eventReduce: true,
  }).then(async (db) => {
    const hasCollections = Object.keys(db.collections).length > 0;
    if (!hasCollections) {
      await db.addCollections({
        users: { schema: userSchema },
        user_physical_stats: { schema: userPhysicalStatsSchema },
        user_preferences: { schema: userPreferencesSchema },
        health_conditions: { schema: healthConditionsSchema },
        user_health_constraints: { schema: userHealthConstraintsSchema },
        workout_programs: { schema: workoutProgramsSchema },
        workout_templates: { schema: workoutTemplatesSchema },
        exercises: { schema: exercisesSchema },
        workout_template_exercises: { schema: workoutTemplateExercisesSchema },
        user_workout_schedule: { schema: userWorkoutScheduleSchema },
        workout_session_exercises: { schema: workoutSessionExercisesSchema },
        workout_session_sets: { schema: workoutSessionSetsSchema },
        ingredients: { schema: ingredientsSchema },
        recipes: { schema: recipesSchema },
        recipe_ingredients: { schema: recipeIngredientsSchema },
        user_daily_nutrition: { schema: userDailyNutritionSchema },
      });
    }

    return db;
  });

  globalCache.__anes_rxdb_promise__ = dbPromise;

  return dbPromise;
}

// React context for database access
export const DatabaseContext = createContext<AnesDatabase | null>(null);

/**
 * Hook to access the RxDB database instance.
 * Must be used within a DatabaseProvider.
 */
export function useDatabase(): AnesDatabase {
  const db = useContext(DatabaseContext);
  if (!db) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return db;
}
