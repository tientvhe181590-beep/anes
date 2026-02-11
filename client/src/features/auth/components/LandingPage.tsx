import { useState, useCallback } from "react";
import { Link } from "react-router";
import { useSwipe } from "@/shared/hooks/useSwipe";

interface Slide {
  title: string;
  body: string;
  emoji: string;
}

const slides: Slide[] = [
  {
    emoji: "🏋️",
    title: "AI-Powered Workouts",
    body: "Get personalized fitness plans crafted by AI, tailored to your goals, experience, and schedule.",
  },
  {
    emoji: "🥗",
    title: "Smart Nutrition",
    body: "Track meals effortlessly and get AI-generated recipes that match your dietary needs.",
  },
  {
    emoji: "📊",
    title: "Easy Tracking",
    body: "Monitor your progress with intuitive dashboards — calories, macros, streaks, all in one place.",
  },
];

export function LandingPage() {
  const [current, setCurrent] = useState(0);

  const goNext = useCallback(
    () => setCurrent((prev) => Math.min(prev + 1, slides.length - 1)),
    [],
  );

  const goPrev = useCallback(
    () => setCurrent((prev) => Math.max(prev - 1, 0)),
    [],
  );

  const goToSlide = useCallback(
    (index: number) => setCurrent(index),
    [],
  );

  const swipeHandlers = useSwipe({
    threshold: 50,
    onSwipeLeft: goNext,
    onSwipeRight: goPrev,
  });

  const isLastSlide = current === slides.length - 1;

  return (
    <main
      className="relative h-dvh w-full overflow-hidden select-none"
      style={{ maxWidth: 480, margin: "0 auto" }}
      {...{
        onTouchStart: swipeHandlers.onTouchStart,
        onTouchMove: swipeHandlers.onTouchMove,
        onTouchEnd: swipeHandlers.onTouchEnd,
        onMouseDown: swipeHandlers.onMouseDown,
        onMouseMove: swipeHandlers.onMouseMove,
        onMouseUp: swipeHandlers.onMouseUp,
        onMouseLeave: swipeHandlers.onMouseLeave,
      }}
      ref={swipeHandlers.ref}
    >
      {/* Skip button */}
      {!isLastSlide && (
        <button
          onClick={() => goToSlide(slides.length - 1)}
          className="absolute right-4 top-4 z-10 rounded-full px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
        >
          Skip
        </button>
      )}

      {/* Slide track */}
      <div
        className="flex h-full transition-transform duration-300 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div
            key={index}
            className="flex h-full w-full shrink-0 flex-col items-center justify-center px-8"
          >
            {/* Hero area */}
            <div className="flex h-[45%] w-full items-center justify-center rounded-2xl bg-[var(--surface)]">
              <span className="text-8xl">{slide.emoji}</span>
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col items-center pt-8">
              <h1 className="text-center text-[28px] font-bold leading-tight text-[var(--text-primary)]">
                {slide.title}
              </h1>
              <p className="mt-3 max-w-[300px] text-center text-base leading-relaxed text-[var(--text-secondary)]">
                {slide.body}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom area: dots + auth buttons */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-6 pb-12">
        {/* Pagination dots */}
        <div className="flex gap-2" role="tablist" aria-label="Slides">
          {slides.map((_, index) => (
            <button
              key={index}
              role="tab"
              aria-selected={index === current}
              aria-label={`Slide ${index + 1}`}
              onClick={() => goToSlide(index)}
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: index === current ? 24 : 8,
                backgroundColor:
                  index === current
                    ? "var(--accent)"
                    : "var(--text-muted)",
              }}
            />
          ))}
        </div>

        {/* Auth buttons on last slide */}
        {isLastSlide && (
          <div className="flex w-full flex-col gap-3 px-8">
            <Link
              to="/login"
              className="flex h-12 items-center justify-center rounded-xl bg-[var(--accent)] text-base font-semibold text-white transition-opacity hover:opacity-90"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="flex h-12 items-center justify-center rounded-xl border border-[var(--border-strong)] bg-transparent text-base font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--surface)]"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
