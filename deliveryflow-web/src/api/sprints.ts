import { apiClient } from './apiClient';

export interface SprintResponse {
  id: string;
  projectId: string;
  sprintCode: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSprintRequest {
  projectId: string;
  name: string;
  startDate: string;
  endDate: string;
}

export const sprintService = {
  getSprints: async (projectId?: string): Promise<SprintResponse[]> => {
    const url = projectId ? `/sprints?projectId=${projectId}` : '/sprints';
    const response = await apiClient.get<SprintResponse[]>(url);
    return response.data;
  },

  createSprint: async (data: CreateSprintRequest): Promise<SprintResponse> => {
    const response = await apiClient.post<SprintResponse>('/sprints', data);
    return response.data;
  },
};
