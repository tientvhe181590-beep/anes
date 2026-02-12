export interface DashboardMacros {
  protein: number;
  carbs: number;
  fat: number;
}

export interface DashboardStreak {
  currentDays: number;
  lastWorkoutDate: string | null;
}

export interface DashboardTodayWorkout {
  scheduleId: number;
  title: string;
  estimatedDurationMins: number;
  exerciseCount: number;
  status: string;
}

export type WeekDayStatus = 'completed' | 'today' | 'upcoming' | 'rest';

export interface WeekDayEntry {
  day: string;
  status: WeekDayStatus;
}

export interface DashboardSummary {
  calorieTarget: number;
  caloriesConsumed: number;
  macros: DashboardMacros;
  streak: DashboardStreak;
  todayWorkout: DashboardTodayWorkout | null;
  weekSchedule: WeekDayEntry[];
}
