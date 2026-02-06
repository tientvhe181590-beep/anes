/**
 * Landing Page — Entry screen for unauthenticated users.
 * SRS 3.1.1.1 — Intro Carousel with CTA to Login/Register.
 * This is a stub component to be implemented per the screen plan.
 */
export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-white px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-indigo-600">ANES</h1>
        <p className="mt-2 text-lg text-gray-600">AI-driven Nutrition & Exercise System</p>
        <p className="mt-6 text-sm text-gray-400">Project skeleton initialized successfully.</p>
        <div className="mt-8 flex justify-center gap-4">
          <button className="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white shadow-sm transition-colors hover:bg-indigo-700">
            Get Started
          </button>
          <button className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50">
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
