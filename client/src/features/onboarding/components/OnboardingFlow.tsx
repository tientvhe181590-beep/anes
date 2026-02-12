import { useOnboarding } from '../hooks/useOnboarding';
import { StepBasics } from './StepBasics';
import { StepStats } from './StepStats';
import { StepGoal } from './StepGoal';
import { StepTargetWeight } from './StepTargetWeight';
import { StepFocusArea } from './StepFocusArea';
import { StepExperience } from './StepExperience';
import { StepInjuries } from './StepInjuries';
import { StepAllergies } from './StepAllergies';
import { StepAvailability } from './StepAvailability';

export function OnboardingFlow() {
  const {
    data,
    updateData,
    currentStep,
    visualStepNumber,
    totalVisualSteps,
    goNext,
    goBack,
    isFirstStep,
    isLastStep,
    getError,
    serverError,
    isSubmitting,
  } = useOnboarding();

  function renderStep() {
    const props = { data, updateData, getError };

    switch (currentStep) {
      case 'basics':
        return <StepBasics {...props} />;
      case 'stats':
        return <StepStats {...props} />;
      case 'goal':
        return <StepGoal {...props} />;
      case 'targetWeight':
        return <StepTargetWeight {...props} />;
      case 'focusArea':
        return <StepFocusArea {...props} />;
      case 'experience':
        return <StepExperience {...props} />;
      case 'injuries':
        return <StepInjuries {...props} />;
      case 'allergies':
        return <StepAllergies {...props} />;
      case 'availability':
        return <StepAvailability {...props} />;
      default:
        return null;
    }
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[var(--surface)]">
      {/* Progress header */}
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <span className="text-sm font-medium text-[var(--text-secondary)]">
            Step {visualStepNumber} of {totalVisualSteps}
          </span>

          {/* Progress bar */}
          <div className="ml-4 h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--border)]">
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-all duration-300"
              style={{
                width: `${(visualStepNumber / totalVisualSteps) * 100}%`,
              }}
            />
          </div>
        </div>
      </header>

      {/* Step content */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-md">{renderStep()}</div>
      </main>

      {/* Server error */}
      {serverError && (
        <div className="px-4">
          <p className="mx-auto max-w-md rounded-lg bg-[var(--negative-soft)] px-4 py-2 text-center text-sm text-[var(--negative)]">
            {serverError}
          </p>
        </div>
      )}

      {/* Navigation footer */}
      <footer className="sticky bottom-0 border-t border-[var(--border)] bg-[var(--surface)] px-4 py-4">
        <div className="mx-auto flex max-w-md gap-3">
          {!isFirstStep && (
            <button
              type="button"
              onClick={goBack}
              className="flex-1 rounded-xl border-2 border-[var(--border)] px-4 py-3 text-sm font-semibold text-[var(--text-secondary)] transition-colors active:bg-[var(--surface-elevated)]"
            >
              Back
            </button>
          )}

          <button
            type="button"
            onClick={goNext}
            disabled={isSubmitting}
            className="flex-1 rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white transition-opacity active:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving…' : isLastStep ? 'Complete' : 'Next'}
          </button>
        </div>
      </footer>
    </div>
  );
}
