interface CalorieProgressProps {
  consumed: number;
  target: number;
}

const RADIUS = 70;
const STROKE = 10;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function CalorieProgress({ consumed, target }: CalorieProgressProps) {
  const ratio = target > 0 ? Math.min(consumed / target, 1) : 0;
  const offset = CIRCUMFERENCE - ratio * CIRCUMFERENCE;
  const overTarget = consumed > target && target > 0;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        width={180}
        height={180}
        viewBox={`0 0 ${(RADIUS + STROKE) * 2} ${(RADIUS + STROKE) * 2}`}
        className="-rotate-90"
      >
        {/* Background ring */}
        <circle
          cx={RADIUS + STROKE}
          cy={RADIUS + STROKE}
          r={RADIUS}
          fill="none"
          stroke="var(--border)"
          strokeWidth={STROKE}
        />
        {/* Progress ring */}
        <circle
          cx={RADIUS + STROKE}
          cy={RADIUS + STROKE}
          r={RADIUS}
          fill="none"
          stroke={overTarget ? "var(--negative)" : "var(--accent)"}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-500"
        />
      </svg>

      {/* Center text overlay */}
      <div className="-mt-[124px] mb-[44px] flex flex-col items-center">
        <span className="text-3xl font-bold text-[var(--text-primary)]">
          {consumed}
        </span>
        <span className="text-xs text-[var(--text-secondary)]">
          of {target} kcal
        </span>
      </div>
    </div>
  );
}
