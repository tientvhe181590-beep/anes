import OnboardingLayout from '../OnboardingLayout';
import { useState } from 'react';
import { Check } from 'lucide-react';

// Reusable Checkbox Component
const CheckboxItem = ({ label, isSelected, onToggle }: { label: string, isSelected: boolean, onToggle: () => void }) => (
    <button
        onClick={onToggle}
        className={`flex items-center justify-between w-full h-14 px-4 rounded-xl border transition-all duration-200
            ${isSelected
                ? 'bg-[#1a1a1a] border-[#ff3b30] shadow-[0_0_0_1px_#ff3b30] z-10'
                : 'bg-[#1a1a1a] border-transparent hover:bg-[#242424]'
            }
        `}
    >
        <span className={`text-[15px] font-['Inter'] font-medium ${isSelected ? 'text-white' : 'text-[#8a8a8a]'}`}>
            {label}
        </span>
        <div className={`h-5 w-5 rounded flex items-center justify-center transition-colors border
             ${isSelected ? 'bg-[#ff3b30] border-[#ff3b30]' : 'border-[#404040]'}
        `}>
            {isSelected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
        </div>
    </button>
);

const injuriesList = ['Knee', 'Back', 'Shoulder', 'Wrist', 'Ankle', 'None'];

export default function Step6Injuries({
    onNext,
    onBack,
    initialData = []
}: { onNext: (data: any) => void, onBack: () => void, initialData?: string[] }) {

    const [selectedInjuries, setSelectedInjuries] = useState<string[]>(initialData || []);
    const [otherInjury, setOtherInjury] = useState('');

    const toggleInjury = (item: string) => {
        if (item === 'None') {
            setSelectedInjuries(['None']);
            return;
        }

        let newSel = selectedInjuries.includes('None') ? [] : [...selectedInjuries];

        if (newSel.includes(item)) {
            newSel = newSel.filter(i => i !== item);
        } else {
            newSel.push(item);
        }
        setSelectedInjuries(newSel);
    };

    const handleNextWrapper = () => {
        const final = [...selectedInjuries];
        if (otherInjury.trim()) final.push(otherInjury);
        onNext(final);
    }

    return (
        <OnboardingLayout
            title="Injuries"
            subtitle="Select any injuries you currently have."
            currentStep={6}
            totalSteps={7}
            onNext={handleNextWrapper}
            onBack={onBack}
        >
            <div className="flex flex-col gap-3">
                {injuriesList.map(item => (
                    <CheckboxItem
                        key={item}
                        label={item}
                        isSelected={selectedInjuries.includes(item)}
                        onToggle={() => toggleInjury(item)}
                    />
                ))}

                {/* Other Input */}
                <div className="mt-2">
                    <input
                        type="text"
                        value={otherInjury}
                        onChange={(e) => setOtherInjury(e.target.value)}
                        placeholder="Other injuries (optional)"
                        className="w-full h-14 rounded-xl bg-[#1a1a1a] px-4 font-['Inter'] text-[15px] text-white placeholder-[#525252] outline-none border border-transparent focus:border-[#ff3b30] transition-all"
                    />
                </div>
            </div>
        </OnboardingLayout>
    );
}
