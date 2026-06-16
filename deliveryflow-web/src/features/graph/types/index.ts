export interface GraphNodeDto {
  id: string;
  taskKey: string;
  label: string;
  status: string;
  storyPoints: number;
  estimatedHours: number;
}

export interface GraphEdgeDto {
  id: string;
  source: string;
  target: string;
  type: string;
}

export interface ProjectGraphResponse {
  nodes: GraphNodeDto[];
  edges: GraphEdgeDto[];
}

export interface TaskCpmDetails {
  taskId: string;
  taskKey: string;
  title: string;
  earliestStart: number;
  earliestFinish: number;
  latestStart: number;
  latestFinish: number;
  slack: number;
  isCritical: boolean;
}

export interface CriticalPathResponse {
  criticalPathTaskIds: string[];
  projectDuration: number;
  tasks: TaskCpmDetails[];
}
