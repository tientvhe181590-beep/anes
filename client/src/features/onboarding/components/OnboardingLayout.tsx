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
}

export default function OnboardingLayout({
  children,
  title,
  subtitle,
  currentStep,
  totalSteps,
  onNext,
  onBack,
  nextLabel = 'Next',
  isNextDisabled = false,
}: OnboardingLayoutProps) {

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#0c0c0c] text-white font-sans sm:items-center sm:justify-center">
      {/* Mobile Container (Safe Area) */}
      <div className="flex min-h-screen w-full max-w-[430px] flex-col overflow-hidden bg-[#0c0c0c] sm:h-[844px] sm:min-h-0 sm:border sm:border-[#2a2a2a] sm:rounded-[32px]">

        {/* Header Section */}
        <div className="flex-none px-6 pt-12 pb-2">

          {/* Step Indicator */}
          <div className="mb-6">
            <span className="text-[13px] font-bold text-[#ff3b30]">Step {currentStep} of {totalSteps}</span>
            <div className="mt-3 flex gap-1.5 h-1 w-full opacity-80">
              {Array.from({ length: totalSteps }).map((_, idx) => (
                <div
                  key={idx}
                  className={`h-full flex-1 rounded-full transition-all duration-300 ${idx + 1 <= currentStep ? 'bg-[#ff3b30]' : 'bg-[#2a2a2a]'
                    }`}
                />
              ))}
            </div>
          </div>

          <h1 className="font-['Sora'] text-[32px] font-bold leading-tight tracking-tight text-white mb-2">
            {title}
          </h1>
          <p className="font-['Inter'] text-[15px] font-normal text-[#8a8a8a] leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-hide">
          {children}
        </div>

        {/* Bottom Sticky Action Area */}
        <div className="flex-none bg-gradient-to-t from-[#0c0c0c] via-[#0c0c0c] to-transparent p-6 pt-8">
          <div className="flex gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#1a1a1a] text-white transition-transform active:scale-95 hover:bg-[#2a2a2a]"
              >
                <ArrowLeft size={24} />
              </button>
            )}

            <button
              onClick={onNext}
              disabled={isNextDisabled}
              className={`h-14 flex-1 rounded-xl font-['Inter'] text-[16px] font-bold transition-all active:scale-[0.98]
                 ${isNextDisabled
                  ? 'bg-[#2a2a2a] text-[#525252] cursor-not-allowed'
                  : 'bg-[#ff3b30] text-white shadow-[0_4px_20px_rgba(255,59,48,0.25)] hover:shadow-[0_4px_25px_rgba(255,59,48,0.4)]'
                }
               `}
            >
              {nextLabel}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
