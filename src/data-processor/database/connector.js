const { Pool } = require('pg');

// Create a connection pool
const pool = new Pool({
    host: process.env.DB_HOST || '172.17.0.1',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'taqathon_anomalies',
    user: process.env.DB_USER || 'taqathon_user',
    password: process.env.DB_PASSWORD || 'taqathon_password',
    max: 10, // Maximum number of connections
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test connection on startup
pool.on('connect', () => {
    console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
});

// Save normalized data to database
const saveToDatabase = async (normalizedData) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        const savedRecords = [];
        
        for (const record of normalizedData) {
            try {
                // Check if equipment already has a similar anomaly (optional deduplication)
                const existingQuery = `
                    SELECT id FROM anomalies 
                    WHERE equipment_number = $1 
                    AND title = $2 
                    AND DATE(detection_date) = DATE($3)
                    AND status != 'resolved'
                    LIMIT 1
                `;
                
                const existingResult = await client.query(existingQuery, [
                    record.equipment_number,
                    record.title,
                    record.detection_date
                ]);
                
                if (existingResult.rows.length > 0) {
                    console.log(`Skipping duplicate anomaly for ${record.equipment_number}: ${record.title}`);
                    continue;
                }
                
                // Insert new record
                const insertQuery = `
                    INSERT INTO anomalies (
                        id, equipment_number, title, description, detection_date,
                        status, priority, equipment_description, responsible_section,
                        criticality, origin_system, created_at, updated_at
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
                    ) RETURNING *
                `;
                
                const values = [
                    record.id,
                    record.equipment_number,
                    record.title,
                    record.description,
                    record.detection_date,
                    record.status,
                    record.priority,
                    record.equipment_description,
                    record.responsible_section,
                    record.criticality,
                    record.origin_system,
                    record.created_at,
                    record.updated_at
                ];
                
                const result = await client.query(insertQuery, values);
                savedRecords.push(result.rows[0]);
                
            } catch (recordError) {
                console.error('Error saving individual record:', recordError, record);
                // Continue with other records
            }
        }
        
        await client.query('COMMIT');
        console.log(`Successfully saved ${savedRecords.length} anomalies to database`);
        
        return savedRecords;
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Database transaction error:', error);
        throw new Error(`Database save failed: ${error.message}`);
    } finally {
        client.release();
    }
};

// Get anomalies with optional filters
const getAnomalies = async (filters = {}) => {
    const client = await pool.connect();
    
    try {
        let query = `
            SELECT 
                id, equipment_number, title, description, detection_date,
                status, priority, equipment_description, responsible_section,
                criticality, origin_system, created_at, updated_at
            FROM anomalies
        `;
        
        const conditions = [];
        const values = [];
        let paramCount = 0;
        
        // Add filters
        if (filters.status) {
            paramCount++;
            conditions.push(`status = $${paramCount}`);
            values.push(filters.status);
        }
        
        if (filters.priority) {
            paramCount++;
            conditions.push(`priority = $${paramCount}`);
            values.push(parseInt(filters.priority));
        }
        
        if (filters.equipment_number) {
            paramCount++;
            conditions.push(`equipment_number ILIKE $${paramCount}`);
            values.push(`%${filters.equipment_number}%`);
        }
        
        if (filters.section) {
            paramCount++;
            conditions.push(`responsible_section ILIKE $${paramCount}`);
            values.push(`%${filters.section}%`);
        }
        
        if (filters.start_date) {
            paramCount++;
            conditions.push(`detection_date >= $${paramCount}`);
            values.push(filters.start_date);
        }
        
        if (filters.end_date) {
            paramCount++;
            conditions.push(`detection_date <= $${paramCount}`);
            values.push(filters.end_date);
        }
        
        if (filters.criticality) {
            paramCount++;
            conditions.push(`criticality = $${paramCount}`);
            values.push(filters.criticality);
        }
        
        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }
        
        // Default ordering
        query += ` ORDER BY detection_date DESC`;
        
        // Add limit if specified
        if (filters.limit) {
            paramCount++;
            query += ` LIMIT $${paramCount}`;
            values.push(parseInt(filters.limit));
        }
        
        const result = await client.query(query, values);
        return result.rows;
        
    } catch (error) {
        console.error('Database query error:', error);
        throw new Error(`Database query failed: ${error.message}`);
    } finally {
        client.release();
    }
};

// Get statistics
const getStatistics = async () => {
    const client = await pool.connect();
    
    try {
        const statsQuery = `
            SELECT 
                COUNT(*) as total_anomalies,
                COUNT(CASE WHEN status = 'new' THEN 1 END) as new_count,
                COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_count,
                COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_count,
                COUNT(CASE WHEN criticality = 'critical' THEN 1 END) as critical_count,
                COUNT(CASE WHEN criticality = 'medium' THEN 1 END) as medium_count,
                COUNT(CASE WHEN criticality = 'low' THEN 1 END) as low_count,
                COUNT(DISTINCT equipment_number) as unique_equipment,
                COUNT(DISTINCT responsible_section) as unique_sections
            FROM anomalies
        `;
        
        const result = await client.query(statsQuery);
        return result.rows[0];
        
    } catch (error) {
        console.error('Statistics query error:', error);
        throw new Error(`Statistics query failed: ${error.message}`);
    } finally {
        client.release();
    }
};

// Test database connection
const testConnection = async () => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW()');
        client.release();
        console.log('Database connection test successful:', result.rows[0]);
        return true;
    } catch (error) {
        console.error('Database connection test failed:', error);
        return false;
    }
};

module.exports = {
    saveToDatabase,
    getAnomalies,
    getStatistics,
    testConnection,
    pool
};