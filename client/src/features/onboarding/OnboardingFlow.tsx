import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Step1Identity,
    Step2Age,
    Step3Physique,
    Step4Level,
    Step5Goal,
    Step6Target,
    Step7Schedule,
    Step8Equipment
} from './components';

export default function OnboardingFlow() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        gender: '',
        age: '',
        height: '',
        weight: '',
        heightUnit: 'cm',
        weightUnit: 'kg',
        level: '',
        goal: '',
        targetWeight: '',
        targetUnit: 'kg',
        daysPerWeek: 3,
        equipment: ''
    });

    const handleNext = (data: any) => {
        setFormData((prev) => ({ ...prev, ...data }));
        if (step < 8) {
            setStep((prev) => prev + 1);
        } else {
            // Finished
            console.log('Onboarding Complete:', { ...formData, ...data });
            navigate('/dashboard'); // Or wherever you want to go after
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep((prev) => prev - 1);
        } else {
            navigate('/landing');
        }
    };

    return (
        <>
            {step === 1 && <Step1Identity onNext={handleNext} initialData={{ name: formData.name, gender: formData.gender as any }} />}
            {step === 2 && <Step2Age onNext={(age) => handleNext({ age })} onBack={handleBack} initialAge={formData.age} />}
            {step === 3 && <Step3Physique onNext={(data) => handleNext(data)} onBack={handleBack} initialData={formData} />}
            {step === 4 && <Step4Level onNext={(level) => handleNext({ level })} onBack={handleBack} initialLevel={formData.level} />}
            {step === 5 && <Step5Goal onNext={(goal) => handleNext({ goal })} onBack={handleBack} initialGoal={formData.goal} />}
            {step === 6 && <Step6Target onNext={(data) => handleNext({ targetWeight: data.target, targetUnit: data.unit })} onBack={handleBack} initialTarget={formData.targetWeight} initialUnit={formData.targetUnit} />}
            {step === 7 && <Step7Schedule onNext={(days) => handleNext({ daysPerWeek: days })} onBack={handleBack} initialDays={formData.daysPerWeek} />}
            {step === 8 && <Step8Equipment onNext={(equip) => handleNext({ equipment: equip })} onBack={handleBack} initialEquip={formData.equipment} />}
        </>
    );
}
