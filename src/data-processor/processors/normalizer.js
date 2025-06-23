const { v4: uuidv4 } = require('uuid');

const normalizeData = async (rawData, source) => {
    console.log(`Normalizing ${rawData.length} records from ${source}`);
    
    const normalized = [];
    
    for (const record of rawData) {
        try {
            const normalizedRecord = await normalizeRecord(record, source);
            if (normalizedRecord) {
                normalized.push(normalizedRecord);
            }
        } catch (error) {
            console.error(`Error normalizing record:`, error, record);
            // Continue processing other records
        }
    }
    
    console.log(`Successfully normalized ${normalized.length} records`);
    return normalized;
};

const normalizeRecord = async (record, source) => {
    // Common base structure
    const normalized = {
        id: uuidv4(),
        origin_system: source,
        created_at: new Date(),
        updated_at: new Date()
    };
    
    // Source-specific field mapping
    switch (source) {
        case 'oracle':
            return normalizeOracleRecord(record, normalized);
        case 'excel':
            return normalizeExcelRecord(record, normalized);
        case 'manual':
            return normalizeManualRecord(record, normalized);
        default:
            throw new Error(`Unknown source: ${source}`);
    }
};

// Oracle data structure: Num_equipement, Description, Date de detection de l'anomalie, Statut, Priorité, Description equipement, Section proprietaire
const normalizeOracleRecord = (record, base) => {
    return {
        ...base,
        equipment_number: cleanString(record.Num_equipement || record.num_equipement || record['Num_equipement']),
        title: cleanString(record.Description || record.description || record['Description']),
        description: cleanString(record.Description || record.description || record['Description']),
        detection_date: parseDate(record['Date de detection de l\'anomalie'] || record['Date_de_detection_de_l_anomalie'] || record.detection_date),
        status: mapStatus(record.Statut || record.statut || record['Statut']),
        priority: parsePriority(record.Priorité || record.priority || record['Priorité']),
        equipment_description: cleanString(record['Description equipement'] || record['Description_equipement'] || record.equipment_description),
        responsible_section: cleanString(record['Section proprietaire'] || record['Section_proprietaire'] || record.responsible_section),
        criticality: mapPriorityToCriticality(record.Priorité || record.priority || record['Priorité'])
    };
};

// Excel data (flexible field names)
const normalizeExcelRecord = (record, base) => {
    return {
        ...base,
        equipment_number: cleanString(
            record['Equipment Number'] || 
            record['Num_equipement'] || 
            record['Numéro équipement'] ||
            record.equipment_number
        ),
        title: cleanString(
            record['Title'] || 
            record['Description'] || 
            record['Titre'] ||
            record.title
        ),
        description: cleanString(
            record['Description'] || 
            record['Title'] ||
            record.description
        ),
        detection_date: parseDate(
            record['Detection Date'] || 
            record['Date'] ||
            record['Date de détection'] ||
            record.detection_date
        ),
        status: mapStatus(
            record['Status'] || 
            record['Statut'] ||
            record.status
        ),
        priority: parsePriority(
            record['Priority'] || 
            record['Priorité'] ||
            record.priority
        ),
        equipment_description: cleanString(
            record['Equipment Description'] ||
            record['Description equipement'] ||
            record.equipment_description
        ),
        responsible_section: cleanString(
            record['Section'] || 
            record['Section proprietaire'] ||
            record['Section responsable'] ||
            record.responsible_section
        ),
        criticality: mapPriorityToCriticality(
            record['Priority'] || 
            record['Priorité'] ||
            record.priority
        )
    };
};

// Manual entry (from form or API)
const normalizeManualRecord = (record, base) => {
    return {
        ...base,
        equipment_number: cleanString(record.equipment_number),
        title: cleanString(record.title),
        description: cleanString(record.description || record.title),
        detection_date: parseDate(record.detection_date),
        status: mapStatus(record.status),
        priority: parsePriority(record.priority),
        equipment_description: cleanString(record.equipment_description),
        responsible_section: cleanString(record.responsible_section),
        criticality: mapPriorityToCriticality(record.priority)
    };
};

// Helper functions
const cleanString = (str) => {
    if (!str) return null;
    return String(str).trim() || null;
};

const parseDate = (dateStr) => {
    if (!dateStr) return new Date();
    
    // Handle various date formats
    let date;
    
    if (dateStr instanceof Date) {
        date = dateStr;
    } else if (typeof dateStr === 'string') {
        // Try different date formats
        const formats = [
            dateStr,
            dateStr.replace(/\//g, '-'), // Replace / with -
            dateStr.replace(/\./g, '-'), // Replace . with -
        ];
        
        for (const format of formats) {
            date = new Date(format);
            if (!isNaN(date.getTime())) {
                break;
            }
        }
    } else {
        date = new Date(dateStr);
    }
    
    return isNaN(date.getTime()) ? new Date() : date;
};

const mapStatus = (status) => {
    if (!status) return 'new';
    
    const statusStr = String(status).toLowerCase().trim();
    
    const statusMap = {
        // French
        'terminé': 'resolved',
        'termine': 'resolved',
        'résolu': 'resolved',
        'resolu': 'resolved',
        'en cours': 'in_progress',
        'encours': 'in_progress',
        'nouveau': 'new',
        'fermé': 'closed',
        'ferme': 'closed',
        'annulé': 'cancelled',
        'annule': 'cancelled',
        
        // English
        'completed': 'resolved',
        'resolved': 'resolved',
        'in progress': 'in_progress',
        'in_progress': 'in_progress',
        'pending': 'in_progress',
        'new': 'new',
        'open': 'new',
        'closed': 'closed',
        'cancelled': 'cancelled',
        'canceled': 'cancelled'
    };
    
    return statusMap[statusStr] || 'new';
};

const parsePriority = (priority) => {
    if (!priority) return 2;
    
    const p = parseInt(priority);
    if (!isNaN(p) && p >= 1 && p <= 5) {
        return p;
    }
    
    // Handle text priorities
    const priorityStr = String(priority).toLowerCase().trim();
    const priorityMap = {
        'critique': 1,
        'critical': 1,
        'urgent': 1,
        'haute': 1,
        'high': 1,
        'élevé': 1,
        'eleve': 1,
        'moyenne': 2,
        'medium': 2,
        'moyen': 2,
        'normale': 2,
        'normal': 2,
        'basse': 3,
        'low': 3,
        'faible': 3
    };
    
    return priorityMap[priorityStr] || 2;
};

const mapPriorityToCriticality = (priority) => {
    const p = parsePriority(priority);
    if (p === 1) return 'critical';
    if (p === 2) return 'medium';
    if (p >= 3) return 'low';
    return 'medium';
};

module.exports = {
    normalizeData,
    normalizeRecord,
    normalizeOracleRecord,
    normalizeExcelRecord,
    normalizeManualRecord
};