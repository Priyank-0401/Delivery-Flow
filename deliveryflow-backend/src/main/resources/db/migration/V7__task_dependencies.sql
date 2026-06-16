CREATE TABLE task_dependencies (
    id VARCHAR(36) PRIMARY KEY,
    source_task_id VARCHAR(36) NOT NULL,
    target_task_id VARCHAR(36) NOT NULL,
    dependency_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_dep_source FOREIGN KEY (source_task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    CONSTRAINT fk_dep_target FOREIGN KEY (target_task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    CONSTRAINT uq_dep_source_target UNIQUE (source_task_id, target_task_id)
);

CREATE INDEX idx_dependencies_source ON task_dependencies(source_task_id);
CREATE INDEX idx_dependencies_target ON task_dependencies(target_task_id);
