import { Zap } from 'lucide-react'; // Using general icon, can substitute with simpler SVG
import OnboardingLayout from '../OnboardingLayout';
import { useState } from 'react';

const levels = [
    {
        id: 'beginner',
        title: 'Beginner',
        desc: 'New to training or getting back into it.',
        iconLevel: 1 // 1 lightning bolt
    },
    {
        id: 'intermediate',
        title: 'Intermediate',
        desc: 'Trains consistently 2-3 times a week.',
        iconLevel: 2 // 2 lightning bolts
    },
    {
        id: 'advanced',
        title: 'Advanced',
        desc: 'Confident with heavy weights & high volume.',
        iconLevel: 3 // 3 lightning bolts
    },
];

export default function Step4Level({
    onNext,
    onBack,
    initialLevel = ''
}: { onNext: (level: string) => void, onBack: () => void, initialLevel?: string }) {

    const [selectedLevel, setSelectedLevel] = useState(initialLevel);

    return (
        <OnboardingLayout
            title="Fitness Level"
            subtitle="Select your current experience level to get the right starting difficulty."
            currentStep={4}
            totalSteps={8}
            onNext={() => onNext(selectedLevel)}
            onBack={onBack}
            isNextDisabled={!selectedLevel}
        >
            <div className="flex flex-col gap-4">
                {levels.map((level) => (
                    <button
                        key={level.id}
                        onClick={() => setSelectedLevel(level.id)}
                        className={`relative flex w-full items-start gap-4 rounded-2xl border p-5 text-left transition-all duration-300
              ${selectedLevel === level.id
                                ? 'bg-[#ff3b30]/10 border-[#ff3b30] shadow-[0_0_20px_rgba(255,59,48,0.15)]'
                                : 'bg-[#1a1a1a] border-[#2a2a2a] hover:border-[#3a3a3a] hover:bg-[#242424]'
                            }
            `}
                    >
                        {/* Icon Area */}
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full
               ${selectedLevel === level.id ? 'bg-[#ff3b30] text-white' : 'bg-[#2a2a2a] text-[#525252]'}
             `}>
                            <div className="flex gap-0.5">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <Zap
                                        key={i}
                                        className={`w-3 h-3 ${i < level.iconLevel ? 'opacity-100' : 'opacity-20'}`}
                                        fill="currentColor"
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Text Area */}
                        <div>
                            <h3 className={`font-['Sora'] text-base font-bold ${selectedLevel === level.id ? 'text-white' : 'text-[#e5e5e5]'}`}>
                                {level.title}
                            </h3>
                            <p className="mt-1 font-['Inter'] text-sm leading-relaxed text-[#8a8a8a]">
                                {level.desc}
                            </p>
                        </div>

                        {/* Active Border Glow (Internal) */}
                        {selectedLevel === level.id && (
                            <div className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-[#ff3b30] opacity-100" />
                        )}

                    </button>
                ))}
            </div>
        </OnboardingLayout>
    );
}
