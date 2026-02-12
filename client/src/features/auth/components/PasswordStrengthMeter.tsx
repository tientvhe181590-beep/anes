import type { StrengthLevel } from '../hooks/usePasswordStrength';

interface PasswordStrengthMeterProps {
  level: StrengthLevel;
  feedback: string;
  /** Whether to show the meter (hide when password is empty) */
  visible: boolean;
}

const LEVEL_CONFIG: Record<
  StrengthLevel,
  { segments: number; color: string; label: string }
> = {
  weak: { segments: 1, color: 'var(--negative)', label: 'Weak' },
  fair: { segments: 2, color: '#F59E0B', label: 'Fair' },
  good: { segments: 3, color: '#EAB308', label: 'Good' },
  strong: { segments: 4, color: 'var(--positive)', label: 'Strong' },
};

export function PasswordStrengthMeter({
  level,
  feedback,
  visible,
}: PasswordStrengthMeterProps) {
  if (!visible) return null;

  const config = LEVEL_CONFIG[level];

  return (
    <div className="mt-2 flex flex-col gap-1.5" role="status" aria-live="polite">
      {/* 4-segment bar */}
      <div className="flex gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-colors duration-200"
            style={{
              backgroundColor: i < config.segments ? config.color : 'var(--border)',
            }}
          />
        ))}
      </div>

      {/* Label + feedback */}
      <div className="flex items-center justify-between text-xs">
        <span style={{ color: config.color }} className="font-medium">
          {config.label}
        </span>
        {feedback && (
          <span className="text-[var(--text-muted)]">{feedback}</span>
        )}
      </div>
    </div>
  );
}
