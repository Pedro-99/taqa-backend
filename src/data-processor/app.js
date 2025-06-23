const { processExcelFile, processExcelFromBase64 } = require('./processors/excelProcessor');
const { normalizeData } = require('./processors/normalizer');
const { saveToDatabase, getAnomalies } = require('./database/connector');

exports.lambdaHandler = async (event, context) => {
    console.log('Event:', JSON.stringify(event, null, 2));
    
    try {
        const { httpMethod, path } = event;
        
        // Handle different endpoints
        if (httpMethod === 'GET' && path === '/anomalies') {
            return await handleGetAnomalies(event);
        }
        
        if (httpMethod === 'POST') {
            if (path === '/process') {
                return await handleDataProcessing(event);
            }
            if (path === '/upload') {
                return await handleFileUpload(event);
            }
        }
        
        return createResponse(405, { error: 'Method not allowed' });
        
    } catch (error) {
        console.error('Lambda execution error:', error);
        
        return createResponse(500, {
            success: false,
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Handle data processing from various sources
const handleDataProcessing = async (event) => {
    const body = JSON.parse(event.body || '{}');
    const { source, data, filePath } = body;
    
    console.log(`Processing data from source: ${source}`);
    
    let rawData = [];
    
    // Process based on data source
    switch (source) {
        case 'excel':
            if (filePath) {
                rawData = await processExcelFile(filePath);
            } else if (data) {
                rawData = data; // Direct data array
            } else {
                throw new Error('Excel processing requires either filePath or data array');
            }
            break;
            
        case 'oracle':
            // For now, we'll accept raw Oracle data
            // Later we can add actual Oracle connection
            rawData = data;
            break;
            
        case 'manual':
            rawData = Array.isArray(data) ? data : [data];
            break;
            
        default:
            throw new Error(`Unknown data source: ${source}`);
    }
    
    if (!rawData || rawData.length === 0) {
        return createResponse(400, {
            success: false,
            error: 'No data to process'
        });
    }
    
    // Normalize data to our schema
    const normalizedData = await normalizeData(rawData, source);
    
    // Save to database
    const savedRecords = await saveToDatabase(normalizedData);
    
    return createResponse(200, {
        success: true,
        message: `Successfully processed ${savedRecords.length} anomalies`,
        processed: savedRecords.length,
        source: source,
        data: savedRecords.slice(0, 5) // Return first 5 for preview
    });
};

// Handle file upload (base64 encoded)
const handleFileUpload = async (event) => {
    const body = JSON.parse(event.body || '{}');
    const { file, filename, type } = body;
    
    if (!file || !filename) {
        return createResponse(400, {
            success: false,
            error: 'File and filename are required'
        });
    }
    
    let rawData = [];
    
    if (type === 'excel' || filename.endsWith('.xlsx') || filename.endsWith('.xls')) {
        rawData = await processExcelFromBase64(file, filename);
    } else {
        throw new Error(`Unsupported file type: ${type || 'unknown'}`);
    }
    
    // Normalize and save
    const normalizedData = await normalizeData(rawData, 'excel');
    const savedRecords = await saveToDatabase(normalizedData);
    
    return createResponse(200, {
        success: true,
        message: `File processed successfully: ${savedRecords.length} anomalies saved`,
        filename: filename,
        processed: savedRecords.length,
        data: savedRecords.slice(0, 5)
    });
};

// Handle getting anomalies
const handleGetAnomalies = async (event) => {
    const { queryStringParameters } = event;
    const filters = queryStringParameters || {};
    
    const anomalies = await getAnomalies(filters);
    
    return createResponse(200, {
        success: true,
        count: anomalies.length,
        data: anomalies
    });
};

// Helper function to create API response
const createResponse = (statusCode, body) => {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
        },
        body: JSON.stringify(body, null, 2)
    };
};