import { TrendingDown, TrendingUp, Heart, BicepsFlexed } from 'lucide-react';
import OnboardingLayout from '../OnboardingLayout';
import { useState } from 'react';

const goals = [
    {
        id: 'lose_weight',
        title: 'Lose Weight',
        desc: 'Burn fat and get lean.',
        icon: TrendingDown
    },
    {
        id: 'gain_muscle',
        title: 'Build Muscle',
        desc: 'Increase mass and strength.',
        icon: TrendingUp
    },
    {
        id: 'keep_fit',
        title: 'Keep Fit',
        desc: 'Maintain current physique.',
        icon: Heart
    },
    {
        id: 'get_stronger',
        title: 'Get Stronger',
        desc: 'Focus on power and PRs.',
        icon: BicepsFlexed
    },
];

export default function Step5Goal({
    onNext,
    onBack,
    initialGoal = ''
}: { onNext: (goal: string) => void, onBack: () => void, initialGoal?: string }) {

    const [selectedGoal, setSelectedGoal] = useState(initialGoal);

    return (
        <OnboardingLayout
            title="What's your main goal?"
            subtitle="We'll focus your plans around this target."
            currentStep={5}
            totalSteps={8}
            onNext={() => onNext(selectedGoal)}
            onBack={onBack}
            isNextDisabled={!selectedGoal}
        >
            <div className="grid grid-cols-2 gap-4">
                {goals.map((goal) => {
                    const Icon = goal.icon;
                    return (
                        <button
                            key={goal.id}
                            onClick={() => setSelectedGoal(goal.id)}
                            className={`relative flex min-h-[160px] flex-col items-center justify-center gap-4 rounded-3xl border border-[#2a2a2a] p-4 text-center transition-all duration-300
                ${selectedGoal === goal.id
                                    ? 'bg-[#1a1a1a] shadow-[0_0_0_2px_#ff3b30] scale-[1.02] z-10'
                                    : 'bg-[#1a1a1a]/50 hover:bg-[#242424]'
                                }
                `}
                        >
                            <div className={`flex h-14 w-14 items-center justify-center rounded-full
                ${selectedGoal === goal.id ? 'bg-[#ff3b30] text-white' : 'bg-[#2a2a2a] text-[#525252]'}
                `}>
                                <Icon className="h-7 w-7" />
                            </div>

                            <div>
                                <h3 className={`font-['Sora'] text-sm font-bold ${selectedGoal === goal.id ? 'text-white' : 'text-[#e5e5e5]'}`}>
                                    {goal.title}
                                </h3>
                                <p className="mt-1 font-['Inter'] text-xs text-[#8a8a8a]">
                                    {goal.desc}
                                </p>
                            </div>
                        </button>
                    );
                })}
            </div>
        </OnboardingLayout>
    );
}
