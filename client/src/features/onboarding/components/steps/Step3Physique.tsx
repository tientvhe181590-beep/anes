import { Ruler, Weight } from 'lucide-react';
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

export default function Step3Physique({
    onNext,
    onBack,
    initialData = { height: '', weight: '', heightUnit: 'cm', weightUnit: 'kg' }
}: {
    onNext: (data: any) => void,
    onBack: () => void,
    initialData?: any
}) {

    const [height, setHeight] = useState(initialData.height);
    const [weight, setWeight] = useState(initialData.weight);
    const [heightUnit, setHeightUnit] = useState(initialData.heightUnit);
    const [weightUnit, setWeightUnit] = useState(initialData.weightUnit);

    const isValid = height && weight;

    return (
        <OnboardingLayout
            title="Height & Weight"
            subtitle="We use these metric to calculate your BMI and recommended program."
            currentStep={3}
            totalSteps={8}
            onNext={() => onNext({ height, weight, heightUnit, weightUnit })}
            onBack={onBack}
            isNextDisabled={!isValid}
        >
            <div className="flex flex-col gap-8">

                {/* Height Input */}
                <div>
                    <div className="mb-3 flex items-center justify-between">
                        <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8a8a8a]">Height</label>
                        <UnitToggle value={heightUnit} onChange={setHeightUnit} options={['cm', 'ft']} />
                    </div>

                    <div className="group relative flex h-20 w-full items-center rounded-2xl bg-[#1a1a1a] px-6 ring-1 ring-[#2a2a2a] transition-all focus-within:ring-[#ff3b30] hover:ring-[#3a3a3a]">
                        <Ruler className="mr-4 h-6 w-6 text-[#525252] group-focus-within:text-white" />
                        <input
                            type="number"
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                            placeholder={heightUnit === 'cm' ? '175' : '5.9'}
                            className="h-full w-full bg-transparent font-['Sora'] text-2xl font-bold text-white placeholder-[#2a2a2a] outline-none"
                        />
                        <span className="text-sm font-bold text-[#525252]">{heightUnit}</span>
                    </div>
                </div>

                {/* Weight Input */}
                <div>
                    <div className="mb-3 flex items-center justify-between">
                        <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8a8a8a]">Weight</label>
                        <UnitToggle value={weightUnit} onChange={setWeightUnit} options={['kg', 'lbs']} />
                    </div>

                    <div className="group relative flex h-20 w-full items-center rounded-2xl bg-[#1a1a1a] px-6 ring-1 ring-[#2a2a2a] transition-all focus-within:ring-[#ff3b30] hover:ring-[#3a3a3a]">
                        <Weight className="mr-4 h-6 w-6 text-[#525252] group-focus-within:text-white" />
                        <input
                            type="number"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            placeholder={weightUnit === 'kg' ? '70' : '150'}
                            className="h-full w-full bg-transparent font-['Sora'] text-2xl font-bold text-white placeholder-[#2a2a2a] outline-none"
                        />
                        <span className="text-sm font-bold text-[#525252]">{weightUnit}</span>
                    </div>
                </div>

            </div>
        </OnboardingLayout>
    );
}
