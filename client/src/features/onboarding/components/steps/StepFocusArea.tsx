import OnboardingLayout from '../OnboardingLayout';
import { useState } from 'react';
import { Check } from 'lucide-react';

const bodyParts = [
    'Arm',
    'Shoulder',
    'Chest',
    'Abs',
    'Leg',
    'Full Body'
];

export default function StepFocusArea({
    onNext,
    onBack,
    initialSelection = [] as string[]
}: { onNext: (selection: string[]) => void, onBack: () => void, initialSelection?: string[] }) {

    const [selectedParts, setSelectedParts] = useState<string[]>(initialSelection);

    const togglePart = (part: string) => {
        if (selectedParts.includes(part)) {
            setSelectedParts(selectedParts.filter(p => p !== part));
        } else {
            setSelectedParts([...selectedParts, part]);
        }
    };

    return (
        <OnboardingLayout
            title="Focus Area"
            subtitle="Select muscle groups you want to target."
            currentStep={3}
            totalSteps={7}
            onNext={() => onNext(selectedParts)}
            onBack={onBack}
            isNextDisabled={selectedParts.length === 0}
        >
            <div className="flex h-full gap-4">

                {/* Left: Selectable List */}
                <div className="flex flex-1 flex-col gap-3">
                    {bodyParts.map(part => (
                        <button
                            key={part}
                            onClick={() => togglePart(part)}
                            className={`flex items-center justify-between px-4 py-4 rounded-xl text-left border transition-all
                        ${selectedParts.includes(part)
                                    ? 'bg-[#ff3b30] border-[#ff3b30] text-white shadow-md'
                                    : 'bg-[#1a1a1a] border-transparent text-[#8a8a8a] hover:bg-[#242424]'
                                }
                    `}
                        >
                            <span className="text-[14px] font-semibold font-['Sora']">{part}</span>
                            {selectedParts.includes(part) && <Check size={16} strokeWidth={3} />}
                        </button>
                    ))}
                </div>

                {/* Right: Muscle Map (Placeholder) */}
                <div className="flex-1 rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] relative overflow-hidden flex items-center justify-center">
                    {/* Grid visualization placeholder */}
                    <div className="absolute inset-0 opacity-20 bg-[linear-gradient(#333_1px,transparent_1px),linear-gradient(90deg,#333_1px,transparent_1px)] bg-[size:20px_20px]" />

                    {/* Silhouette Placeholder */}
                    <div className="relative z-10 opacity-50">
                        <svg width="100" height="200" viewBox="0 0 100 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M50 20C55.5228 20 60 15.5228 60 10C60 4.47715 55.5228 0 50 0C44.4772 0 40 4.47715 40 10C40 15.5228 44.4772 20 50 20Z" fill="#525252" />
                            <path d="M50 22C35 22 25 35 20 45V90H30V120H40V190H60V120H70V90H80V45C75 35 65 22 50 22Z" fill="#525252" />
                        </svg>
                    </div>

                    {/* Highlight logic would go here - overlays based on selection */}
                    {selectedParts.length > 0 && (
                        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                            <div className="bg-[#ff3b30] opacity-20 blur-xl w-20 h-40 rounded-full" />
                        </div>
                    )}
                </div>

            </div>
        </OnboardingLayout>
    );
}
