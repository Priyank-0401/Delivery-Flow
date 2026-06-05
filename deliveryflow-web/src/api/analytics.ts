import { apiClient } from './apiClient';

export interface DashboardOverview {
  totalProjects: number;
  blockedTasks: number;
  activeSprints: number;
  overallCompletionRate: number;
}

export interface ProjectMetrics {
  projectId: string;
  totalTasks: number;
  completedTasks: number;
  blockedTasks: number;
  overdueTasks: number;
  completionRate: number;
}

export interface SprintMetrics {
  sprintId: string;
  velocity: number;
  completedStoryPoints: number;
  remainingStoryPoints: number;
}

export interface TeamMetrics {
  teamId: string;
  utilization: number;
  assignedHours: number;
  availableHours: number;
}

export interface ActivityEvent {
  id: string;
  eventType: string;
  entityType: string;
  entityId: string;
  message: string;
  createdAt: string;
}

export const analyticsService = {
  getDashboardOverview: async (): Promise<DashboardOverview> => {
    const response = await apiClient.get<DashboardOverview>('/analytics/dashboard');
    return response.data;
  },

  getProjectMetrics: async (projectId: string): Promise<ProjectMetrics> => {
    const response = await apiClient.get<ProjectMetrics>(`/analytics/projects/${projectId}`);
    return response.data;
  },

  getSprintMetrics: async (sprintId: string): Promise<SprintMetrics> => {
    const response = await apiClient.get<SprintMetrics>(`/analytics/sprints/${sprintId}`);
    return response.data;
  },

  getTeamMetrics: async (teamId: string): Promise<TeamMetrics> => {
    const response = await apiClient.get<TeamMetrics>(`/analytics/teams/${teamId}`);
    return response.data;
  },

  getRecentActivity: async (): Promise<ActivityEvent[]> => {
    const response = await apiClient.get<ActivityEvent[]>('/analytics/activity');
    return response.data;
  },
};
