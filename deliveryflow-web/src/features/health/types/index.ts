export interface ProjectHealthResponse {
  projectId: string;
  overallScore: number;
  status: string;
  statusColor: string;
  velocityScore: number;
  blockerScore: number;
  defectScore: number;
  dependencyScore: number;
  utilizationScore: number;
  stabilityScore: number;
  scopeCreepScore: number;
  releaseConfidenceScore: number;
  contributingFactors: string[];
  lastCalculatedAt: string;
}

export interface HealthConfigResponse {
  id: string;
  projectId: string;
  velocityWeight: number;
  blockerWeight: number;
  defectWeight: number;
  dependencyWeight: number;
  utilizationWeight: number;
  stabilityWeight: number;
  scopeCreepWeight: number;
  releaseConfidenceWeight: number;
}

export interface UpdateHealthConfigReq {
  velocityWeight: number;
  blockerWeight: number;
  defectWeight: number;
  dependencyWeight: number;
  utilizationWeight: number;
  stabilityWeight: number;
  scopeCreepWeight: number;
  releaseConfidenceWeight: number;
}

export interface HealthHistoryResponse {
  projectId: string;
  score: number;
  healthDelta: number;
  snapshotDate: string;
}
