// =============================================================================
// Auth Context - Global authentication state management
// =============================================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authService } from "@/services/auth-service";
import type { UserResponse, LoginRequest, RegisterRequest } from "@/types/api";

interface AuthContextType {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<{ success: boolean; errors?: string[] }>;
  register: (data: RegisterRequest) => Promise<{ success: boolean; errors?: string[] }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const refreshUser = useCallback(async () => {
    if (!authService.isAuthenticated()) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await authService.getMe();
      if (response.success && response.data) {
        setUser(response.data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    // Try to load user from storage first
    const storedUser = authService.getStoredUser();
    if (storedUser && authService.isAuthenticated()) {
      setUser(storedUser);
      setIsLoading(false);
      // Refresh in background
      refreshUser();
    } else {
      refreshUser();
    }
  }, [refreshUser]);
  
  const login = async (credentials: LoginRequest) => {
    try {
      const response = await authService.login(credentials);
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        return { success: true };
      }
      return { success: false, errors: response.errors || ["Login failed"] };
    } catch (error) {
      return { success: false, errors: ["An error occurred during login"] };
    }
  };
  
  const register = async (data: RegisterRequest) => {
    try {
      const response = await authService.register(data);
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        return { success: true };
      }
      return { success: false, errors: response.errors || ["Registration failed"] };
    } catch (error) {
      return { success: false, errors: ["An error occurred during registration"] };
    }
  };
  
  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
