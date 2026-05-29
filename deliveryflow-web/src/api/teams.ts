import { apiClient } from './apiClient';

export interface TeamResponse {
  id: string;
  name: string;
  description: string;
  teamType: string;
  capacity: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTeamRequest {
  name: string;
  description: string;
  teamType: string;
  capacity: number;
}

export const teamService = {
  getTeams: async (): Promise<TeamResponse[]> => {
    const response = await apiClient.get<TeamResponse[]>('/teams');
    return response.data;
  },

  createTeam: async (data: CreateTeamRequest): Promise<TeamResponse> => {
    const response = await apiClient.post<TeamResponse>('/teams', data);
    return response.data;
  },
};
