// =============================================================================
// HTTP API Client with JWT Authentication
// =============================================================================

import { API_BASE_URL, AUTH_STORAGE_KEYS } from "@/config/api";

interface RequestConfig extends RequestInit {
  skipAuth?: boolean;
}

class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: unknown
  ) {
    super(`API Error: ${status} ${statusText}`);
    this.name = "ApiError";
  }
}

async function getAccessToken(): Promise<string | null> {
  return localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
  const accessToken = localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  
  if (!refreshToken || !accessToken) {
    return null;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/Auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accessToken,
        refreshToken,
      }),
    });
    
    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }
    
    const data = await response.json();
    
    if (data.success && data.data) {
      localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, data.data.accessToken);
      localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, data.data.refreshToken);
      localStorage.setItem(AUTH_STORAGE_KEYS.EXPIRES_AT, data.data.expiresAt);
      return data.data.accessToken;
    }
    
    return null;
  } catch {
    // Clear auth data on refresh failure
    localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
    localStorage.removeItem(AUTH_STORAGE_KEYS.EXPIRES_AT);
    return null;
  }
}

export async function apiRequest<T>(
  endpoint: string,
  config: RequestConfig = {}
): Promise<T> {
  const { skipAuth = false, ...fetchConfig } = config;
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...fetchConfig.headers,
  };
  
  if (!skipAuth) {
    let token = await getAccessToken();
    
    // Check if token is expired
    const expiresAt = localStorage.getItem(AUTH_STORAGE_KEYS.EXPIRES_AT);
    if (expiresAt && new Date(expiresAt) < new Date()) {
      token = await refreshAccessToken();
    }
    
    if (token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }
  }
  
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...fetchConfig,
    headers,
  });
  
  // Handle 401 - try to refresh token
  if (response.status === 401 && !skipAuth) {
    const newToken = await refreshAccessToken();
    
    if (newToken) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${newToken}`;
      
      const retryResponse = await fetch(url, {
        ...fetchConfig,
        headers,
      });
      
      if (!retryResponse.ok) {
        const errorData = await retryResponse.json().catch(() => null);
        throw new ApiError(retryResponse.status, retryResponse.statusText, errorData);
      }
      
      return retryResponse.json();
    } else {
      // Redirect to login
      window.location.href = "/login";
      throw new ApiError(401, "Unauthorized");
    }
  }
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new ApiError(response.status, response.statusText, errorData);
  }
  
  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }
  
  return response.json();
}

export { ApiError };
