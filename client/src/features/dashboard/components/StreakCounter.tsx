import type { DashboardStreak } from '../types/dashboard.types';

interface StreakCounterProps {
  streak: DashboardStreak;
}

export function StreakCounter({ streak }: StreakCounterProps) {
  const active = streak.currentDays > 0;

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-[var(--surface-elevated)] p-4">
      <span className={`text-2xl ${active ? '' : 'opacity-40'}`}>🔥</span>

      <div className="flex-1">
        {active ? (
          <>
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {streak.currentDays} Day Streak
            </p>
            {streak.lastWorkoutDate && (
              <p className="text-xs text-[var(--text-secondary)]">
                Last workout: {streak.lastWorkoutDate}
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-[var(--text-secondary)]">Start your streak!</p>
        )}
      </div>
    </div>
  );
}
