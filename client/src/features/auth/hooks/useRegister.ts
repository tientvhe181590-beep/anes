import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod/v4';
import { AxiosError } from 'axios';
import { useAuthStore } from '@/app/store';
import { isBlockedPassword } from '@/shared/utils/common-passwords';
import { registerApi } from '../api/auth.api';

const registerSchema = z
  .object({
    email: z.email('Please enter a valid email address.'),
    password: z
      .string()
      .min(12, 'Password must be at least 12 characters.')
      .max(128, 'Password must be at most 128 characters.')
      .refine((pw) => !isBlockedPassword(pw), {
        message: 'This password is too common. Please choose a different one.',
      }),
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
    fullName: z.string().min(1, 'Full name is required.').max(255),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export type RegisterFields = z.infer<typeof registerSchema>;

export function useRegister() {
  const navigate = useNavigate();
  const { setTokens, setUser } = useAuthStore();
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof RegisterFields, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: registerApi,
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
      navigate('/onboarding', { replace: true });
    },
    onError: (error: unknown) => {
      if (error instanceof AxiosError) {
        const msg = error.response?.data?.message ?? 'Registration failed. Please try again.';
        setServerError(msg);
      } else {
        setServerError('An unexpected error occurred.');
      }
    },
  });

  function validate(values: RegisterFields): boolean {
    const result = registerSchema.safeParse(values);
    if (!result.success) {
      const errs: Partial<Record<keyof RegisterFields, string>> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof RegisterFields;
        if (!errs[key]) errs[key] = issue.message;
      }
      setFieldErrors(errs);
      return false;
    }
    setFieldErrors({});
    return true;
  }

  function submit(values: RegisterFields) {
    setServerError(null);
    if (!validate(values)) return;
    const { confirmPassword, ...body } = values;
    void confirmPassword;
    mutation.mutate(body);
  }

  return {
    submit,
    fieldErrors,
    serverError,
    isLoading: mutation.isPending,
  };
}
