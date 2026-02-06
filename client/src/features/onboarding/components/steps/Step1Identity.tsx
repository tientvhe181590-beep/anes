import { User, Check } from 'lucide-react';
import OnboardingLayout from '../OnboardingLayout';
import { useState } from 'react';

// Using a type provided by parent or context in real app
interface IdentityData {
    name: string;
    gender: 'male' | 'female' | '';
}

export default function Step1Identity({
    onNext,
    initialData = { name: '', gender: '' as const }
}: { onNext: (data: IdentityData) => void, initialData?: IdentityData }) {

    const [name, setName] = useState(initialData.name);
    const [gender, setGender] = useState<IdentityData['gender']>(initialData.gender);

    const isValid = name.trim().length > 0 && gender !== '';

    return (
        <OnboardingLayout
            title="Let's get to know you"
            subtitle="Tell us your name and gender so we can personalize your experience."
            currentStep={1}
            totalSteps={8}
            onNext={() => onNext({ name, gender })}
            isNextDisabled={!isValid}
        >
            <div className="flex flex-col gap-6">

                {/* Name Input */}
                <div className="space-y-3">
                    <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8a8a8a]">Your Name</label>
                    <div className="group relative flex h-14 w-full items-center rounded-xl bg-[#1a1a1a] px-4 ring-1 ring-[#2a2a2a] transition-all focus-within:ring-[#ff3b30] hover:ring-[#3a3a3a]">
                        <User className="mr-3 h-5 w-5 text-[#525252] transition-colors group-focus-within:text-white" />
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                            className="h-full w-full bg-transparent font-['Inter'] text-[15px] text-white placeholder-[#525252] outline-none"
                        />
                    </div>
                </div>

                {/* Gender Selection */}
                <div className="space-y-3">
                    <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8a8a8a]">Gender</label>
                    <div className="grid grid-cols-2 gap-3">
                        {['male', 'female'].map((g) => (
                            <button
                                key={g}
                                onClick={() => setGender(g as any)}
                                className={`relative flex h-[120px] flex-col items-center justify-center gap-3 rounded-2xl border transition-all duration-300
                    ${gender === g
                                        ? 'bg-[#ff3b30] border-[#ff3b30] shadow-[0_4px_20px_rgba(255,59,48,0.25)]'
                                        : 'bg-[#1a1a1a] border-[#2a2a2a] text-[#8a8a8a] hover:bg-[#242424] hover:border-[#3a3a3a]'
                                    }
                  `}
                            >
                                <User className={`h-8 w-8 ${gender === g ? 'text-white' : 'text-[#525252]'}`} />
                                <span className={`font-['Inter'] text-[15px] font-semibold ${gender === g ? 'text-white' : 'text-[#8a8a8a]'}`}>
                                    {g === 'male' ? 'Male' : 'Female'}
                                </span>

                                {/* Checkmark for active state */}
                                {gender === g && (
                                    <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[#ff3b30]">
                                        <Check className="h-3 w-3" strokeWidth={3} />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

            </div>
        </OnboardingLayout>
    );
}
