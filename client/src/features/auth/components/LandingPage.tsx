import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

/**
 * LandingPage — Onboarding/welcome screen with centered card layout.
 * Dark modern theme matching Login screen style.
 * SRS 3.1.1.1 — AI-Powered Workouts onboarding screen.
 *
 * Design: Full-screen dark background with centered card, compact spacing,
 * matching AuthLayout visual style (rounded corners, border, surface color).
 */
export default function LandingPage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login');
  };

  const handleSkip = () => {
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-(--bg) px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo & Brand */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-(--accent)">ANES</h1>
          <p className="mt-1 text-sm text-(--text-secondary)">
            AI-driven Nutrition & Exercise System
          </p>
        </div>

        {/* Main Card */}
        <div className="rounded-2xl border border-(--border) bg-(--surface) p-8">
          {/* Icon / Visual */}
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-(--accent)/10 p-4">
              <Sparkles className="h-8 w-8 text-(--accent)" />
            </div>
          </div>

          {/* Title */}
          <div className="mb-6 text-center">
            <h2 className="text-xl font-semibold text-(--text-primary)">AI-Powered Workouts</h2>
          </div>

          {/* Subtitle / Description */}
          <p className="mb-8 text-center text-sm leading-relaxed text-(--text-secondary)">
            Get personalized fitness plans, smart nutrition guidance, and easy progress tracking—all
            powered by AI.
          </p>

          {/* Primary CTA */}
          <button
            onClick={handleGetStarted}
            className="mb-4 flex h-12 w-full items-center justify-center rounded-lg bg-(--accent) font-semibold text-white transition-transform active:scale-95"
          >
            Get Started
          </button>

          {/* Skip Link */}
          <button
            onClick={handleSkip}
            className="flex h-10 w-full items-center justify-center rounded-lg text-sm font-medium text-(--text-secondary) transition-colors hover:text-(--text-primary)"
          >
            Skip For Now
          </button>
        </div>
      </div>
    </div>
  );
}
