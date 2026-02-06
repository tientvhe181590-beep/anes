import { Dumbbell } from 'lucide-react';
import { useLandingLogic } from '../hooks/useLandingLogic';

export default function LandingPage() {
  const {
    currentSlide,
    currentSlideIndex,
    isLastSlide,
    slides,
    handleNext,
    handleSkip,
    handleLogin,
    handleSignUp,
  } = useLandingLogic();

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#0c0c0c] text-white font-sans">
      {/* Top Bar */}
      <div className="flex h-14 w-full items-center justify-end px-6 pt-6">
        {!isLastSlide && (
          <button
            onClick={handleSkip}
            className="font-medium text-[#8a8a8a] hover:text-white transition-colors"
          >
            Skip
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col items-center justify-between pb-8">

        {/* Top/Hero Area */}
        <div className="w-full px-4">
          <div
            className={`w-full h-[380px] rounded-b-xl rounded-t-none ${currentSlide.imagePlaceholderColor} flex items-center justify-center opacity-80`}
          >
            {/* Placeholder for Hero Illustration */}
            <Dumbbell className="h-24 w-24 text-white/20" />
          </div>
        </div>

        {/* Text Content */}
        <div className="flex w-full flex-col items-center px-10 pt-10 text-center">
          <h1 className="font-['Sora'] text-[28px] font-bold leading-tight tracking-tight text-white mb-4">
            {currentSlide.title}
          </h1>
          <p className="max-w-[300px] font-['Inter'] text-[15px] font-normal leading-relaxed text-[#8a8a8a]">
            {currentSlide.body}
          </p>
        </div>

        {/* Bottom Actions */}
        <div className="flex w-full flex-col items-center gap-6 px-8 pb-8 pt-6">

          {/* Pagination Dots */}
          <div className="flex gap-2 mb-2">
            {slides.map((s, idx) => (
              <div
                key={s.id}
                className={`h-2 rounded-full transition-all duration-300 ${idx === currentSlideIndex
                    ? 'w-[10px] h-[10px] bg-[#ff3b30]'
                    : 'w-2 h-2 bg-[#8a8a8a]'
                  }`}
              />
            ))}
          </div>

          {!isLastSlide ? (
            /* Next Button (Slide 1 & 2) */
            <button
              onClick={handleNext}
              className="flex h-14 w-full items-center justify-center rounded-md bg-[#ff3b30] font-['Inter'] text-base font-semibold text-white transition-transform active:scale-95"
            >
              Next
            </button>
          ) : (
            /* Login / Sign Up Buttons (Slide 3) */
            <div className="flex w-full flex-col gap-4">
              <button
                onClick={handleLogin}
                className="flex h-14 w-full items-center justify-center rounded-md bg-[#ff3b30] font-['Inter'] text-base font-semibold text-white transition-transform active:scale-95"
              >
                Login
              </button>
              <button
                onClick={handleSignUp}
                className="flex h-14 w-full items-center justify-center rounded-md border border-[#ff3b30] bg-[#0c0c0c] font-['Inter'] text-base font-semibold text-[#ff3b30] transition-transform active:scale-95"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
