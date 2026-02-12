import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import { LoginPage } from '../LoginPage';

const submitMock = vi.fn();

let loginState = {
  submit: submitMock,
  fieldErrors: {} as Record<string, string | undefined>,
  serverError: null as string | null,
  isLoading: false,
};

vi.mock('../../hooks/useLogin', () => ({
  useLogin: () => loginState,
}));

vi.mock('../GoogleSignInButton', () => ({
  GoogleSignInButton: ({ label }: { label?: string }) => (
    <button type="button" aria-label={label ?? 'Sign in with Google'}>
      {label ?? 'Sign in with Google'}
    </button>
  ),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    submitMock.mockReset();
    loginState = { submit: submitMock, fieldErrors: {}, serverError: null, isLoading: false };
  });

  it('renders the login form', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument();
  });

  it('submits credentials', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText('Email'), 'user@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Login' }));

    expect(submitMock).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123',
    });
  });

  it('shows server error', () => {
    loginState = {
      submit: submitMock,
      fieldErrors: {},
      serverError: 'Invalid credentials',
      isLoading: false,
    };

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials');
  });
});
