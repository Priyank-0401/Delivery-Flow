import { apiClient } from '@/api/apiClient';
import type {
  ProjectHealthResponse,
  HealthConfigResponse,
  UpdateHealthConfigReq,
  HealthHistoryResponse,
} from '../types';

export const healthService = {
  getProjectHealth: async (projectId: string): Promise<ProjectHealthResponse> => {
    const response = await apiClient.get<ProjectHealthResponse>(`/projects/${projectId}/health`);
    return response.data;
  },

  recalculateHealth: async (projectId: string): Promise<ProjectHealthResponse> => {
    const response = await apiClient.post<ProjectHealthResponse>(`/projects/${projectId}/health/recalculate`);
    return response.data;
  },

  getHealthHistory: async (projectId: string): Promise<HealthHistoryResponse[]> => {
    const response = await apiClient.get<HealthHistoryResponse[]>(`/projects/${projectId}/health/history`);
    return response.data;
  },

  getHealthConfig: async (projectId: string): Promise<HealthConfigResponse> => {
    const response = await apiClient.get<HealthConfigResponse>(`/projects/${projectId}/health/config`);
    return response.data;
  },

  updateHealthConfig: async (projectId: string, data: UpdateHealthConfigReq): Promise<HealthConfigResponse> => {
    const response = await apiClient.put<HealthConfigResponse>(`/projects/${projectId}/health/config`, data);
    return response.data;
  },
};
