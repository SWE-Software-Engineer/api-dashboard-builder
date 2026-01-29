// =============================================================================
// Todo Service - Handles todo API calls
// =============================================================================

import { apiRequest } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api";
import type {
  TodoItemResponse,
  CreateTodoRequest,
  UpdateTodoRequest,
  TodoStatsResponse,
  TodoQueryParams,
  ApiResponse,
  ApiResponseWithData,
  PaginatedResponse,
} from "@/types/api";

function buildQueryString(params: TodoQueryParams): string {
  const searchParams = new URLSearchParams();
  
  if (params.isCompleted !== undefined) {
    searchParams.append("isCompleted", String(params.isCompleted));
  }
  if (params.priority !== undefined) {
    searchParams.append("priority", String(params.priority));
  }
  if (params.dueDateFrom) {
    searchParams.append("dueDateFrom", params.dueDateFrom);
  }
  if (params.dueDateTo) {
    searchParams.append("dueDateTo", params.dueDateTo);
  }
  if (params.searchTerm) {
    searchParams.append("searchTerm", params.searchTerm);
  }
  if (params.page !== undefined) {
    searchParams.append("page", String(params.page));
  }
  if (params.pageSize !== undefined) {
    searchParams.append("pageSize", String(params.pageSize));
  }
  if (params.sortBy) {
    searchParams.append("sortBy", params.sortBy);
  }
  if (params.sortDescending !== undefined) {
    searchParams.append("sortDescending", String(params.sortDescending));
  }
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

export const todoService = {
  async getTodos(
    params: TodoQueryParams = {}
  ): Promise<ApiResponseWithData<PaginatedResponse<TodoItemResponse>>> {
    const queryString = buildQueryString(params);
    return apiRequest<ApiResponseWithData<PaginatedResponse<TodoItemResponse>>>(
      `${API_ENDPOINTS.TODOS.BASE}${queryString}`
    );
  },
  
  async getTodoById(id: string): Promise<ApiResponseWithData<TodoItemResponse>> {
    return apiRequest<ApiResponseWithData<TodoItemResponse>>(
      API_ENDPOINTS.TODOS.BY_ID(id)
    );
  },
  
  async createTodo(data: CreateTodoRequest): Promise<ApiResponseWithData<TodoItemResponse>> {
    return apiRequest<ApiResponseWithData<TodoItemResponse>>(API_ENDPOINTS.TODOS.BASE, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  
  async updateTodo(
    id: string,
    data: UpdateTodoRequest
  ): Promise<ApiResponseWithData<TodoItemResponse>> {
    return apiRequest<ApiResponseWithData<TodoItemResponse>>(
      API_ENDPOINTS.TODOS.BY_ID(id),
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
  },
  
  async deleteTodo(id: string): Promise<ApiResponse> {
    return apiRequest<ApiResponse>(API_ENDPOINTS.TODOS.BY_ID(id), {
      method: "DELETE",
    });
  },
  
  async toggleTodo(id: string): Promise<ApiResponseWithData<TodoItemResponse>> {
    return apiRequest<ApiResponseWithData<TodoItemResponse>>(
      API_ENDPOINTS.TODOS.TOGGLE(id),
      {
        method: "PATCH",
      }
    );
  },
  
  async getOverdueTodos(): Promise<ApiResponseWithData<TodoItemResponse[]>> {
    return apiRequest<ApiResponseWithData<TodoItemResponse[]>>(
      API_ENDPOINTS.TODOS.OVERDUE
    );
  },
  
  async getStats(): Promise<ApiResponseWithData<TodoStatsResponse>> {
    return apiRequest<ApiResponseWithData<TodoStatsResponse>>(
      API_ENDPOINTS.TODOS.STATS
    );
  },
};
