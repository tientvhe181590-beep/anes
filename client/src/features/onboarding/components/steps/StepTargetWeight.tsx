import OnboardingLayout from '../OnboardingLayout';
import { useState, useRef, useEffect } from 'react';

// Reusing the HorizontalPicker logic or similar visual style
const HorizontalWeightPicker = ({
    min,
    max,
    value,
    onChange,
    unit
}: { min: number, max: number, value: number, onChange: (v: number) => void, unit: string }) => {
    // Simplified slider for now, matching the style of previous steps but standalone
    return (
        <div className="relative h-28 w-full mt-8">
            {/* Center Indicator */}
            <div className="absolute left-1/2 top-0 -ml-[2px] h-8 w-[4px] rounded-full bg-[#ff3b30] z-20"></div>

            {/* Scrollable Area (Simulated) */}
            <div className="absolute bottom-0 w-full px-2">
                <input
                    type="range"
                    min={min}
                    max={max}
                    step="0.1"
                    value={value}
                    onChange={(e) => onChange(parseFloat(e.target.value))}
                    className="w-full h-2 bg-[#1a1a1a] rounded-lg appearance-none cursor-pointer accent-[#ff3b30]"
                />
                <div className="flex justify-between text-[10px] text-[#525252] mt-4 font-mono">
                    <span>{min}</span>
                    <span className="font-bold text-white">{value}</span>
                    <span>{max}</span>
                </div>
            </div>

            {/* Tick marks simulation (Optional polish) */}
            <div className="absolute top-10 w-full flex justify-between px-2 opacity-30 pointer-events-none">
                {Array.from({ length: 20 }).map((_, i) => (
                    <div key={i} className={`w-[1px] bg-white ${i % 5 === 0 ? 'h-4' : 'h-2'}`} />
                ))}
            </div>
        </div>
    );
};

export default function StepTargetWeight({
    onNext,
    onBack,
    currentWeight = 70,
    initialTarget = 65,
    initialUnit = 'kg'
}: { onNext: (data: { target: number, unit: string }) => void, onBack: () => void, currentWeight?: number, initialTarget?: number, initialUnit?: string }) {

    const [targetValue, setTargetValue] = useState(initialTarget);
    const [unit, setUnit] = useState(initialUnit);

    const diff = targetValue - currentWeight;
    const isLoss = diff < 0;
    const absDiff = Math.abs(diff).toFixed(1);

    return (
        <OnboardingLayout
            title="What's your target weight?"
            subtitle="Slide to set your goal weight. We'll create a plan to get you there."
            currentStep={3}
            totalSteps={7}
            onNext={() => onNext({ target: targetValue, unit })}
            onBack={onBack}
        >
            <div className="flex flex-col items-center pt-4">

                {/* Unit Toggle */}
                <div className="flex rounded-lg bg-[#1a1a1a] p-1 mb-10">
                    {['kg', 'lbs'].map((u) => (
                        <button
                            key={u}
                            onClick={() => setUnit(u)}
                            className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${unit === u ? 'bg-[#ff3b30] text-white' : 'text-[#525252]'}`}
                        >
                            {u}
                        </button>
                    ))}
                </div>

                {/* Main Value */}
                <div className="flex items-baseline gap-2 mb-2">
                    <span className="font-['Sora'] text-6xl font-bold text-white tracking-tighter">
                        {targetValue.toFixed(1)}
                    </span>
                    <span className="text-xl text-[#8a8a8a] font-medium">{unit}</span>
                </div>

                {/* Current Weight Reference */}
                <div className="text-[#525252] text-sm font-medium mb-6">
                    Current: {currentWeight} {unit}
                </div>

                {/* Delta Pill */}
                <div className={`px-4 py-2 rounded-full text-sm font-bold mb-8
            ${isLoss ? 'bg-[#ff3b30]/10 text-[#ff3b30]' : 'bg-[#2a2a2a] text-white'}
        `}>
                    {diff === 0 ? 'Maintain current weight' : `${isLoss ? '-' : '+'}${absDiff} ${unit} to ${isLoss ? 'lose' : 'gain'}`}
                </div>

                {/* Picker */}
                <HorizontalWeightPicker
                    min={40}
                    max={150}
                    value={targetValue}
                    onChange={setTargetValue}
                    unit={unit}
                />

            </div>
        </OnboardingLayout>
    );
}
