import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Step1Identity,
    Step2Stats,
    Step3Goal,
    StepFocusArea,
    StepTargetWeight,
    Step4Level,
    Step5Availability,
    Step6Injuries,
    Step7Allergies,
} from './components';

export default function OnboardingFlow() {
    const navigate = useNavigate();
    // Flow management
    const [step, setStep] = useState(1);
    const [showFocusArea, setShowFocusArea] = useState(false);
    const [showTargetWeight, setShowTargetWeight] = useState(false);

    const [formData, setFormData] = useState({
        name: '', gender: '',
        birthYear: '2000', height: 175, weight: 70,
        goal: '', targetWeight: '', targetUnit: 'kg',
        focusAreas: [] as string[],
        level: '',
        daysPerWeek: 3, equipment: [] as string[],
        injuries: [] as string[],
        allergies: [] as string[]
    });

    const goNext = (increment = 1) => {
        setStep(prev => prev + increment);
    }

    const goBack = () => {
        if (showFocusArea) {
            setShowFocusArea(false);
            return;
        }

        if (showTargetWeight) {
            setShowTargetWeight(false);
            return;
        }

        if (step > 1) {
            setStep(prev => prev - 1);
        } else {
            navigate('/landing');
        }
    }

    // --- Handlers ---

    const handleIdentity = (data: any) => {
        setFormData(prev => ({ ...prev, ...data }));
        goNext();
    }

    const handleStats = (data: any) => {
        setFormData(prev => ({ ...prev, ...data }));
        goNext();
    }

    const handleGoal = (data: any) => {
        setFormData(prev => ({ ...prev, ...data }));

        const goal = data.goal;

        if (goal === 'gain_muscle') {
            setShowFocusArea(true);
            setShowTargetWeight(false);
        } else if (['lose_weight', 'maintain', 'gain_weight'].includes(goal)) {
            setShowTargetWeight(true);
            setShowFocusArea(false);
        } else {
            // Fallback
            goNext();
        }
    }

    const handleFocusArea = (areas: string[]) => {
        setFormData(prev => ({ ...prev, focusAreas: areas }));
        setShowFocusArea(false);
        goNext();
    }

    const handleTargetWeight = (data: any) => {
        setFormData(prev => ({ ...prev, targetWeight: data.target, targetUnit: data.unit }));
        setShowTargetWeight(false);
        goNext();
    }

    const handleLevel = (level: string) => {
        setFormData(prev => ({ ...prev, level }));
        goNext();
    }

    const handleAvail = (data: any) => {
        setFormData(prev => ({ ...prev, daysPerWeek: data.days, equipment: data.equipment }));
        goNext();
    }

    const handleInjuries = (injuries: string[]) => {
        setFormData(prev => ({ ...prev, injuries }));
        goNext();
    }

    const handleAllergies = (allergies: string[]) => {
        const finalData = { ...formData, allergies };
        setFormData(finalData);
        console.log('FINAL ONBOARDING DATA:', finalData);
        navigate('/dashboard'); // Finish
    }


    // --- Render ---

    // Sub-screens for Step 3
    if (showFocusArea) {
        return (
            <StepFocusArea
                onNext={handleFocusArea}
                onBack={goBack}
                initialSelection={formData.focusAreas}
            />
        );
    }

    if (showTargetWeight) {
        return (
            <StepTargetWeight
                onNext={handleTargetWeight}
                onBack={goBack}
                currentWeight={formData.weight}
                initialTarget={formData.targetWeight ? parseFloat(formData.targetWeight as string) : formData.weight}
                initialUnit={formData.targetUnit}
            />
        );
    }

    return (
        <>
            {step === 1 && <Step1Identity onNext={handleIdentity} initialData={formData} />}
            {step === 2 && <Step2Stats onNext={handleStats} onBack={goBack} initialData={formData} />}
            {step === 3 && <Step3Goal onNext={handleGoal} onBack={goBack} initialGoal={formData.goal} />}
            {step === 4 && <Step4Level onNext={handleLevel} onBack={goBack} initialLevel={formData.level} />}
            {step === 5 && <Step5Availability onNext={handleAvail} onBack={goBack} initialData={{ days: formData.daysPerWeek, equipment: formData.equipment }} />}
            {step === 6 && <Step6Injuries onNext={handleInjuries} onBack={goBack} initialData={formData.injuries} />}
            {step === 7 && <Step7Allergies onNext={handleAllergies} onBack={goBack} initialData={formData.allergies} />}
        </>
    );
}
