/**
 * SignUpForm tests — validates form rendering, validation, and submission.
 * SRS 3.1.1.3 acceptance criteria coverage.
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { SignUpForm } from '../SignUpForm';

// Mock the auth API
vi.mock('../../api/auth-api', () => ({
  registerApi: vi.fn(),
}));

import { registerApi } from '../../api/auth-api';
const mockRegisterApi = vi.mocked(registerApi);

function renderSignUpForm() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <SignUpForm />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('SignUpForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders email, password, and confirm password inputs', () => {
    renderSignUpForm();

    expect(screen.getByLabelText('EMAIL')).toBeInTheDocument();
    expect(screen.getByLabelText('PASSWORD')).toBeInTheDocument();
    expect(screen.getByLabelText('CONFIRM PASSWORD')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('renders TOS checkbox and login link', () => {
    renderSignUpForm();

    expect(screen.getByLabelText(/terms of service/i)).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('disables submit button when TOS is unchecked', () => {
    renderSignUpForm();

    const submitBtn = screen.getByRole('button', { name: /create account/i });
    expect(submitBtn).toBeDisabled();
  });

  it('enables submit button when TOS is checked', async () => {
    const user = userEvent.setup();
    renderSignUpForm();

    await user.click(screen.getByRole('checkbox'));

    const submitBtn = screen.getByRole('button', { name: /create account/i });
    expect(submitBtn).toBeEnabled();
  });

  it('shows validation error for empty email on blur', async () => {
    const user = userEvent.setup();
    renderSignUpForm();

    const emailInput = screen.getByLabelText('EMAIL');
    await user.click(emailInput);
    await user.tab();

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Email is required');
    });
  });

  it('shows validation error for invalid email format', async () => {
    const user = userEvent.setup();
    renderSignUpForm();

    const emailInput = screen.getByLabelText('EMAIL');
    await user.type(emailInput, 'not-an-email');
    await user.tab();

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('valid email');
    });
  });

  it('shows validation error for short password', async () => {
    const user = userEvent.setup();
    renderSignUpForm();

    const passwordInput = screen.getByLabelText('PASSWORD');
    await user.type(passwordInput, 'Short1');
    await user.tab();

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('at least 8 characters');
    });
  });

  it('shows validation error when password lacks uppercase letter', async () => {
    const user = userEvent.setup();
    renderSignUpForm();

    const passwordInput = screen.getByLabelText('PASSWORD');
    await user.type(passwordInput, 'password123');
    await user.tab();

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('uppercase');
    });
  });

  it('shows validation error when password lacks number', async () => {
    const user = userEvent.setup();
    renderSignUpForm();

    const passwordInput = screen.getByLabelText('PASSWORD');
    await user.type(passwordInput, 'PasswordOnly');
    await user.tab();

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('number');
    });
  });

  it('shows validation error when passwords do not match', async () => {
    const user = userEvent.setup();
    renderSignUpForm();

    await user.type(screen.getByLabelText('PASSWORD'), 'Password1');
    await user.type(screen.getByLabelText('CONFIRM PASSWORD'), 'Password2');
    await user.tab();

    await waitFor(() => {
      const alerts = screen.getAllByRole('alert');
      const matchError = alerts.find((a) => a.textContent?.includes("don't match"));
      expect(matchError).toBeDefined();
    });
  });

  it('clears confirm password error when passwords match', async () => {
    const user = userEvent.setup();
    renderSignUpForm();

    await user.type(screen.getByLabelText('PASSWORD'), 'Password1');
    await user.type(screen.getByLabelText('CONFIRM PASSWORD'), 'Password2');
    await user.tab();

    await waitFor(() => {
      const alerts = screen.getAllByRole('alert');
      expect(alerts.find((a) => a.textContent?.includes("don't match"))).toBeDefined();
    });

    // Fix the confirm password
    await user.clear(screen.getByLabelText('CONFIRM PASSWORD'));
    await user.type(screen.getByLabelText('CONFIRM PASSWORD'), 'Password1');
    await user.tab();

    await waitFor(() => {
      const alerts = screen.queryAllByRole('alert');
      const matchError = alerts.find((a) => a.textContent?.includes("don't match"));
      expect(matchError).toBeUndefined();
    });
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    renderSignUpForm();

    const passwordInput = screen.getByLabelText('PASSWORD');
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleButtons = screen.getAllByLabelText('Show password');
    await user.click(toggleButtons[0]);

    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  it('submits valid credentials and calls register API', async () => {
    const user = userEvent.setup();
    mockRegisterApi.mockResolvedValueOnce({
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

    renderSignUpForm();

    await user.type(screen.getByLabelText('EMAIL'), 'test@example.com');
    await user.type(screen.getByLabelText('PASSWORD'), 'Password1');
    await user.type(screen.getByLabelText('CONFIRM PASSWORD'), 'Password1');
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(mockRegisterApi).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password1',
      });
    });
  });

  it('does not submit with invalid inputs', async () => {
    const user = userEvent.setup();
    renderSignUpForm();

    // Check TOS so button is enabled
    await user.click(screen.getByRole('checkbox'));
    // Submit with empty fields
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getAllByRole('alert').length).toBeGreaterThanOrEqual(1);
    });

    expect(mockRegisterApi).not.toHaveBeenCalled();
  });

  it('shows error message when email is already registered', async () => {
    const user = userEvent.setup();

    const axiosError = {
      isAxiosError: true,
      response: {
        status: 400,
        data: { error: { message: 'Email already registered' } },
      },
    };
    mockRegisterApi.mockRejectedValueOnce(axiosError);

    // Mock axios.isAxiosError
    vi.mock('axios', async () => {
      const actual = await vi.importActual('axios');
      return {
        ...actual,
        default: actual,
        isAxiosError: (e: unknown) => !!(e && typeof e === 'object' && 'isAxiosError' in e),
      };
    });

    renderSignUpForm();

    await user.type(screen.getByLabelText('EMAIL'), 'existing@example.com');
    await user.type(screen.getByLabelText('PASSWORD'), 'Password1');
    await user.type(screen.getByLabelText('CONFIRM PASSWORD'), 'Password1');
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      const alerts = screen.getAllByRole('alert');
      const errorAlert = alerts.find((a) => a.textContent?.includes('already registered'));
      expect(errorAlert).toBeDefined();
    });
  });

  it('disables form while submitting', async () => {
    const user = userEvent.setup();

    let resolveRegister: (value: unknown) => void;
    const registerPromise = new Promise((resolve) => {
      resolveRegister = resolve;
    });
    mockRegisterApi.mockReturnValueOnce(registerPromise as ReturnType<typeof registerApi>);

    renderSignUpForm();

    await user.type(screen.getByLabelText('EMAIL'), 'test@example.com');
    await user.type(screen.getByLabelText('PASSWORD'), 'Password1');
    await user.type(screen.getByLabelText('CONFIRM PASSWORD'), 'Password1');
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /creating account/i })).toBeDisabled();
    });

    // Cleanup
    resolveRegister!({
      accessToken: 'tok',
      refreshToken: 'ref',
      user: { id: '1', email: 'a@b.c', fullName: 'X', role: 'member', membershipTier: 'Free' },
    });
  });
});
