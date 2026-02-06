import { Flame, Utensils } from 'lucide-react';

interface CalorieProgressWidgetProps {
  consumed: number;
  target: number;
  burned?: number;
}

export function CalorieProgressWidget({
  consumed,
  target,
  burned = 0,
}: CalorieProgressWidgetProps) {
  const left = Math.max(0, target - consumed);
  const percentage = Math.min(100, Math.max(0, (consumed / target) * 100));
  const radius = 30; // Smaller radius for the card
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex w-full gap-4">
      {/* Card 1: Eaten & Left */}
      <div className="relative flex flex-1 flex-col justify-between rounded-2xl bg-[var(--surface)] p-4 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-[var(--text-secondary)]">Eaten</span>
            <span className="text-2xl font-semibold text-[var(--accent)]">{consumed}</span>
            <span className="text-xs text-[var(--text-secondary)]">kcal</span>
          </div>
          {/* Mini Progress Circle */}
          <div className="relative h-16 w-16">
            <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 80 80">
              <circle
                cx="40"
                cy="40"
                r={radius}
                stroke="var(--surface-elevated)"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="40"
                cy="40"
                r={radius}
                stroke="var(--accent)"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
        <div className="mt-2">
          <span className="text-sm text-[var(--text-secondary)]">Left: </span>
          <span className="font-semibold text-[var(--text-primary)]">{left}</span>
          <span className="text-xs text-[var(--text-secondary)]"> kcal</span>
        </div>
      </div>

      {/* Card 2: Burned */}
      <div className="flex flex-1 flex-col justify-between rounded-2xl bg-[var(--surface)] p-4 shadow-sm">
        <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/20 text-orange-500">
          <Flame size={18} fill="currentColor" />
        </div>
        <div>
          <span className="text-sm font-medium text-[var(--text-secondary)]">Burned</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-semibold text-[var(--text-primary)]">{burned}</span>
            <span className="text-xs text-[var(--text-secondary)]">kcal</span>
          </div>
        </div>
      </div>
    </div>
  );
}
