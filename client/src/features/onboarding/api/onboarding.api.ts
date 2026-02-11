import { apiClient } from "@/shared/lib/api-client";
import type {
  OnboardingRequest,
  OnboardingResponse,
} from "../types/onboarding.types";

interface ApiEnvelope<T> {
  data: T;
  message: string;
}

export async function submitOnboarding(
  body: OnboardingRequest,
): Promise<OnboardingResponse> {
  const response = await apiClient.post<ApiEnvelope<OnboardingResponse>>(
    "/api/v1/onboarding/complete",
    body,
  );
  return response.data.data;
}
