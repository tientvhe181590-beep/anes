import { useAuthStore } from '@/app/store';
import { useDashboard } from '../hooks/useDashboard';
import { CalorieProgress } from './CalorieProgress';
import { MacrosSummary } from './MacrosSummary';
import { TodayWorkoutCard } from './TodayWorkoutCard';
import { WeekScheduleBar } from './WeekScheduleBar';
import { StreakCounter } from './StreakCounter';

export function DashboardScreen() {
  const user = useAuthStore((s) => s.user);
  const { summary, isLoading, isError, refetch } = useDashboard();

  const greeting = getGreeting();
  const firstName = user?.fullName?.split(' ')[0] ?? 'there';

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 px-4 py-6">
        <div className="h-6 w-40 animate-pulse rounded bg-[var(--surface-elevated)]" />
        <div className="mx-auto h-[180px] w-[180px] animate-pulse rounded-full bg-[var(--surface-elevated)]" />
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 flex-1 animate-pulse rounded-xl bg-[var(--surface-elevated)]"
            />
          ))}
        </div>
        <div className="h-20 animate-pulse rounded-2xl bg-[var(--surface-elevated)]" />
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div
              key={i}
              className="h-12 flex-1 animate-pulse rounded-full bg-[var(--surface-elevated)]"
            />
          ))}
        </div>
        <div className="h-16 animate-pulse rounded-2xl bg-[var(--surface-elevated)]" />
      </div>
    );
  }

  if (isError || !summary) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-4 py-20">
        <p className="text-sm text-[var(--text-secondary)]">Something went wrong. Pull to retry.</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 px-4 py-6">
      {/* Greeting header */}
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">
          {greeting}, {firstName} 👋
        </h1>
        <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
          Here&apos;s your daily overview
        </p>
      </div>

      {/* Calorie circular progress */}
      <CalorieProgress consumed={summary.caloriesConsumed} target={summary.calorieTarget} />

      {/* Macros summary */}
      <MacrosSummary macros={summary.macros} />

      {/* Today's workout */}
      <div>
        <h2 className="mb-2 text-sm font-semibold text-[var(--text-primary)]">
          Today&apos;s Workout
        </h2>
        <TodayWorkoutCard workout={summary.todayWorkout} />
      </div>

      {/* Weekly schedule */}
      <div>
        <h2 className="mb-2 text-sm font-semibold text-[var(--text-primary)]">This Week</h2>
        <WeekScheduleBar schedule={summary.weekSchedule} />
      </div>

      {/* Streak counter */}
      <StreakCounter streak={summary.streak} />
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}
