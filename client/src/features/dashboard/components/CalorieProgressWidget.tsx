interface CalorieProgressWidgetProps {
  consumed: number;
  target: number;
}

export function CalorieProgressWidget({ consumed, target }: CalorieProgressWidgetProps) {
  const percentage = Math.min(100, Math.max(0, (consumed / target) * 100));
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center rounded-xl bg-[var(--surface)] p-6">
      <div className="relative h-40 w-40">
        <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 160 160">
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="var(--surface-elevated)"
            strokeWidth="12"
            fill="transparent"
          />
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="var(--accent)"
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute top-0 left-0 flex h-full w-full flex-col items-center justify-center">
          <span className="text-3xl font-bold text-[var(--text-primary)]">{consumed}</span>
          <span className="text-sm text-[var(--text-secondary)]">/ {target} kcal</span>
        </div>
      </div>
      <h3 className="mt-4 text-lg font-medium text-[var(--text-primary)]">Daily Calories</h3>
    </div>
  );
}
