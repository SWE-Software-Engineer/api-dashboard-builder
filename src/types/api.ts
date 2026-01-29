// =============================================================================
// API Types - Generated from OpenAPI/Swagger Schema
// =============================================================================

// Priority enum (0=None, 1=Low, 2=Medium, 3=High)
export enum Priority {
  None = 0,
  Low = 1,
  Medium = 2,
  High = 3,
}

export const PriorityLabels: Record<Priority, string> = {
  [Priority.None]: "None",
  [Priority.Low]: "Low",
  [Priority.Medium]: "Medium",
  [Priority.High]: "High",
};

export const PriorityColors: Record<string, string> = {
  None: "priority-badge-low",
  Low: "priority-badge-low",
  Medium: "priority-badge-medium",
  High: "priority-badge-high",
  Urgent: "priority-badge-urgent",
};

// =============================================================================
// Base API Response Types
// =============================================================================

export interface ApiResponse {
  success: boolean;
  message?: string | null;
  errors?: string[] | null;
}

export interface ApiResponseWithData<T> extends ApiResponse {
  data?: T;
}

export interface PaginatedResponse<T> {
  items: T[] | null;
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ProblemDetails {
  type?: string | null;
  title?: string | null;
  status?: number | null;
  detail?: string | null;
  instance?: string | null;
}

// =============================================================================
// Auth Types
// =============================================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

export interface RefreshTokenRequest {
  accessToken: string;
  refreshToken: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
}

export interface UserResponse {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface TokenResponse {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: string;
  user?: UserResponse;
}

// =============================================================================
// Todo Types
// =============================================================================

export interface TodoItemResponse {
  id: string;
  title: string | null;
  description: string | null;
  isCompleted: boolean;
  dueDate: string | null;
  priority: string | null;
  createdAt: string;
  updatedAt: string | null;
  completedAt: string | null;
}

export interface CreateTodoRequest {
  title: string;
  description?: string | null;
  dueDate?: string | null;
  priority: Priority;
}

export interface UpdateTodoRequest {
  title: string;
  description?: string | null;
  isCompleted: boolean;
  dueDate?: string | null;
  priority: Priority;
}

export interface TodoStatsResponse {
  totalCount: number;
  completedCount: number;
  pendingCount: number;
  overdueCount: number;
  countByPriority: Record<string, number> | null;
}

// =============================================================================
// Query/Filter Types
// =============================================================================

export interface TodoQueryParams {
  isCompleted?: boolean;
  priority?: Priority;
  dueDateFrom?: string;
  dueDateTo?: string;
  searchTerm?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDescending?: boolean;
}
