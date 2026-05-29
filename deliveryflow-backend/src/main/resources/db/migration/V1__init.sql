CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE projects (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    manager_id VARCHAR(36),
    health INTEGER NOT NULL DEFAULT 100,
    risk VARCHAR(50) NOT NULL DEFAULT 'LOW',
    status VARCHAR(50) NOT NULL DEFAULT 'On Track',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_project_manager FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Seed Default User for Phase 1 Testing
INSERT INTO users (id, name, email, role) VALUES ('USR-1', 'Priyank Pahwa', 'demo@deliveryflow.io', 'Delivery Manager');
