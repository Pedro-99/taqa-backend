-- Connect to the database
\c taqathon_anomalies;

-- Create anomalies table
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_anomalies_equipment ON anomalies(equipment_number);
CREATE INDEX IF NOT EXISTS idx_anomalies_detection_date ON anomalies(detection_date);
CREATE INDEX IF NOT EXISTS idx_anomalies_status ON anomalies(status);
CREATE INDEX IF NOT EXISTS idx_anomalies_priority ON anomalies(priority);
CREATE INDEX IF NOT EXISTS idx_anomalies_section ON anomalies(responsible_section);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_anomalies_updated_at ON anomalies;
CREATE TRIGGER update_anomalies_updated_at 
    BEFORE UPDATE ON anomalies 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

\echo 'Database schema created successfully!'
