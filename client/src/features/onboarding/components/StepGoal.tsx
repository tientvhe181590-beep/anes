import type { OnboardingData, GoalType } from '../types/onboarding.types';

interface StepGoalProps {
  data: OnboardingData;
  updateData: (partial: Partial<OnboardingData>) => void;
  getError: (field: string) => string | null;
}

const goals: { value: GoalType; label: string; emoji: string; desc: string }[] = [
  { value: 'WeightLoss', label: 'Lose Weight', emoji: '🔥', desc: 'Burn fat and get lean' },
  { value: 'WeightGain', label: 'Gain Weight', emoji: '📈', desc: 'Build mass and size' },
  { value: 'MuscleGain', label: 'Gain Muscle', emoji: '💪', desc: 'Build strength and tone' },
  { value: 'StayFit', label: 'Stay Fit', emoji: '✨', desc: 'Maintain your current shape' },
];

export function StepGoal({ data, updateData, getError }: StepGoalProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">What's your goal?</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          We'll customize everything around this
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {goals.map((g) => {
          const active = data.goal === g.value;
          return (
            <button
              key={g.value}
              type="button"
              onClick={() => updateData({ goal: g.value })}
              className={`flex items-center gap-4 rounded-xl border p-4 text-left transition-colors ${
                active
                  ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                  : 'border-[var(--border)] bg-[var(--surface)]'
              }`}
            >
              <span className="text-3xl">{g.emoji}</span>
              <div>
                <p
                  className={`font-semibold ${
                    active ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'
                  }`}
                >
                  {g.label}
                </p>
                <p className="text-xs text-[var(--text-secondary)]">{g.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {getError('goal') && (
        <p className="text-xs text-[var(--negative)]" role="alert">
          {getError('goal')}
        </p>
      )}
    </div>
  );
}
