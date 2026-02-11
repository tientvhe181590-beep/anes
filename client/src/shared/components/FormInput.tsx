/**
 * FormInput — Reusable form input with label, error message, and password toggle.
 * Used across auth screens (Login, Register, Forgot Password).
 *
 * Design tokens: dark theme with swiss-* variables from design system.
 */
import { type InputHTMLAttributes, useState, useId } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface FormInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  /** Field label text */
  label: string;
  /** Validation error message */
  error?: string;
  /** Input type — password gets show/hide toggle */
  type?: 'text' | 'email' | 'password' | 'tel' | 'number';
}

export function FormInput({
  label,
  error,
  type = 'text',
  className,
  disabled,
  ...props
}: FormInputProps) {
  const id = useId();
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-(--text-secondary)">
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={inputType}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            'w-full rounded-lg border bg-(--surface-elevated) px-4 py-3 text-(--text-primary) placeholder-(--text-secondary) transition-colors',
            'border-(--border) focus:border-(--accent) focus:ring-1 focus:ring-(--accent) focus:outline-none',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-(--accent)',
            isPassword && 'pr-12',
            className,
          )}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-(--text-secondary) transition-colors hover:text-(--text-primary)"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>

      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-(--accent)">
          {error}
        </p>
      )}
    </div>
  );
}
