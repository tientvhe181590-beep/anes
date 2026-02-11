import { Flame } from 'lucide-react';

interface StreakWidgetProps {
  streakDays: number;
}

export function StreakWidget({ streakDays }: StreakWidgetProps) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-[var(--surface)] p-4 text-[var(--text-primary)]">
      <div className="rounded-full bg-[var(--surface-elevated)] p-2">
        <Flame className="h-6 w-6 text-[var(--accent)]" />
      </div>
      <div>
        <p className="text-sm font-medium text-[var(--text-secondary)]">Current Streak</p>
        <p className="text-2xl font-bold">{streakDays} Days</p>
      </div>
    </div>
  );
}
