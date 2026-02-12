export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: number;
    email: string;
    fullName: string;
    onboardingComplete: boolean;
  };
}

export interface FirebaseAuthResponse {
  user: {
    id: number;
    email: string;
    fullName: string;
    onboardingComplete: boolean;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface GoogleAuthRequest {
  idToken: string;
}

export interface FirebaseAuthRequest {
  idToken: string;
}
