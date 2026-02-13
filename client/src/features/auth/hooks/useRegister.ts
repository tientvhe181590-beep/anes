import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod/v4';
import { AxiosError } from 'axios';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useAuthStore } from '@/app/store';
import { isBlockedPassword } from '@/shared/utils/common-passwords';
import { firebaseAuthApi } from '../api/auth.api';
import { getE2eAuthOverrides } from '@/shared/lib/e2e-auth';
import { getFirebaseAuth, isFirebaseConfigured } from '@/shared/lib/firebase';

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
  const { setFirebaseUser } = useAuthStore();
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof RegisterFields, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (body: Omit<RegisterFields, 'confirmPassword'>) => {
      const e2e = getE2eAuthOverrides();

      if (e2e?.createUserWithEmailAndPassword) {
        const credential = await e2e.createUserWithEmailAndPassword(body.email, body.password);
        const idToken = await credential.user.getIdToken(true);
        const response = await firebaseAuthApi({ idToken });
        return { user: response.user, idToken };
      }

      if (!isFirebaseConfigured()) {
        throw new Error('Firebase authentication is not configured.');
      }

      const credential = await createUserWithEmailAndPassword(getFirebaseAuth(), body.email, body.password);

      await updateProfile(credential.user, { displayName: body.fullName });

      const idToken = await credential.user.getIdToken(true);
      const response = await firebaseAuthApi({ idToken });
      return { user: response.user, idToken };
    },
    onSuccess: (data) => {
      setFirebaseUser(data.user, data.idToken);
      navigate('/onboarding', { replace: true });
    },
    onError: (error: unknown) => {
      if (error instanceof AxiosError) {
        const msg = error.response?.data?.message ?? 'Registration failed. Please try again.';
        setServerError(msg);
      } else if (error instanceof Error) {
        setServerError(error.message);
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
