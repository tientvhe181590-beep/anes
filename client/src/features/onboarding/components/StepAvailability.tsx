import type { OnboardingData, TrainingLocation } from '../types/onboarding.types';
import { ChipSelect } from '@/shared/components/ChipSelect';

interface StepAvailabilityProps {
  data: OnboardingData;
  updateData: (partial: Partial<OnboardingData>) => void;
  getError: (field: string) => string | null;
}

const daysOptions = [2, 3, 4, 5, 6];

const equipmentOptions = ['Dumbbells', 'Resistance Bands', 'Yoga Mat', 'Pull-up Bar'];

export function StepAvailability({ data, updateData, getError }: StepAvailabilityProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Availability & equipment</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          How often and where do you train?
        </p>
      </div>

      {/* Training days */}
      <div>
        <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
          Training days per week
        </label>
        <div className="flex gap-2">
          {daysOptions.map((d) => {
            const active = data.trainingDaysPerWeek === d;
            return (
              <button
                key={d}
                type="button"
                onClick={() => updateData({ trainingDaysPerWeek: d })}
                className={`flex h-11 w-11 items-center justify-center rounded-xl border-2 text-sm font-semibold transition-colors ${
                  active
                    ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                    : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)]'
                }`}
              >
                {d}
              </button>
            );
          })}
        </div>
        {getError('trainingDaysPerWeek') && (
          <p className="mt-1 text-xs text-[var(--negative)]" role="alert">
            {getError('trainingDaysPerWeek')}
          </p>
        )}
      </div>

      {/* Training location */}
      <div>
        <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
          Where do you train?
        </label>
        <div className="flex gap-3">
          {(['Home', 'Gym'] as TrainingLocation[]).map((loc) => {
            const active = data.trainingLocation === loc;
            return (
              <button
                key={loc}
                type="button"
                onClick={() => updateData({ trainingLocation: loc })}
                className={`flex-1 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-colors ${
                  active
                    ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                    : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)]'
                }`}
              >
                {loc === 'Home' ? '🏠' : '🏋️'} {loc}
              </button>
            );
          })}
        </div>
        {getError('trainingLocation') && (
          <p className="mt-1 text-xs text-[var(--negative)]" role="alert">
            {getError('trainingLocation')}
          </p>
        )}
      </div>

      {/* Equipment */}
      <div>
        <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
          Available equipment
        </label>
        <ChipSelect
          options={equipmentOptions}
          selected={data.availableEquipment}
          onChange={(v) => updateData({ availableEquipment: v })}
          noneLabel="None"
        />
      </div>
    </div>
  );
}
