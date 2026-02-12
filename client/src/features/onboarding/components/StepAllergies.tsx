import type { OnboardingData } from '../types/onboarding.types';
import { ChipSelect } from '@/shared/components/ChipSelect';

interface StepAllergiesProps {
  data: OnboardingData;
  updateData: (partial: Partial<OnboardingData>) => void;
  getError: (field: string) => string | null;
}

const allergyOptions = [
  'Nuts',
  'Dairy',
  'Eggs',
  'Seafood',
  'Gluten',
  'Keto',
  'Vegan',
  'Vegetarian',
  'Low Carb',
  'No Preference',
];

export function StepAllergies({ data, updateData, getError }: StepAllergiesProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">
          Diet preferences & allergies
        </h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          We&apos;ll personalise meal suggestions for you
        </p>
      </div>

      <ChipSelect
        options={allergyOptions}
        selected={data.allergies}
        onChange={(v) => updateData({ allergies: v })}
        noneLabel="None"
        allowOther
        otherLabel="Other preference…"
      />

      {getError('allergies') && (
        <p className="text-xs text-[var(--negative)]" role="alert">
          {getError('allergies')}
        </p>
      )}
    </div>
  );
}
