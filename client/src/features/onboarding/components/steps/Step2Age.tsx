import { Calendar } from 'lucide-react';
import OnboardingLayout from '../OnboardingLayout';
import { useState } from 'react';

export default function Step2Age({
    onNext,
    onBack,
    initialAge = ''
}: { onNext: (age: string) => void, onBack: () => void, initialAge?: string }) {

    const [age, setAge] = useState(initialAge);

    // Validate number between 13 and 100
    const isValid = parseInt(age) >= 13 && parseInt(age) <= 100;

    return (
        <OnboardingLayout
            title="How old are you?"
            subtitle="This helps us calculate your personalized calorie and macro needs."
            currentStep={2}
            totalSteps={8}
            onNext={() => onNext(age)}
            onBack={onBack}
            isNextDisabled={!isValid}
        >
            <div className="flex flex-col items-center pt-8">

                {/* Visual Decoration */}
                {/* <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-[#1a1a1a] ring-1 ring-[#2a2a2a]">
           <span className="font-['Sora'] text-4xl font-bold text-[#ff3b30]">
             {age || '?'}
           </span>
        </div> */}

                {/* Huge Input Style - Premium Feel */}
                <div className="relative mb-4 flex items-center justify-center">
                    <input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="25"
                        className="w-full min-w-[200px] border-none bg-transparent text-center font-['Sora'] text-[80px] font-bold leading-none tracking-tight text-white placeholder-[#2a2a2a] outline-none drop-shadow-xl"
                        autoFocus
                    />
                    <span className="absolute -right-8 bottom-4 text-xl font-medium text-[#525252]">
                        years
                    </span>
                </div>

                <p className="text-center text-sm text-[#525252]">
                    Please enter your age in years
                </p>
            </div>
        </OnboardingLayout>
    );
}
