import { apiClient } from './apiClient';

// Matches TaskResponse.java exactly
export interface TaskResponse {
  id: string;
  projectId: string;
  sprintId: string;
  assigneeId: string | null;
  reporterId: string | null;
  taskKey: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  type: string;
  storyPoints: number;
  estimatedHours: number | null;
  actualHours: number | null;
  externalId: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

// Matches CreateTaskRequest.java exactly
export interface CreateTaskRequest {
  projectId: string;
  sprintId: string;
  assigneeId?: string;
  title: string;
  description: string;
  priority: string;
  type?: string;
  storyPoints: number;
  estimatedHours?: string;
  dueDate?: string;
}

export const taskService = {
  getTasks: async (): Promise<TaskResponse[]> => {
    const response = await apiClient.get<TaskResponse[]>('/tasks');
    return response.data;
  },

  createTask: async (data: CreateTaskRequest): Promise<TaskResponse> => {
    const response = await apiClient.post<TaskResponse>('/tasks', data);
    return response.data;
  },

  addDependency: async (sourceId: string, targetId: string, type: string = 'BLOCKS'): Promise<any> => {
    const response = await apiClient.post(`/tasks/${sourceId}/dependencies`, { targetTaskId: targetId, type });
    return response.data;
  },

  removeDependency: async (sourceId: string, targetId: string): Promise<void> => {
    await apiClient.delete(`/tasks/${sourceId}/dependencies/${targetId}`);
  },

  updateTaskStatus: async (taskId: string, status: string): Promise<TaskResponse> => {
    const response = await apiClient.patch<TaskResponse>(`/tasks/${taskId}/status`, { status });
    return response.data;
  },
};
