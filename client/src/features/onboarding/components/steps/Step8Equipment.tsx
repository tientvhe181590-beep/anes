import { Dumbbell, Home, Users } from 'lucide-react';
import OnboardingLayout from '../OnboardingLayout';
import { useState } from 'react';

const equipmentOptions = [
    {
        id: 'gym',
        title: 'Full Gym',
        desc: 'Access to machines, barbells, and weights.',
        icon: Users // Placeholder icon
    },
    {
        id: 'home_dumbbells',
        title: 'Home (Dumbbells)',
        desc: 'Limited setup with free weights.',
        icon: Dumbbell
    },
    {
        id: 'bodyweight',
        title: 'Bodyweight Only',
        desc: 'No equipment needed, just you.',
        icon: Home
    },
];

export default function Step8Equipment({
    onNext,
    onBack,
    initialEquip = ''
}: { onNext: (equip: string) => void, onBack: () => void, initialEquip?: string }) {

    const [selectedEquip, setSelectedEquip] = useState(initialEquip);

    return (
        <OnboardingLayout
            title="Available Equipment"
            subtitle="What equipment do you have access to?"
            currentStep={8}
            totalSteps={8}
            onNext={() => onNext(selectedEquip)}
            onBack={onBack}
            nextLabel="Finish Profile"
            isNextDisabled={!selectedEquip}
        >
            <div className="flex flex-col gap-4">
                {equipmentOptions.map((opt) => {
                    const Icon = opt.icon;
                    return (
                        <button
                            key={opt.id}
                            onClick={() => setSelectedEquip(opt.id)}
                            className={`group relative flex w-full items-center gap-5 rounded-2xl border p-5 text-left transition-all duration-300
                  ${selectedEquip === opt.id
                                    ? 'bg-[#ff3b30]/10 border-[#ff3b30] shadow-[0_0_20px_rgba(255,59,48,0.15)]'
                                    : 'bg-[#1a1a1a] border-[#2a2a2a] hover:border-[#3a3a3a] hover:bg-[#242424]'
                                }
                `}
                        >
                            {/* Icon Box */}
                            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors
                  ${selectedEquip === opt.id ? 'bg-[#ff3b30] text-white' : 'bg-[#2a2a2a] text-[#525252] group-hover:bg-[#333]'}
                `}>
                                <Icon className="h-6 w-6" />
                            </div>

                            <div>
                                <h3 className={`font-['Sora'] text-base font-bold ${selectedEquip === opt.id ? 'text-white' : 'text-[#e5e5e5]'}`}>
                                    {opt.title}
                                </h3>
                                <p className="font-['Inter'] text-sm text-[#8a8a8a]">
                                    {opt.desc}
                                </p>
                            </div>

                            {/* Radio Circle Indicator */}
                            <div className={`ml-auto h-6 w-6 rounded-full border-2 flex items-center justify-center
                   ${selectedEquip === opt.id ? 'border-[#ff3b30]' : 'border-[#3a3a3a]'}
                `}>
                                {selectedEquip === opt.id && (
                                    <div className="h-3 w-3 rounded-full bg-[#ff3b30]" />
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </OnboardingLayout>
    );
}
