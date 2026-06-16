-- ============================================
-- V8: Project Health Engine Setup
-- ============================================

-- 1. Add project_id to activity_events for granular activity tracking
ALTER TABLE activity_events ADD COLUMN project_id VARCHAR(36);
CREATE INDEX idx_activity_events_project ON activity_events(project_id);

-- 2. Project Health Config Table (Metric Weights)
CREATE TABLE project_health_configs (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL UNIQUE,
    velocity_weight DECIMAL(3,2) NOT NULL DEFAULT 0.15,
    blocker_weight DECIMAL(3,2) NOT NULL DEFAULT 0.15,
    defect_weight DECIMAL(3,2) NOT NULL DEFAULT 0.10,
    dependency_weight DECIMAL(3,2) NOT NULL DEFAULT 0.20,
    utilization_weight DECIMAL(3,2) NOT NULL DEFAULT 0.10,
    stability_weight DECIMAL(3,2) NOT NULL DEFAULT 0.10,
    scope_creep_weight DECIMAL(3,2) NOT NULL DEFAULT 0.10,
    release_confidence_weight DECIMAL(3,2) NOT NULL DEFAULT 0.10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_health_config_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- 3. Project Health Metrics Cache Table
CREATE TABLE project_health_metrics (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL UNIQUE,
    overall_score INTEGER NOT NULL,
    velocity_score INTEGER NOT NULL,
    blocker_score INTEGER NOT NULL,
    defect_score INTEGER NOT NULL,
    dependency_score INTEGER NOT NULL,
    utilization_score INTEGER NOT NULL,
    stability_score INTEGER NOT NULL,
    scope_creep_score INTEGER NOT NULL,
    release_confidence_score INTEGER NOT NULL,
    contributing_factors TEXT,
    last_calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_health_metric_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- 4. Health History Snapshots Table (Daily History & Deltas)
CREATE TABLE health_history_snapshots (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL,
    score INTEGER NOT NULL,
    health_delta INTEGER NOT NULL DEFAULT 0,
    snapshot_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_health_snapshot_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT uq_project_snapshot_date UNIQUE (project_id, snapshot_date)
);

CREATE INDEX idx_health_history_project ON health_history_snapshots(project_id);
CREATE INDEX idx_health_history_date ON health_history_snapshots(snapshot_date);
