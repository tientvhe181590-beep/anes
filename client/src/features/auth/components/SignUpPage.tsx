import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { FormInput } from '@/shared/components/FormInput';
import { useRegister, type RegisterFields } from '../hooks/useRegister';
import { usePasswordStrength } from '../hooks/usePasswordStrength';
import { GoogleSignInButton } from './GoogleSignInButton';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';

export function SignUpPage() {
  const [values, setValues] = useState<RegisterFields>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });

  const { submit, fieldErrors, serverError, isLoading } = useRegister();
  const strength = usePasswordStrength(values.password);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    submit(values);
  }

  function handleChange(field: keyof RegisterFields, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 py-10">
      <div className="w-full" style={{ maxWidth: 400 }}>
        {/* Header */}
        <h1 className="text-center text-[28px] font-bold text-[var(--text-primary)]">
          Create Account
        </h1>
        <p className="mt-2 text-center text-sm text-[var(--text-secondary)]">
          Start your personalized fitness journey
        </p>

        {/* Server error */}
        {serverError && (
          <div
            className="mt-6 rounded-xl bg-[var(--accent-soft)] px-4 py-3 text-sm text-[var(--negative)]"
            role="alert"
          >
            {serverError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5" noValidate>
          <FormInput
            label="Full Name"
            type="text"
            placeholder="John Doe"
            autoComplete="name"
            value={values.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            error={fieldErrors.fullName}
          />

          <FormInput
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={values.email}
            onChange={(e) => handleChange('email', e.target.value)}
            error={fieldErrors.email}
          />

          <div className="flex flex-col gap-1.5">
            <FormInput
              label="Password"
              type="password"
              placeholder="••••••••••••"
              autoComplete="new-password"
              value={values.password}
              onChange={(e) => handleChange('password', e.target.value)}
              error={fieldErrors.password}
            />
            <PasswordStrengthMeter
              level={strength.level}
              feedback={strength.feedback}
              visible={values.password.length > 0}
            />
          </div>

          <FormInput
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            value={values.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            error={fieldErrors.confirmPassword}
          />

          <button
            type="submit"
            disabled={isLoading}
            className="flex h-12 items-center justify-center rounded-xl bg-[var(--accent)] text-base font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-[var(--border)]" />
          <span className="text-xs text-[var(--text-muted)]">or</span>
          <span className="h-px flex-1 bg-[var(--border)]" />
        </div>

        {/* Google Sign-In */}
        <GoogleSignInButton label="Sign in with Google" />

        {/* Login link */}
        <p className="mt-8 text-center text-sm text-[var(--text-secondary)]">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-[var(--accent)] hover:underline">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
