import { CalendarDays } from 'lucide-react';
import OnboardingLayout from '../OnboardingLayout';
import { useState } from 'react';

export default function Step7Schedule({
    onNext,
    onBack,
    initialDays = 3
}: { onNext: (days: number) => void, onBack: () => void, initialDays?: number }) {

    const [days, setDays] = useState(initialDays);

    return (
        <OnboardingLayout
            title="Training Schedule"
            subtitle="How many days a week can you commit to training?"
            currentStep={7}
            totalSteps={8}
            onNext={() => onNext(days)}
            onBack={onBack}
        >
            <div className="flex flex-col gap-8 pt-6">

                {/* Days visualization circles */}
                <div className="flex items-center justify-between px-2">
                    {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                        <button
                            key={d}
                            onClick={() => setDays(d)}
                            className={`flex h-10 w-10 items-center justify-center rounded-full font-['Sora'] font-bold transition-all duration-300
                    ${d === days
                                    ? 'bg-[#ff3b30] text-white scale-125 shadow-[0_4px_15px_rgba(255,59,48,0.4)]'
                                    : d < days
                                        ? 'bg-[#2a2a2a] text-[#8a8a8a]'
                                        : 'bg-[#1a1a1a] text-[#525252]'
                                }
                  `}
                        >
                            {d}
                        </button>
                    ))}
                </div>

                {/* Slider Input */}
                <div className="px-4">
                    <input
                        type="range"
                        min="1"
                        max="7"
                        step="1"
                        value={days}
                        onChange={(e) => setDays(parseInt(e.target.value))}
                        className="h-2 w-full appearance-none rounded-full bg-[#1a1a1a] accent-[#ff3b30] outline-none hover:bg-[#2a2a2a] [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#ff3b30] [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(255,59,48,0.5)]"
                    />
                </div>

                <div className="text-center">
                    <h3 className="font-['Sora'] text-2xl font-bold text-white">
                        {days} Days / Week
                    </h3>
                    <p className="mt-2 text-sm text-[#8a8a8a]">
                        {days <= 2 ? 'Light commitment, good for maintenance.' :
                            days <= 4 ? 'Solid routine for consistent progress.' :
                                'Intense schedule, great for rapid results.'}
                    </p>
                </div>

            </div>
        </OnboardingLayout>
    );
}
