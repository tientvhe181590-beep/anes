/**
 * Auth feature types — Login, Register, JWT, User profile.
 * Maps 1:1 to backend DTOs in com.anes.server.auth.dto.*
 */

/** Credentials for POST /api/v1/auth/login */
export interface LoginCredentials {
  email: string;
  password: string;
}

/** Credentials for POST /api/v1/auth/register */
export interface RegisterCredentials {
  email: string;
  password: string;
  fullName: string;
}

/** Authenticated user info returned from backend */
export interface UserInfo {
  id: string;
  email: string;
  fullName: string;
  role: string;
  membershipTier: string;
}

/** Backend AuthResponse DTO (inside ApiResponse envelope) */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserInfo;
}

/** Form validation errors for login/register forms */
export interface AuthFormErrors {
  email?: string;
  password?: string;
  fullName?: string;
  general?: string;
}
