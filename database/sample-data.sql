\c taqathon_anomalies;

-- Insert sample data for testing
INSERT INTO anomalies (
    equipment_number, 
    title, 
    description, 
    detection_date, 
    status, 
    priority, 
    equipment_description, 
    responsible_section,
    origin_system
) VALUES 
('EQ001', 'Vibration excessive', 'Vibrations anormales détectées sur le moteur principal', '2024-01-15 10:30:00', 'new', 1, 'Moteur électrique 500KW', 'Maintenance Électrique', 'test'),
('EQ002', 'Température élevée', 'Température du roulement supérieure à la normale', '2024-01-16 14:20:00', 'in_progress', 2, 'Compresseur d''air', 'Maintenance Mécanique', 'test'),
('EQ003', 'Fuite hydraulique', 'Fuite détectée sur le circuit hydraulique principal', '2024-01-17 09:15:00', 'new', 1, 'Système hydraulique presse', 'Hydraulique', 'test');

\echo 'Sample data inserted successfully!';
\echo 'Total records:';
SELECT COUNT(*) FROM anomalies;
