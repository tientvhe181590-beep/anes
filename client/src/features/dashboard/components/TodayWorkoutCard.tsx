import { useNavigate } from "react-router";
import type { DashboardTodayWorkout } from "../types/dashboard.types";

interface TodayWorkoutCardProps {
  workout: DashboardTodayWorkout | null;
}

export function TodayWorkoutCard({ workout }: TodayWorkoutCardProps) {
  const navigate = useNavigate();

  if (!workout) {
    return (
      <div className="rounded-2xl bg-[var(--surface-elevated)] p-4">
        <p className="text-sm font-semibold text-[var(--text-primary)]">
          Rest Day
        </p>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">
          Recover and come back stronger 💤
        </p>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => navigate("/workouts")}
      className="flex w-full items-center justify-between rounded-2xl bg-[var(--surface-elevated)] p-4 text-left transition-colors active:bg-[var(--border)]"
    >
      <div className="flex-1">
        <p className="text-sm font-semibold text-[var(--text-primary)]">
          {workout.title}
        </p>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">
          {workout.estimatedDurationMins} min · {workout.exerciseCount} exercises
        </p>
      </div>

      <span className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-white">
        Start
      </span>
    </button>
  );
}
