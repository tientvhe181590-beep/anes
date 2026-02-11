/**
 * Auth API layer — calls to /api/v1/auth/* endpoints.
 * Uses apiClient (Axios) directly for auth-specific error handling.
 */
import { apiClient } from '@/shared/lib/api-client';
import type { ApiResponse } from '@/shared/types';
import type { AuthResponse, LoginCredentials, RegisterCredentials } from '../types/auth';

/**
 * POST /api/v1/auth/login
 * Returns access + refresh tokens with user info.
 */
export async function loginApi(credentials: LoginCredentials): Promise<AuthResponse> {
  const { data } = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
  return data.data;
}

/**
 * POST /api/v1/auth/register
 * Creates account and returns auth tokens.
 */
export async function registerApi(credentials: RegisterCredentials): Promise<AuthResponse> {
  const { data } = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', credentials);
  return data.data;
}

/**
 * POST /api/v1/auth/refresh
 * Exchanges refresh token for new access + refresh tokens.
 */
export async function refreshApi(refreshToken: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<ApiResponse<AuthResponse>>('/auth/refresh', {
    refreshToken,
  });
  return data.data;
}
