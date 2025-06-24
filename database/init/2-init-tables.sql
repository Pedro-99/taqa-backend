-- Connect to correct DB using environment variables (no \c needed)
-- These commands will run *only* if this file is executed inside the right DB

-- create your tables
CREATE TABLE IF NOT EXISTS anomalies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_number VARCHAR(100),
    title VARCHAR(500),
    description TEXT,
    detection_date TIMESTAMP,
    status VARCHAR(50) DEFAULT 'new',
    priority INTEGER DEFAULT 2,
    equipment_description TEXT,
    responsible_section VARCHAR(200),
    criticality VARCHAR(20) DEFAULT 'medium',
    origin_system VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- indexes
CREATE INDEX IF NOT EXISTS idx_anomalies_equipment ON anomalies(equipment_number);
CREATE INDEX IF NOT EXISTS idx_anomalies_detection_date ON anomalies(detection_date);
CREATE INDEX IF NOT EXISTS idx_anomalies_status ON anomalies(status);
CREATE INDEX IF NOT EXISTS idx_anomalies_priority ON anomalies(priority);
CREATE INDEX IF NOT EXISTS idx_anomalies_section ON anomalies(responsible_section);

-- permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO taqathon_user;
GRANT USAGE ON SCHEMA public TO taqathon_user;
