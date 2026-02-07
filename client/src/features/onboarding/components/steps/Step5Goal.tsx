import { TrendingDown, Minus, TrendingUp, Dumbbell } from 'lucide-react';
import OnboardingLayout from '../OnboardingLayout';
import { useState } from 'react';

const goals = [
    {
        id: 'lose_weight',
        title: 'Lose Weight',
        icon: TrendingDown
    },
    {
        id: 'gain_weight',
        title: 'Gain Weight',
        icon: TrendingUp
    },
    {
        id: 'maintain',
        title: 'Maintain',
        icon: Minus
    },
    {
        id: 'gain_muscle',
        title: 'Gain Muscle',
        icon: Dumbbell
    },
];

export default function Step3Goal({
    onNext,
    onBack,
    initialGoal = '',
}: { onNext: (data: any) => void, onBack: () => void, initialGoal?: string }) {

    const [selectedGoal, setSelectedGoal] = useState(initialGoal);
    const [selectedGoal, setSelectedGoal] = useState(initialGoal);

    return (
        <OnboardingLayout
            title="Fitness Goal"
            subtitle="Choose your main objective."
            currentStep={3}
            totalSteps={7}
            onNext={() => onNext({ goal: selectedGoal })}
            onBack={onBack}
            isNextDisabled={!selectedGoal}
        >
            <div className="flex flex-col gap-4">

                {/* Goal Cards */}
                {goals.map((goal) => {
                    const Icon = goal.icon;
                    return (
                        <button
                            key={goal.id}
                            onClick={() => setSelectedGoal(goal.id)}
                            className={`relative flex items-center gap-4 rounded-xl border p-4 text-left transition-all duration-200
                ${selectedGoal === goal.id
                                    ? 'bg-[#1a1a1a] border-[#ff3b30] shadow-[0_0_0_1px_#ff3b30]'
                                    : 'bg-[#1a1a1a] border-transparent hover:bg-[#242424]'
                                }
                `}
                        >
                            <div className={`flex h-10 w-10 items-center justify-center rounded-full
                ${selectedGoal === goal.id ? 'bg-[#ff3b30] text-white' : 'bg-[#2a2a2a] text-[#8a8a8a]'}
                `}>
                                <Icon className="h-5 w-5" />
                            </div>

                            <span className={`font-['Sora'] text-[15px] font-semibold ${selectedGoal === goal.id ? 'text-white' : 'text-[#d4d4d4]'}`}>
                                {goal.title}
                            </span>
                        </button>
                    );
                })}



            </div>
        </OnboardingLayout>
    );
}
