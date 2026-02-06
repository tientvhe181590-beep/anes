import { useState } from 'react';
import OnboardingLayout from '../OnboardingLayout';

const levels = [
    { id: 'beginner', title: 'Beginner' },
    { id: 'intermediate', title: 'Intermediate' },
    { id: 'advanced', title: 'Advanced' },
];

export default function Step4Level({
    onNext,
    onBack,
    initialLevel = ''
}: { onNext: (level: string) => void, onBack: () => void, initialLevel?: string }) {

    const [selectedLevel, setSelectedLevel] = useState(initialLevel);

    return (
        <OnboardingLayout
            title="Experience Level"
            subtitle="Choose your training level."
            currentStep={4}
            totalSteps={7}
            onNext={() => onNext(selectedLevel)}
            onBack={onBack}
            isNextDisabled={!selectedLevel}
        >
            <div className="flex flex-col gap-3">
                {levels.map((level) => (
                    <button
                        key={level.id}
                        onClick={() => setSelectedLevel(level.id)}
                        className={`flex w-full items-center justify-between rounded-xl border px-6 py-5 text-left transition-all duration-200
              ${selectedLevel === level.id
                                ? 'bg-[#1a1a1a] border-[#ff3b30] shadow-[0_0_0_1px_#ff3b30] text-white'
                                : 'bg-[#1a1a1a] border-transparent text-[#8a8a8a] hover:bg-[#242424]'
                            }
            `}
                    >
                        <span className="font-['Sora'] text-base font-semibold">
                            {level.title}
                        </span>

                        {/* Radio circle */}
                        <div className={`h-5 w-5 rounded-full border flex items-center justify-center
                ${selectedLevel === level.id ? 'border-[#ff3b30]' : 'border-[#3a3a3a]'}
             `}>
                            {selectedLevel === level.id && <div className="h-2.5 w-2.5 bg-[#ff3b30] rounded-full" />}
                        </div>
                    </button>
                ))}
            </div>
        </OnboardingLayout>
    );
}
