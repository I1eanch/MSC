import { apiClient } from './client';

export interface SignUpRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface OAuthLoginRequest {
  provider: string;
  accessToken: string;
  idToken?: string;
  userData?: any;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

export interface MessageResponse {
  message: string;
  success: boolean;
}

export const identityApi = {
  signUp: async (data: SignUpRequest): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/signup', data);
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/login', data);
  },

  oauthLogin: async (data: OAuthLoginRequest): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/oauth/login', data);
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<MessageResponse> => {
    return apiClient.post<MessageResponse>('/auth/forgot-password', data);
  },

  logout: async (): Promise<MessageResponse> => {
    return apiClient.post<MessageResponse>('/auth/logout');
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/refresh', { refreshToken });
  },
};
