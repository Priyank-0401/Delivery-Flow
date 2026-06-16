import { apiClient } from '@/api/apiClient';
import type { ProjectGraphResponse, CriticalPathResponse } from '../types';

export const graphService = {
  getProjectGraph: async (projectId: string): Promise<ProjectGraphResponse> => {
    const response = await apiClient.get<ProjectGraphResponse>(`/projects/${projectId}/graph`);
    return response.data;
  },

  getCriticalPath: async (projectId: string): Promise<CriticalPathResponse> => {
    const response = await apiClient.get<CriticalPathResponse>(`/projects/${projectId}/critical-path`);
    return response.data;
  },
};
