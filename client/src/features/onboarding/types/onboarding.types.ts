export type Gender = 'Male' | 'Female';

export type GoalType = 'WeightLoss' | 'WeightGain' | 'MuscleGain' | 'StayFit';

export type ExperienceLevel = 'Basic' | 'Intermediate' | 'Advanced';

export type TrainingLocation = 'Home' | 'Gym';

export type MuscleGroup = 'Chest' | 'Back' | 'Legs' | 'Arms' | 'Shoulders' | 'Core';

export interface OnboardingData {
  // Step 1: Basics
  name: string;
  gender: Gender | null;

  // Step 2: Stats
  age: number | null;
  heightCm: number;
  weightKg: number;

  // Step 3: Goal
  goal: GoalType | null;
  targetWeightKg: number | null;
  targetMuscleGroups: MuscleGroup[];

  // Step 4: Experience
  experienceLevel: ExperienceLevel | null;

  // Step 5: Injuries
  injuries: string[];

  // Step 6: Allergies
  allergies: string[];

  // Step 7: Availability & Equipment
  trainingDaysPerWeek: number | null;
  trainingLocation: TrainingLocation | null;
  equipment: string[];
}

export const INITIAL_ONBOARDING_DATA: OnboardingData = {
  name: '',
  gender: null,
  age: null,
  heightCm: 170,
  weightKg: 70,
  goal: null,
  targetWeightKg: null,
  targetMuscleGroups: [],
  experienceLevel: null,
  injuries: [],
  allergies: [],
  trainingDaysPerWeek: null,
  trainingLocation: null,
  equipment: [],
};

export interface OnboardingRequest {
  name: string;
  gender: string;
  age: number;
  heightCm: number;
  weightKg: number;
  goal: string;
  targetWeightKg: number | null;
  targetMuscleGroups: string[] | null;
  experienceLevel: string;
  injuries: string[];
  allergies: string[];
  dietPreferences: string[];
  trainingDaysPerWeek: number;
  trainingLocation: string;
  equipment: string[];
}

export interface OnboardingResponse {
  bmi: number;
  bmr: number;
  tdee: number;
  calorieTarget: number;
  planSummary: {
    programName: string;
    durationWeeks: number;
    daysPerWeek: number;
    focusAreas: string[];
  };
}
