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
    initialTargetWeight = '70'
}: { onNext: (data: any) => void, onBack: () => void, initialGoal?: string, initialTargetWeight?: string }) {

    const [selectedGoal, setSelectedGoal] = useState(initialGoal);
    const [targetWeight, setTargetWeight] = useState(initialTargetWeight);

    const showTargetInput = selectedGoal === 'lose_weight' || selectedGoal === 'maintain' || selectedGoal === 'gain_weight';

    return (
        <OnboardingLayout
            title="Fitness Goal"
            subtitle="Choose your main objective."
            currentStep={3}
            totalSteps={7}
            onNext={() => onNext({ goal: selectedGoal, targetWeight: showTargetInput ? targetWeight : null })}
            onBack={onBack}
            isNextDisabled={!selectedGoal || (showTargetInput && !targetWeight)}
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

                {/* Dynamic Target Weight Input */}
                {showTargetInput && (
                    <div className="mt-6 animate-in fade-in slide-in-from-top-4 duration-300">
                        <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#8a8a8a] mb-3 block">Target Weight (kg)</label>
                        <div className="flex h-16 w-full items-center rounded-xl bg-[#1a1a1a] px-6 border border-[#2a2a2a] focus-within:border-[#ff3b30]">
                            <input
                                type="number"
                                value={targetWeight}
                                onChange={(e) => setTargetWeight(e.target.value)}
                                placeholder="0"
                                className="h-full w-full bg-transparent font-['Sora'] text-2xl font-bold text-white outline-none placeholder-[#3a3a3a]"
                            />
                            <span className="text-[#525252] font-semibold">kg</span>
                        </div>
                    </div>
                )}

            </div>
        </OnboardingLayout>
    );
}
