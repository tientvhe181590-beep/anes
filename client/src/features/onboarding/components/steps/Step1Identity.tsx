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
      title="Welcome"
      subtitle="Let's get to know you."
      currentStep={1}
      totalSteps={7}
      onNext={() => onNext({ name, gender })}
      isNextDisabled={!isValid}
    >
      <div className="flex flex-col gap-6">

        {/* Name Input */}
        <div className="space-y-3">
          <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8a8a8a]">Your Name</label>
          <div className="group relative flex h-14 w-full items-center rounded-xl bg-[#1a1a1a] px-4 ring-1 ring-transparent transition-all focus-within:ring-[#ff3b30] hover:bg-[#242424]">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="h-full w-full bg-transparent font-['Inter'] text-[16px] text-white placeholder-[#525252] outline-none"
            />
          </div>
        </div>

        {/* Gender Selection */}
        <div className="space-y-3">
          <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8a8a8a]">Gender</label>
          <div className="grid grid-cols-2 gap-4">
            {['male', 'female'].map((g) => (
              <button
                key={g}
                onClick={() => setGender(g as any)}
                className={`relative flex h-36 flex-col items-center justify-center gap-4 rounded-2xl border transition-all duration-300
                    ${gender === g
                    ? 'bg-[#1a1a1a] border-[#ff3b30] shadow-[0_0_0_1px_#ff3b30]'
                    : 'bg-[#1a1a1a] border-transparent hover:bg-[#242424]'
                  }
                  `}
              >
                <User className={`h-8 w-8 ${gender === g ? 'text-[#ff3b30]' : 'text-[#8a8a8a]'}`} />
                <span className={`font-['Sora'] text-[15px] font-semibold ${gender === g ? 'text-white' : 'text-[#8a8a8a]'}`}>
                  {g === 'male' ? 'Male' : 'Female'}
                </span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </OnboardingLayout>
  );
}
