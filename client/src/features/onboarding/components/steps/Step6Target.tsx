import { Target } from 'lucide-react';
import OnboardingLayout from '../OnboardingLayout';
import { useState } from 'react';

/**
 * Basic toggle component
 */
const UnitToggle = ({ value, onChange, options }: { value: string, onChange: (v: string) => void, options: string[] }) => (
    <div className="flex rounded-md bg-[#2a2a2a] p-1">
        {options.map((opt) => (
            <button
                key={opt}
                onClick={() => onChange(opt)}
                className={`rounded px-3 py-1 text-xs font-semibold uppercase transition-all
          ${value === opt
                        ? 'bg-[#3a3a3a] text-white shadow-sm'
                        : 'text-[#8a8a8a] hover:text-[#b0b0b0]'
                    }`}
            >
                {opt}
            </button>
        ))}
    </div>
);

export default function Step6Target({
    onNext,
    onBack,
    initialTarget = '',
    initialUnit = 'kg'
}: { onNext: (target: any) => void, onBack: () => void, initialTarget?: string, initialUnit?: string }) {

    const [targetValue, setTargetValue] = useState(initialTarget);
    const [unit, setUnit] = useState(initialUnit);

    const isValid = targetValue && parseInt(targetValue) > 0;

    return (
        <OnboardingLayout
            title="Target Weight"
            subtitle="What is your goal weight?"
            currentStep={6}
            totalSteps={8}
            onNext={() => onNext({ target: targetValue, unit })}
            onBack={onBack}
            isNextDisabled={!isValid}
        >
            <div className="flex flex-col items-center pt-8">

                <div className="mb-6">
                    <UnitToggle value={unit} onChange={setUnit} options={['kg', 'lbs']} />
                </div>

                {/* Huge Input Style Match Step 2 */}
                <div className="relative mb-4 flex items-center justify-center">
                    <input
                        type="number"
                        value={targetValue}
                        onChange={(e) => setTargetValue(e.target.value)}
                        placeholder="70"
                        className="w-full min-w-[200px] border-none bg-transparent text-center font-['Sora'] text-[80px] font-bold leading-none tracking-tight text-white placeholder-[#2a2a2a] outline-none drop-shadow-xl"
                        autoFocus
                    />
                    <span className="absolute -right-12 bottom-4 text-xl font-medium text-[#525252]">
                        {unit}
                    </span>
                </div>

                <div className="mt-8 flex items-center gap-2 rounded-lg bg-[#1a1a1a] px-4 py-3 text-sm text-[#8a8a8a]">
                    <Target className="h-4 w-4 text-[#ff3b30]" />
                    <span>We'll adjust your daily calories to reach this.</span>
                </div>
            </div>
        </OnboardingLayout>
    );
}
