/**
 * Client-side BMR / TDEE / calorie target calculations.
 * Mirrors the server-side Mifflin-St Jeor implementation.
 */

export type Gender = "Male" | "Female";
export type ActivityLevel = "Low" | "Medium" | "High";
export type GoalType = "WeightLoss" | "WeightGain" | "MuscleGain" | "StayFit";

const ACTIVITY_MULTIPLIER: Record<ActivityLevel, number> = {
  Low: 1.2,
  Medium: 1.55,
  High: 1.725,
};

const GOAL_ADJUSTMENT: Record<GoalType, number> = {
  WeightLoss: -500,
  WeightGain: 500,
  MuscleGain: 300,
  StayFit: 0,
};

/**
 * Mifflin-St Jeor BMR calculation.
 *
 * Male:   (10 × weight_kg) + (6.25 × height_cm) − (5 × age) + 5
 * Female: (10 × weight_kg) + (6.25 × height_cm) − (5 × age) − 161
 */
export function calculateBMR(
  gender: Gender,
  weightKg: number,
  heightCm: number,
  age: number,
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return gender === "Male" ? base + 5 : base - 161;
}

/** TDEE = BMR × activity multiplier. */
export function calculateTDEE(bmr: number, activity: ActivityLevel): number {
  return bmr * ACTIVITY_MULTIPLIER[activity];
}

/** Calorie target = TDEE ± goal adjustment. */
export function calculateCalorieTarget(
  tdee: number,
  goal: GoalType,
): number {
  return tdee + GOAL_ADJUSTMENT[goal];
}

/**
 * All-in-one: BMR → TDEE → calorie target.
 */
export function calculateAll(params: {
  gender: Gender;
  weightKg: number;
  heightCm: number;
  age: number;
  activity: ActivityLevel;
  goal: GoalType;
}): { bmr: number; tdee: number; calorieTarget: number } {
  const bmr = calculateBMR(
    params.gender,
    params.weightKg,
    params.heightCm,
    params.age,
  );
  const tdee = calculateTDEE(bmr, params.activity);
  const calorieTarget = calculateCalorieTarget(tdee, params.goal);
  return { bmr, tdee, calorieTarget };
}
