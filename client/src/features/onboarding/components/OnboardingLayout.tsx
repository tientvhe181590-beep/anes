import { ArrowLeft } from 'lucide-react';
import { ReactNode } from 'react';

interface OnboardingLayoutProps {
    children: ReactNode;
    title: string;
    subtitle: string;
    currentStep: number;
    totalSteps: number;
    onNext: () => void;
    onBack?: () => void;
    nextLabel?: string;
    isNextDisabled?: boolean;
    showSkip?: boolean; // For optional steps?
}

export default function OnboardingLayout({
    children,
    title,
    subtitle,
    currentStep,
    totalSteps,
    onNext,
    onBack,
    nextLabel = 'Continue',
    isNextDisabled = false,
}: OnboardingLayoutProps) {
    const progressPercentage = (currentStep / totalSteps) * 100;

    return (
        <div className="flex min-h-screen w-full flex-col bg-[#0c0c0c] text-white font-sans selection:bg-[#ff3b30] selection:text-white">
            {/* Background Ambient Effect */}
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,#1f1f1f_0%,#0c0c0c_70%)] opacity-80" />

            {/* Top Bar / Navigation */}
            <div className="relative z-10 flex h-16 w-full items-center justify-between px-6 pt-2">
                {onBack ? (
                    <button
                        onClick={onBack}
                        className="flex h-10 w-10 items-center justify-center rounded-full text-[#8a8a8a] transition-all hover:bg-white/5 hover:text-white"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                ) : (
                    <div className="w-10" /> // Spacer
                )}

                {/* Step Indicator (Optional, if we want centered 'Step 1 of 8') */}
                {/* <span className="text-xs font-semibold uppercase tracking-wider text-[#ff3b30]">Step {currentStep} of {totalSteps}</span> */}
                <div className="w-10" /> // Spacer
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-1 flex-col px-6 pb-10 pt-2">

                {/* Progress Bar Section */}
                <div className="mb-8 w-full">
                    <div className="mb-4 flex items-center justify-between">
                        <span className="text-sm font-semibold text-[#ff3b30]">Step {currentStep} of {totalSteps}</span>
                    </div>

                    {/* Segmented Progress Bar */}
                    <div className="flex gap-1.5 h-1.5 w-full">
                        {Array.from({ length: totalSteps }).map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-full flex-1 rounded-full transition-all duration-500 ${idx + 1 <= currentStep ? 'bg-[#ff3b30]' : 'bg-[#2a2a2a]'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Text Header */}
                <div className="mb-8 text-center sm:text-left">
                    <h1 className="mb-3 font-['Sora'] text-2xl font-bold tracking-tight text-white sm:text-3xl">
                        {title}
                    </h1>
                    <p className="font-['Inter'] text-[15px] font-medium leading-relaxed text-[#8a8a8a]">
                        {subtitle}
                    </p>
                </div>

                {/* Content / Form Area */}
                <div className="flex-1">
                    {children}
                </div>

                {/* Bottom Actions */}
                <div className="mt-8">
                    <button
                        onClick={onNext}
                        disabled={isNextDisabled}
                        className={`group relative flex h-14 w-full items-center justify-center overflow-hidden rounded-xl bg-[#ff3b30] font-['Inter'] text-[16px] font-semibold text-white shadow-[0_4px_20px_rgba(255,59,48,0.25)] transition-all
                ${isNextDisabled
                                ? 'bg-[#2a2a2a] text-[#525252] shadow-none cursor-not-allowed'
                                : 'hover:shadow-[0_4px_25px_rgba(255,59,48,0.4)] hover:scale-[1.02] active:scale-[0.98]'
                            }`}
                    >
                        <span className="relative z-10">{nextLabel}</span>
                    </button>
                </div>

            </div>
        </div>
    );
}
