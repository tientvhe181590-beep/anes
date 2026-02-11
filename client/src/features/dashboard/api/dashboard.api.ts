import { apiClient } from "@/shared/lib/api-client";
import type { DashboardSummary } from "../types/dashboard.types";

interface ApiResponse<T> {
  data: T;
  message: string;
}

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const response =
    await apiClient.get<ApiResponse<DashboardSummary>>(
      "/api/v1/dashboard/summary",
    );
  return response.data.data;
}
