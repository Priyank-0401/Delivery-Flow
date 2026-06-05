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
};
