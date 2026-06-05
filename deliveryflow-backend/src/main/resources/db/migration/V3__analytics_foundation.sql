-- ============================================
-- V3: Analytics Foundation & Business Identifiers
-- ============================================

-- 1. Projects: Add project_code and task_sequence
ALTER TABLE projects ADD COLUMN project_code VARCHAR(10);
ALTER TABLE projects ADD COLUMN task_sequence INTEGER DEFAULT 0;

-- 2. Sprints: Add sprint_code
ALTER TABLE sprints ADD COLUMN sprint_code VARCHAR(20);

-- 3. Tasks: Add task_key and reporter_id
ALTER TABLE tasks ADD COLUMN task_key VARCHAR(20);
ALTER TABLE tasks ADD COLUMN reporter_id VARCHAR(36);
ALTER TABLE tasks ADD CONSTRAINT fk_task_reporter FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE SET NULL;

-- 4. Activity Events
CREATE TABLE activity_events (
    id VARCHAR(36) PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 5. Project Metrics (Current State Cache)
CREATE TABLE project_metrics (
    project_id VARCHAR(36) PRIMARY KEY,
    completion_rate DECIMAL(5,2) DEFAULT 0.00,
    blocked_tasks INTEGER DEFAULT 0,
    total_tasks INTEGER DEFAULT 0,
    completed_tasks INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- 6. Milestones
CREATE TABLE milestones (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    target_date DATE,
    status VARCHAR(50) DEFAULT 'PLANNED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);
