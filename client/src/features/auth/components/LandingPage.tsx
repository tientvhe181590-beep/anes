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
    <div className="flex min-h-screen w-full flex-col bg-[#0c0c0c] text-white font-sans selection:bg-[#ff3b30] selection:text-white">
      {/* Background Ambient Effect */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,#1f1f1f_0%,#0c0c0c_70%)] opacity-80" />

      {/* Top Bar */}
      <div className="relative z-10 flex h-16 w-full items-center justify-end px-6 pt-2">
        {!isLastSlide && (
          <button
            onClick={handleSkip}
            className="rounded-full px-4 py-2 text-sm font-medium text-[#8a8a8a] transition-all hover:bg-white/5 hover:text-white"
          >
            Skip
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-1 flex-col justify-between pb-10">

        {/* Top/Hero Area */}
        <div className="flex w-full flex-1 items-center justify-center px-6 py-8">
          <div
            className={`relative flex aspect-[4/5] w-full max-w-[340px] items-center justify-center overflow-hidden rounded-3xl ${currentSlide.imagePlaceholderColor}/20 ring-1 ring-white/10 backdrop-blur-3xl transition-all duration-500`}
          >
            {/* Abstract Gradient Glow */}
            <div className={`absolute inset-0 bg-gradient-to-br ${currentSlide.imagePlaceholderColor} opacity-30 mix-blend-screen bg-blend-overlay`} />

            {/* Icon */}
            <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-white/5 backdrop-blur-md ring-1 ring-white/20 shadow-2xl">
              <Dumbbell className="h-10 w-10 text-white/90 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div className="flex w-full flex-col items-center px-8 text-center">
          <h1 className="mb-3 font-['Sora'] text-3xl font-bold tracking-tight text-white drop-shadow-sm sm:text-4xl">
            {currentSlide.title}
          </h1>
          <p className="max-w-[320px] font-['Inter'] text-[15px] font-medium leading-relaxed text-[#8a8a8a] sm:text-base">
            {currentSlide.body}
          </p>
        </div>

        {/* Bottom Actions */}
        <div className="flex w-full flex-col items-center gap-8 px-6 pt-8">

          {/* Pagination Dots */}
          <div className="flex items-center gap-3">
            {slides.map((s, idx) => (
              <div
                key={s.id}
                className={`h-1.5 rounded-full transition-all duration-500 ease-out ${idx === currentSlideIndex
                    ? 'w-8 bg-[#ff3b30] shadow-[0_0_10px_rgba(255,59,48,0.5)]'
                    : 'w-1.5 bg-[#2a2a2a]'
                  }`}
              />
            ))}
          </div>

          <div className="w-full max-w-sm">
            {!isLastSlide ? (
              /* Next Button */
              <button
                onClick={handleNext}
                className="group relative flex h-14 w-full items-center justify-center overflow-hidden rounded-xl bg-[#ff3b30] font-['Inter'] text-[16px] font-semibold text-white shadow-[0_4px_20px_rgba(255,59,48,0.25)] transition-all hover:shadow-[0_4px_25px_rgba(255,59,48,0.4)] hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="relative z-10">Next</span>
              </button>
            ) : (
              /* Login / Sign Up Buttons */
              <div className="flex w-full flex-col gap-3">
                <button
                  onClick={handleLogin}
                  className="group relative flex h-14 w-full items-center justify-center overflow-hidden rounded-xl bg-[#ff3b30] font-['Inter'] text-[16px] font-semibold text-white shadow-[0_4px_20px_rgba(255,59,48,0.25)] transition-all hover:shadow-[0_4px_25px_rgba(255,59,48,0.4)] hover:scale-[1.02] active:scale-[0.98]"
                >
                  Login
                </button>
                <button
                  onClick={handleSignUp}
                  className="item-center flex h-14 w-full justify-center rounded-xl border border-[#2a2a2a] bg-[#0c0c0c] font-['Inter'] text-[16px] font-semibold text-white hover:bg-[#1a1a1a] hover:border-white/10 transition-all active:scale-[0.98]"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
