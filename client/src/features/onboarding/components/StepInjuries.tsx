import type { OnboardingData } from '../types/onboarding.types';
import { ChipSelect } from '@/shared/components/ChipSelect';

interface StepInjuriesProps {
  data: OnboardingData;
  updateData: (partial: Partial<OnboardingData>) => void;
  getError: (field: string) => string | null;
}

const injuryOptions = [
  'Knee Injury',
  'Back Injury',
  'Shoulder Injury',
  'Wrist Injury',
  'Ankle Injury',
];

export function StepInjuries({ data, updateData, getError }: StepInjuriesProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">
          Any injuries or limitations?
        </h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          We&apos;ll avoid exercises that could aggravate these
        </p>
      </div>

      <ChipSelect
        options={injuryOptions}
        selected={data.injuries}
        onChange={(v) => updateData({ injuries: v })}
        noneLabel="None"
        allowOther
        otherLabel="Other injury…"
      />

      {getError('injuries') && (
        <p className="text-xs text-[var(--negative)]" role="alert">
          {getError('injuries')}
        </p>
      )}
    </div>
  );
}
