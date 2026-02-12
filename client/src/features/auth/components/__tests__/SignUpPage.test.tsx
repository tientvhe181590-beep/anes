import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import { SignUpPage } from '../SignUpPage';

const submitMock = vi.fn();

let registerState = {
  submit: submitMock,
  fieldErrors: {} as Record<string, string | undefined>,
  serverError: null as string | null,
  isLoading: false,
};

vi.mock('../../hooks/useRegister', () => ({
  useRegister: () => registerState,
}));

vi.mock('../../hooks/usePasswordStrength', () => ({
  usePasswordStrength: (pw: string) => ({
    score: pw.length > 0 ? 60 : 0,
    level: pw.length > 0 ? 'good' : 'weak',
    feedback: pw.length > 0 ? 'Good password strength.' : '',
    isBlocked: false,
    isBreached: false,
  }),
}));

vi.mock('../GoogleSignInButton', () => ({
  GoogleSignInButton: ({ label }: { label?: string }) => (
    <button type="button" aria-label={label ?? 'Sign in with Google'}>
      {label ?? 'Sign in with Google'}
    </button>
  ),
}));

vi.mock('../PasswordStrengthMeter', () => ({
  PasswordStrengthMeter: ({ level, feedback, visible }: { level: string; feedback: string; visible: boolean }) =>
    visible ? (
      <div role="status">
        <span>{level}</span>
        <span>{feedback}</span>
      </div>
    ) : null,
}));

describe('SignUpPage', () => {
  beforeEach(() => {
    submitMock.mockReset();
    registerState = { submit: submitMock, fieldErrors: {}, serverError: null, isLoading: false };
  });

  it('renders the sign-up form', () => {
    render(
      <MemoryRouter>
        <SignUpPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument();
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument();
  });

  it('shows strength meter when password is entered', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SignUpPage />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText('Password'), 'MySecurePass12');

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('good')).toBeInTheDocument();
  });

  it('submits registration details', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SignUpPage />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText('Full Name'), 'Jane Doe');
    await user.type(screen.getByLabelText('Email'), 'jane@example.com');
    await user.type(screen.getByLabelText('Password'), 'Password123');
    await user.type(screen.getByLabelText('Confirm Password'), 'Password123');
    await user.click(screen.getByRole('button', { name: 'Create Account' }));

    expect(submitMock).toHaveBeenCalledWith({
      email: 'jane@example.com',
      password: 'Password123',
      confirmPassword: 'Password123',
      fullName: 'Jane Doe',
    });
  });

  it('shows server error', () => {
    registerState = {
      submit: submitMock,
      fieldErrors: {},
      serverError: 'Registration failed',
      isLoading: false,
    };

    render(
      <MemoryRouter>
        <SignUpPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Registration failed');
  });
});
