import type { OnboardingData, ExperienceLevel } from '../types/onboarding.types';

interface StepExperienceProps {
  data: OnboardingData;
  updateData: (partial: Partial<OnboardingData>) => void;
  getError: (field: string) => string | null;
}

const levels: {
  id: ExperienceLevel;
  label: string;
  emoji: string;
  desc: string;
}[] = [
  {
    id: 'Basic',
    label: 'Beginner',
    emoji: '🌱',
    desc: 'New to working out or getting back into it',
  },
  {
    id: 'Intermediate',
    label: 'Intermediate',
    emoji: '🏋️',
    desc: 'Consistent training for 6+ months',
  },
  {
    id: 'Advanced',
    label: 'Advanced',
    emoji: '🏆',
    desc: 'Years of training experience with solid form',
  },
];

export function StepExperience({ data, updateData, getError }: StepExperienceProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Experience level</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          This helps us tailor workout difficulty
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {levels.map((level) => {
          const active = data.experienceLevel === level.id;
          return (
            <button
              key={level.id}
              type="button"
              onClick={() => updateData({ experienceLevel: level.id })}
              className={`flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-colors ${
                active
                  ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                  : 'border-[var(--border)] bg-[var(--surface)]'
              }`}
            >
              <span className="text-3xl">{level.emoji}</span>
              <div className="flex-1">
                <p
                  className={`text-base font-semibold ${
                    active ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'
                  }`}
                >
                  {level.label}
                </p>
                <p className="mt-0.5 text-xs text-[var(--text-secondary)]">{level.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {getError('experienceLevel') && (
        <p className="text-xs text-[var(--negative)]" role="alert">
          {getError('experienceLevel')}
        </p>
      )}
    </div>
  );
}
