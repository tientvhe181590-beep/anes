/**
 * SignUpPage — Registration screen entry point.
 * SRS 3.1.1.3 — Full-screen dark layout with dumbbell logo, sign-up form,
 * and login navigation link. Design ref: entry-screens.pen KgOMD.
 */
import { Dumbbell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SignUpForm } from './SignUpForm';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col bg-(--bg)">
      {/* Header — Logo + Title */}
      <div className="flex flex-col items-center gap-2 px-8 pt-16 pb-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-(--accent)">
          <Dumbbell size={32} className="text-white" />
        </div>
        <h1 className="mt-1 text-[28px] leading-none font-bold tracking-tight text-(--text-primary)">
          Create Account
        </h1>
        <p className="text-sm text-(--text-secondary)">Start your fitness journey today</p>
      </div>

      {/* Form Area */}
      <div className="flex-1 px-8 pt-4">
        <SignUpForm />
      </div>

      {/* Footer — Login link */}
      <div className="flex items-center justify-center gap-1 px-8 pb-12">
        <span className="text-[13px] text-(--text-secondary)">Already have an account?</span>
        <Link
          to="/login"
          className="text-[13px] font-semibold text-(--accent) transition-colors hover:text-(--accent-hover)"
        >
          Login
        </Link>
      </div>
    </div>
  );
}
