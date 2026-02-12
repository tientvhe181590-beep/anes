import { RulerSlider } from '@/shared/components/RulerSlider';
import type { OnboardingData } from '../types/onboarding.types';

interface StepTargetWeightProps {
  data: OnboardingData;
  updateData: (partial: Partial<OnboardingData>) => void;
  getError: (field: string) => string | null;
}

export function StepTargetWeight({ data, updateData, getError }: StepTargetWeightProps) {
  const label =
    data.goal === 'WeightLoss' ? "What's your target weight?" : 'What weight do you want to reach?';

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">{label}</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Current weight: {data.weightKg} kg
        </p>
      </div>

      <RulerSlider
        label="Target Weight"
        unit="kg"
        min={30}
        max={200}
        step={0.5}
        value={data.targetWeightKg ?? data.weightKg}
        onChange={(v) => updateData({ targetWeightKg: v })}
      />

      {getError('targetWeightKg') && (
        <p className="text-center text-xs text-[var(--negative)]" role="alert">
          {getError('targetWeightKg')}
        </p>
      )}
    </div>
  );
}
