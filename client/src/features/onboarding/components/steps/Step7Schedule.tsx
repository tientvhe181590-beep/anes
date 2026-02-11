import OnboardingLayout from '../OnboardingLayout';
import { useState } from 'react';
import { Check } from 'lucide-react';

const equipmentList = [
    'Dumbbells',
    'Resistance Bands',
    'Yoga Mat',
    'Pull-up Bar',
    'Bench',
    'Kettlebell'
];

export default function Step5Availability({
    onNext,
    onBack,
    initialData = { days: 3, equipment: [] as string[] }
}: { onNext: (data: any) => void, onBack: () => void, initialData?: any }) {

    const [days, setDays] = useState(initialData.days || 3);
    const [equipment, setEquipment] = useState<string[]>(initialData.equipment || []);
    const [otherEquip, setOtherEquip] = useState('');
    const [showOther, setShowOther] = useState(false);

    const toggleEquip = (item: string) => {
        if (equipment.includes(item)) {
            setEquipment(equipment.filter(i => i !== item));
        } else {
            setEquipment([...equipment, item]);
        }
    };

    const handleNextWrapper = () => {
        const finalEquip = [...equipment];
        if (showOther && otherEquip.trim()) {
            finalEquip.push(otherEquip);
        }
        onNext({ days, equipment: finalEquip });
    }

    return (
        <OnboardingLayout
            title="Availability & Equipment"
            subtitle="Choose training days and available equipment."
            currentStep={5}
            totalSteps={7}
            onNext={handleNextWrapper}
            onBack={onBack}
        >
            <div className="flex flex-col gap-8">

                {/* Days Selection */}
                <div className="space-y-3">
                    <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#8a8a8a]">Training Days per Week</label>
                    <div className="grid grid-cols-2 gap-3">
                        {[2, 3, 4, 5].map(d => (
                            <button
                                key={d}
                                onClick={() => setDays(d)}
                                className={`h-12 rounded-xl border font-['Sora'] font-semibold text-sm transition-all
                        ${days === d
                                        ? 'bg-[#ff3b30] border-[#ff3b30] text-white'
                                        : 'bg-[#1a1a1a] border-[#2a2a2a] text-[#8a8a8a] hover:bg-[#242424]'
                                    }
                      `}
                            >
                                {d} Days
                            </button>
                        ))}
                    </div>
                </div>

                {/* Equipment Checkboxes */}
                <div className="space-y-3">
                    <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#8a8a8a]">Equipment</label>
                    <div className="flex flex-col gap-2">
                        {equipmentList.map(item => (
                            <button
                                key={item}
                                onClick={() => toggleEquip(item)}
                                className={`flex items-center justify-between rounded-xl bg-[#1a1a1a] p-4 text-left border transition-all
                            ${equipment.includes(item) ? 'border-[#3a3a3a] bg-[#242424]' : 'border-transparent'}
                        `}
                            >
                                <span className={`text-[15px] ${equipment.includes(item) ? 'text-white' : 'text-[#8a8a8a]'}`}>{item}</span>
                                <div className={`h-5 w-5 rounded border flex items-center justify-center transition-colors
                            ${equipment.includes(item) ? 'bg-[#ff3b30] border-[#ff3b30]' : 'border-[#525252]'}
                        `}>
                                    {equipment.includes(item) && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                                </div>
                            </button>
                        ))}

                        {/* Other Option */}
                        <button
                            onClick={() => setShowOther(!showOther)}
                            className={`flex items-center justify-between rounded-xl bg-[#1a1a1a] p-4 text-left border transition-all
                            ${showOther ? 'border-[#3a3a3a] bg-[#242424]' : 'border-transparent'}
                        `}
                        >
                            <span className={`text-[15px] ${showOther ? 'text-white' : 'text-[#8a8a8a]'}`}>Other</span>
                            <div className={`h-5 w-5 rounded border flex items-center justify-center transition-colors
                            ${showOther ? 'bg-[#ff3b30] border-[#ff3b30]' : 'border-[#525252]'}
                        `}>
                                {showOther && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                            </div>
                        </button>

                        {showOther && (
                            <input
                                type="text"
                                value={otherEquip}
                                onChange={(e) => setOtherEquip(e.target.value)}
                                placeholder="Enter other equipment"
                                className="w-full h-12 mt-1 rounded-xl bg-[#0c0c0c] border border-[#2a2a2a] px-4 font-['Inter'] text-[14px] text-white placeholder-[#525252] outline-none focus:border-[#ff3b30]"
                            />
                        )}
                    </div>
                </div>

            </div>
        </OnboardingLayout>
    );
}
