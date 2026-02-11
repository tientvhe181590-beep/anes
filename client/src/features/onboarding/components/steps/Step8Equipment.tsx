import OnboardingLayout from '../OnboardingLayout';
import { useState } from 'react';
import { Check } from 'lucide-react';

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

const allergiesList = ['Nuts', 'Dairy', 'Eggs', 'Seafood', 'Gluten', 'None'];

export default function Step7Allergies({
    onNext,
    onBack,
    initialData = [] // Fix default value type
}: { onNext: (data: any) => void, onBack: () => void, initialData?: string[] }) {

    const [selectedAllergies, setSelectedAllergies] = useState<string[]>(initialData || []);
    const [otherAllergy, setOtherAllergy] = useState('');

    const toggleAllergy = (item: string) => {
        if (item === 'None') {
            setSelectedAllergies(['None']);
            return;
        }

        let newSel = selectedAllergies.includes('None') ? [] : [...selectedAllergies];

        if (newSel.includes(item)) {
            newSel = newSel.filter(i => i !== item);
        } else {
            newSel.push(item);
        }
        setSelectedAllergies(newSel);
    };

    const handleNextWrapper = () => {
        const final = [...selectedAllergies];
        if (otherAllergy.trim()) final.push(otherAllergy);
        onNext(final);
    }

    return (
        <OnboardingLayout
            title="Allergies"
            subtitle="Select any food allergies."
            currentStep={7}
            totalSteps={7}
            onNext={handleNextWrapper}
            onBack={onBack}
            nextLabel="Finish"
        >
            <div className="flex flex-col gap-3">
                {allergiesList.map(item => (
                    <CheckboxItem
                        key={item}
                        label={item}
                        isSelected={selectedAllergies.includes(item)}
                        onToggle={() => toggleAllergy(item)}
                    />
                ))}

                <div className="mt-2">
                    <input
                        type="text"
                        value={otherAllergy}
                        onChange={(e) => setOtherAllergy(e.target.value)}
                        placeholder="Other allergies (optional)"
                        className="w-full h-14 rounded-xl bg-[#1a1a1a] px-4 font-['Inter'] text-[15px] text-white placeholder-[#525252] outline-none border border-transparent focus:border-[#ff3b30] transition-all"
                    />
                </div>
            </div>
        </OnboardingLayout>
    );
}
