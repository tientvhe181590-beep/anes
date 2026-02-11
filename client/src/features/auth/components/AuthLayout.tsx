/**
 * AuthLayout — Centered card layout for auth screens (Login, Register, Forgot Password).
 * Dark theme with ANES branding, matching the design system.
 *
 * Design: Full-screen dark background (#0C0C0C) with centered card (#1A1A1A).
 */
import type { ReactNode } from 'react';

interface AuthLayoutProps {
  /** Page title shown below the logo */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Form content */
  children: ReactNode;
  /** Footer content (links to other auth screens) */
  footer?: ReactNode;
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-(--bg) px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-(--accent)">ANES</h1>
          <p className="mt-1 text-sm text-(--text-secondary)">
            AI-driven Nutrition & Exercise System
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-(--border) bg-(--surface) p-8">
          {/* Title */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-(--text-primary)">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-(--text-secondary)">{subtitle}</p>}
          </div>

          {/* Form Content */}
          {children}
        </div>

        {/* Footer Links */}
        {footer && <div className="mt-6 text-center text-sm text-(--text-secondary)">{footer}</div>}
      </div>
    </div>
  );
}
