import { useState } from "react";
import { useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod/v4";
import { AxiosError } from "axios";
import { useAuthStore } from "@/app/store";
import { loginApi } from "../api/auth.api";

const loginSchema = z.object({
  email: z.email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export type LoginFields = z.infer<typeof loginSchema>;

export function useLogin() {
  const navigate = useNavigate();
  const { setTokens, setUser } = useAuthStore();
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof LoginFields, string>>
  >({});
  const [serverError, setServerError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
      if (data.user.onboardingComplete) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/onboarding", { replace: true });
      }
    },
    onError: (error: unknown) => {
      if (error instanceof AxiosError) {
        const msg =
          error.response?.data?.message ??
          "Login failed. Please try again.";
        setServerError(msg);
      } else {
        setServerError("An unexpected error occurred.");
      }
    },
  });

  function validate(values: LoginFields): boolean {
    const result = loginSchema.safeParse(values);
    if (!result.success) {
      const errs: Partial<Record<keyof LoginFields, string>> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof LoginFields;
        if (!errs[key]) errs[key] = issue.message;
      }
      setFieldErrors(errs);
      return false;
    }
    setFieldErrors({});
    return true;
  }

  function submit(values: LoginFields) {
    setServerError(null);
    if (!validate(values)) return;
    mutation.mutate(values);
  }

  return {
    submit,
    fieldErrors,
    serverError,
    isLoading: mutation.isPending,
  };
}
