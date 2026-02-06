import axios from 'axios';
import type { ApiResponse } from '@/shared/types';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

/**
 * Pre-configured Axios instance for all API calls.
 * - Base URL from environment
 * - JWT bearer token injection
 * - Standard error handling
 */
export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15_000,
});

// Request interceptor: attach JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('anes_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: unwrap envelope & handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!navigator.onLine) {
      // Offline — let RxDB handle it
      console.warn('[API] Offline, request queued or skipped.');
    }

    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // Token expired — could trigger refresh flow here
      localStorage.removeItem('anes_access_token');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  },
);

/**
 * Type-safe API helper that unwraps the standard envelope.
 */
export async function apiGet<T>(url: string): Promise<ApiResponse<T>> {
  const { data } = await apiClient.get<ApiResponse<T>>(url);
  return data;
}

export async function apiPost<T, B = unknown>(url: string, body: B): Promise<ApiResponse<T>> {
  const { data } = await apiClient.post<ApiResponse<T>>(url, body);
  return data;
}

export async function apiPut<T, B = unknown>(url: string, body: B): Promise<ApiResponse<T>> {
  const { data } = await apiClient.put<ApiResponse<T>>(url, body);
  return data;
}

export async function apiDelete<T>(url: string): Promise<ApiResponse<T>> {
  const { data } = await apiClient.delete<ApiResponse<T>>(url);
  return data;
}
