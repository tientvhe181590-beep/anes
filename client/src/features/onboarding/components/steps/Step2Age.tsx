import OnboardingLayout from '../OnboardingLayout';
import { useState, useRef, useEffect } from 'react';

// Reusable Numeric Picker Component (Horizontal)
const HorizontalPicker = ({
    min,
    max,
    value,
    onChange,
    unit
}: { min: number, max: number, value: number, onChange: (v: number) => void, unit: string }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const startX = useRef(0);
    const scrollLeft = useRef(0);

    // Generate range array
    const range = Array.from({ length: max - min + 1 }, (_, i) => min + i);
    const itemWidth = 60; // Approximate width of each item + gap

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        // Basic snap logic could be added here or via CSS snap-x
    };

    return (
        <div className="relative h-28 w-full">
            {/* Center Indicator */}
            <div className="absolute left-1/2 top-0 -ml-[2px] h-8 w-[4px] rounded-full bg-[#ff3b30] z-20"></div>

            {/* Value Display */}
            <div className="absolute left-0 right-0 top-12 text-center">
                <span className="text-3xl font-bold text-white font-['Sora']">{value}</span>
                <span className="ml-1 text-[#8a8a8a] text-sm">{unit}</span>
            </div>

            {/* Scrollable Area */}
            {/* For a true production picker, we'd use a more complex library or logic.
            Here we simulate it with a simple slider for ease of implementation in this context. */}
            <div className="absolute bottom-0 w-full px-2">
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={value}
                    onChange={(e) => onChange(parseInt(e.target.value))}
                    className="w-full h-2 bg-[#1a1a1a] rounded-lg appearance-none cursor-pointer accent-[#ff3b30]"
                />
                <div className="flex justify-between text-[10px] text-[#525252] mt-2 font-mono">
                    <span>{min}</span>
                    <span>{max}</span>
                </div>
            </div>
        </div>
    );
};

// Simple Vertical Year Picker
const YearPicker = ({ value, onChange }: { value: string, onChange: (v: string) => void }) => {
    const years = Array.from({ length: 80 }, (_, i) => new Date().getFullYear() - 10 - i);

    return (
        <div className="relative w-full h-40 overflow-hidden bg-[#1a1a1a] rounded-xl border border-[#2a2a2a]">
            <div className="absolute inset-x-0 top-1/2 -mt-6 h-12 bg-[#2a2a2a]/50 border-y border-[#3a3a3a] pointer-events-none z-10" />
            <div className="h-full overflow-y-scroll snap-y snap-mandatory py-[calc(50%-24px)] text-center no-scrollbar">
                {years.map(y => (
                    <div
                        key={y}
                        onClick={() => onChange(y.toString())}
                        className={`h-12 flex items-center justify-center snap-center font-['Sora'] text-lg transition-colors cursor-pointer
                         ${value === y.toString() ? 'text-white font-bold scale-110' : 'text-[#525252]'}
                       `}
                    >
                        {y}
                    </div>
                ))}
            </div>
        </div>
    )
}


export default function Step2Stats({
    onNext,
    onBack,
    initialData = { birthYear: '2000', height: 175, weight: 70 }
}: { onNext: (data: any) => void, onBack: () => void, initialData?: any }) {

    const [birthYear, setBirthYear] = useState(initialData.birthYear);
    const [height, setHeight] = useState(initialData.height);
    const [weight, setWeight] = useState(initialData.weight);

    return (
        <OnboardingLayout
            title="Physical Stats"
            subtitle="Used to calculate BMI, BMR and calorie needs."
            currentStep={2}
            totalSteps={7}
            onNext={() => onNext({ birthYear, height, weight })}
            onBack={onBack}
        >
            <div className="flex flex-col gap-10 pb-4">

                {/* Age / Year */}
                <div className="space-y-4">
                    <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#8a8a8a] text-center block">Birth Year</label>
                    <YearPicker value={birthYear} onChange={setBirthYear} />
                    <p className="text-center text-[#525252] text-xs">{(new Date().getFullYear()) - parseInt(birthYear)} years old</p>
                </div>

                {/* Height */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center px-2">
                        <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#8a8a8a]">Height</label>
                    </div>
                    <HorizontalPicker min={140} max={220} value={height} onChange={setHeight} unit="cm" />
                </div>

                {/* Weight */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center px-2">
                        <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#8a8a8a]">Weight</label>
                    </div>
                    <HorizontalPicker min={40} max={150} value={weight} onChange={setWeight} unit="kg" />
                </div>

            </div>
        </OnboardingLayout>
    );
}
