// =============================================================================
// API Configuration
// =============================================================================

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    REGISTER: "/api/Auth/register",
    LOGIN: "/api/Auth/login",
    REFRESH_TOKEN: "/api/Auth/refresh-token",
    LOGOUT: "/api/Auth/logout",
    ME: "/api/Auth/me",
    PROFILE: "/api/Auth/profile",
    CHANGE_PASSWORD: "/api/Auth/change-password",
  },
  // Todo endpoints
  TODOS: {
    BASE: "/api/Todos",
    BY_ID: (id: string) => `/api/Todos/${id}`,
    TOGGLE: (id: string) => `/api/Todos/${id}/toggle`,
    OVERDUE: "/api/Todos/overdue",
    STATS: "/api/Todos/stats",
  },
} as const;

export const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: "todo_access_token",
  REFRESH_TOKEN: "todo_refresh_token",
  USER: "todo_user",
  EXPIRES_AT: "todo_expires_at",
} as const;
