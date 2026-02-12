import { apiClient } from '@/shared/lib/api-client';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  GoogleAuthRequest,
} from '../types/auth.types';

interface ApiEnvelope<T> {
  data: T;
  message: string;
}

export async function loginApi(body: LoginRequest): Promise<AuthResponse> {
  const response = await apiClient.post<ApiEnvelope<AuthResponse>>('/api/v1/auth/login', body);
  return response.data.data;
}

export async function registerApi(body: RegisterRequest): Promise<AuthResponse> {
  const response = await apiClient.post<ApiEnvelope<AuthResponse>>('/api/v1/auth/register', body);
  return response.data.data;
}

export async function googleAuthApi(body: GoogleAuthRequest): Promise<AuthResponse> {
  const response = await apiClient.post<ApiEnvelope<AuthResponse>>('/api/v1/auth/google', body);
  return response.data.data;
}
