import { apiClient } from './apiClient';

// Matches ProjectResponse.java exactly
export interface ProjectResponse {
  id: string;
  name: string;
  managerId: string;
  health: number;
  risk: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Matches CreateProjectRequest.java exactly
export interface CreateProjectRequest {
  name: string;
  managerId: string;
}

export const projectService = {
  getProjects: async (): Promise<ProjectResponse[]> => {
    const response = await apiClient.get<ProjectResponse[]>('/projects');
    return response.data;
  },

  createProject: async (data: CreateProjectRequest): Promise<ProjectResponse> => {
    const response = await apiClient.post<ProjectResponse>('/projects', data);
    return response.data;
  },
};
