/**
 * LoginForm tests — validates form rendering, validation, and submission.
 * SRS 3.1.1.2 acceptance criteria coverage.
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { LoginForm } from '../LoginForm';

// Mock the auth API
vi.mock('../../api/auth-api', () => ({
  loginApi: vi.fn(),
}));

import { loginApi } from '../../api/auth-api';
const mockLoginApi = vi.mocked(loginApi);

function renderLoginForm() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders email and password inputs', () => {
    renderLoginForm();

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('renders forgot password and google sign-in', () => {
    renderLoginForm();

    expect(screen.getByText('Forgot password?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
  });

  it('shows validation error for empty email on blur', async () => {
    const user = userEvent.setup();
    renderLoginForm();

    const emailInput = screen.getByLabelText('Email');
    await user.click(emailInput);
    await user.tab(); // blur

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Email is required');
    });
  });

  it('shows validation error for invalid email format', async () => {
    const user = userEvent.setup();
    renderLoginForm();

    const emailInput = screen.getByLabelText('Email');
    await user.type(emailInput, 'not-an-email');
    await user.tab();

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('valid email');
    });
  });

  it('shows validation error for short password', async () => {
    const user = userEvent.setup();
    renderLoginForm();

    const passwordInput = screen.getByLabelText('Password');
    await user.type(passwordInput, 'short');
    await user.tab();

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('at least 8 characters');
    });
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    renderLoginForm();

    const passwordInput = screen.getByLabelText('Password');
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleBtn = screen.getByLabelText('Show password');
    await user.click(toggleBtn);

    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText('Hide password')).toBeInTheDocument();
  });

  it('submits valid credentials and calls login API', async () => {
    const user = userEvent.setup();
    mockLoginApi.mockResolvedValueOnce({
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token',
      user: {
        id: '123',
        email: 'test@example.com',
        fullName: 'Test User',
        role: 'member',
        membershipTier: 'Free',
      },
    });

    renderLoginForm();

    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLoginApi).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('does not submit with invalid inputs', async () => {
    const user = userEvent.setup();
    renderLoginForm();

    // Submit with empty fields
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getAllByRole('alert').length).toBeGreaterThanOrEqual(1);
    });

    expect(mockLoginApi).not.toHaveBeenCalled();
  });

  it('shows error message on failed login (401)', async () => {
    const user = userEvent.setup();

    const axiosError = {
      isAxiosError: true,
      response: { status: 401, data: { error: { message: 'Invalid credentials' } } },
    };
    mockLoginApi.mockRejectedValueOnce(axiosError);

    // Mock axios.isAxiosError to return true for our error
    vi.mock('axios', async () => {
      const actual = await vi.importActual('axios');
      return {
        ...actual,
        default: actual,
        isAxiosError: (e: unknown) => !!(e && typeof e === 'object' && 'isAxiosError' in e),
      };
    });

    renderLoginForm();

    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      const alerts = screen.getAllByRole('alert');
      const errorAlert = alerts.find((a) => a.textContent?.includes('Incorrect'));
      expect(errorAlert).toBeDefined();
    });
  });

  it('disables form while submitting', async () => {
    const user = userEvent.setup();

    // Create a promise that we control
    let resolveLogin: (value: unknown) => void;
    const loginPromise = new Promise((resolve) => {
      resolveLogin = resolve;
    });
    mockLoginApi.mockReturnValueOnce(loginPromise as ReturnType<typeof loginApi>);

    renderLoginForm();

    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
    });

    // Cleanup
    resolveLogin!({
      accessToken: 'tok',
      refreshToken: 'ref',
      user: { id: '1', email: 'a@b.c', fullName: 'X', role: 'member', membershipTier: 'Free' },
    });
  });
});
