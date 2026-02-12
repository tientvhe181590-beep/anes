import { FormInput } from '@/shared/components/FormInput';
import type { OnboardingData, Gender } from '../types/onboarding.types';

interface StepBasicsProps {
  data: OnboardingData;
  updateData: (partial: Partial<OnboardingData>) => void;
  getError: (field: string) => string | null;
}

const genders: { value: Gender; label: string }[] = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
];

export function StepBasics({ data, updateData, getError }: StepBasicsProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">What's your name?</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">Let's get to know you</p>
      </div>

      <FormInput
        label="Name"
        type="text"
        placeholder="Enter your name"
        value={data.name}
        onChange={(e) => updateData({ name: e.target.value })}
        error={getError('name') ?? undefined}
        maxLength={255}
        autoComplete="name"
      />

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-[var(--text-secondary)]">Gender</span>
        <div className="flex gap-3">
          {genders.map((g) => (
            <button
              key={g.value}
              type="button"
              onClick={() => updateData({ gender: g.value })}
              className={`flex-1 rounded-xl border py-3 text-sm font-medium transition-colors ${
                data.gender === g.value
                  ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                  : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)]'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
        {getError('gender') && (
          <p className="text-xs text-[var(--negative)]" role="alert">
            {getError('gender')}
          </p>
        )}
      </div>
    </div>
  );
}
