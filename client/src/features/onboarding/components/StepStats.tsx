import { RulerSlider } from "@/shared/components/RulerSlider";
import type { OnboardingData } from "../types/onboarding.types";

interface StepStatsProps {
  data: OnboardingData;
  updateData: (partial: Partial<OnboardingData>) => void;
  getError: (field: string) => string | null;
}

export function StepStats({ data, updateData, getError }: StepStatsProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">
          Your physical stats
        </h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          We'll use these to personalize your plan
        </p>
      </div>

      {/* Age */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="age"
          className="text-sm font-medium text-[var(--text-secondary)]"
        >
          Age
        </label>
        <input
          id="age"
          type="number"
          inputMode="numeric"
          min={13}
          max={99}
          placeholder="25"
          value={data.age ?? ""}
          onChange={(e) => {
            const val = e.target.value ? parseInt(e.target.value, 10) : null;
            updateData({ age: val });
          }}
          className={`h-12 rounded-xl border bg-[var(--surface)] px-4 text-base text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] ${
            getError("age")
              ? "border-[var(--negative)]"
              : "border-[var(--border)]"
          }`}
        />
        {getError("age") && (
          <p className="text-xs text-[var(--negative)]" role="alert">
            {getError("age")}
          </p>
        )}
      </div>

      {/* Height ruler */}
      <RulerSlider
        label="Height"
        unit="cm"
        min={100}
        max={220}
        step={1}
        value={data.heightCm}
        onChange={(v) => updateData({ heightCm: v })}
      />
      {getError("heightCm") && (
        <p className="-mt-2 text-center text-xs text-[var(--negative)]" role="alert">
          {getError("heightCm")}
        </p>
      )}

      {/* Weight ruler */}
      <RulerSlider
        label="Weight"
        unit="kg"
        min={30}
        max={200}
        step={0.5}
        value={data.weightKg}
        onChange={(v) => updateData({ weightKg: v })}
      />
      {getError("weightKg") && (
        <p className="-mt-2 text-center text-xs text-[var(--negative)]" role="alert">
          {getError("weightKg")}
        </p>
      )}
    </div>
  );
}
