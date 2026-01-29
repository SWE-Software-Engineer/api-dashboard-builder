// =============================================================================
// Auth Service - Handles authentication API calls
// =============================================================================

import { apiRequest } from "@/lib/api-client";
import { API_ENDPOINTS, AUTH_STORAGE_KEYS } from "@/config/api";
import type {
  LoginRequest,
  RegisterRequest,
  ChangePasswordRequest,
  UpdateProfileRequest,
  TokenResponse,
  UserResponse,
  ApiResponse,
  ApiResponseWithData,
} from "@/types/api";

export const authService = {
  async login(credentials: LoginRequest): Promise<ApiResponseWithData<TokenResponse>> {
    const response = await apiRequest<ApiResponseWithData<TokenResponse>>(
      API_ENDPOINTS.AUTH.LOGIN,
      {
        method: "POST",
        body: JSON.stringify(credentials),
        skipAuth: true,
      }
    );
    
    if (response.success && response.data) {
      localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, response.data.accessToken || "");
      localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, response.data.refreshToken || "");
      localStorage.setItem(AUTH_STORAGE_KEYS.EXPIRES_AT, response.data.expiresAt);
      if (response.data.user) {
        localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(response.data.user));
      }
    }
    
    return response;
  },
  
  async register(data: RegisterRequest): Promise<ApiResponseWithData<TokenResponse>> {
    const response = await apiRequest<ApiResponseWithData<TokenResponse>>(
      API_ENDPOINTS.AUTH.REGISTER,
      {
        method: "POST",
        body: JSON.stringify(data),
        skipAuth: true,
      }
    );
    
    if (response.success && response.data) {
      localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, response.data.accessToken || "");
      localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, response.data.refreshToken || "");
      localStorage.setItem(AUTH_STORAGE_KEYS.EXPIRES_AT, response.data.expiresAt);
      if (response.data.user) {
        localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(response.data.user));
      }
    }
    
    return response;
  },
  
  async logout(): Promise<ApiResponse> {
    try {
      const response = await apiRequest<ApiResponse>(API_ENDPOINTS.AUTH.LOGOUT, {
        method: "POST",
      });
      return response;
    } finally {
      // Always clear local storage
      localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
      localStorage.removeItem(AUTH_STORAGE_KEYS.EXPIRES_AT);
    }
  },
  
  async getMe(): Promise<ApiResponseWithData<UserResponse>> {
    return apiRequest<ApiResponseWithData<UserResponse>>(API_ENDPOINTS.AUTH.ME);
  },
  
  async updateProfile(data: UpdateProfileRequest): Promise<ApiResponseWithData<UserResponse>> {
    const response = await apiRequest<ApiResponseWithData<UserResponse>>(
      API_ENDPOINTS.AUTH.PROFILE,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
    
    if (response.success && response.data) {
      localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(response.data));
    }
    
    return response;
  },
  
  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse> {
    return apiRequest<ApiResponse>(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  
  getStoredUser(): UserResponse | null {
    const userJson = localStorage.getItem(AUTH_STORAGE_KEYS.USER);
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch {
        return null;
      }
    }
    return null;
  },
  
  isAuthenticated(): boolean {
    const token = localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
    const expiresAt = localStorage.getItem(AUTH_STORAGE_KEYS.EXPIRES_AT);
    
    if (!token) return false;
    if (expiresAt && new Date(expiresAt) < new Date()) return false;
    
    return true;
  },
};
