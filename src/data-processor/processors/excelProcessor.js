const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const processExcelFile = async (filePath) => {
    try {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }
        
        console.log(`Processing Excel file: ${filePath}`);
        
        // Read Excel file
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON with options
        const rawData = xlsx.utils.sheet_to_json(worksheet, {
            header: 1, // Use first row as header
            defval: null, // Default value for empty cells
            raw: false // Convert everything to strings first
        });
        
        if (rawData.length === 0) {
            throw new Error('Excel file is empty');
        }
        
        // Get headers from first row
        const headers = rawData[0];
        console.log('Excel headers:', headers);
        
        // Convert to objects using headers
        const jsonData = [];
        for (let i = 1; i < rawData.length; i++) {
            const row = rawData[i];
            const rowObject = {};
            
            // Skip empty rows
            if (row.every(cell => !cell || cell.toString().trim() === '')) {
                continue;
            }
            
            // Map row data to headers
            headers.forEach((header, index) => {
                if (header && header.toString().trim()) {
                    rowObject[header.toString().trim()] = row[index] || null;
                }
            });
            
            jsonData.push(rowObject);
        }
        
        console.log(`Processed ${jsonData.length} rows from Excel`);
        return jsonData;
        
    } catch (error) {
        console.error('Error processing Excel file:', error);
        throw new Error(`Excel processing failed: ${error.message}`);
    }
};

// Handle Excel file from base64 data
const processExcelFromBase64 = async (base64Data, filename) => {
    try {
        console.log(`Processing Excel from base64: ${filename}`);
        
        // Convert base64 to buffer
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Create temp directory if it doesn't exist
        const tempDir = '/tmp';
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        
        // Save temporarily
        const tempPath = path.join(tempDir, filename);
        fs.writeFileSync(tempPath, buffer);
        
        // Process file
        const result = await processExcelFile(tempPath);
        
        // Cleanup
        if (fs.existsSync(tempPath)) {
            fs.unlinkSync(tempPath);
        }
        
        return result;
        
    } catch (error) {
        console.error('Error processing Excel from base64:', error);
        throw new Error(`Base64 Excel processing failed: ${error.message}`);
    }
};

// Process Excel data from buffer directly
const processExcelFromBuffer = async (buffer, filename = 'upload.xlsx') => {
    try {
        console.log(`Processing Excel from buffer: ${filename}`);
        
        // Read workbook from buffer
        const workbook = xlsx.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const rawData = xlsx.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: null,
            raw: false
        });
        
        if (rawData.length === 0) {
            throw new Error('Excel file is empty');
        }
        
        // Process headers and data
        const headers = rawData[0];
        const jsonData = [];
        
        for (let i = 1; i < rawData.length; i++) {
            const row = rawData[i];
            const rowObject = {};
            
            // Skip empty rows
            if (row.every(cell => !cell || cell.toString().trim() === '')) {
                continue;
            }
            
            headers.forEach((header, index) => {
                if (header && header.toString().trim()) {
                    rowObject[header.toString().trim()] = row[index] || null;
                }
            });
            
            jsonData.push(rowObject);
        }
        
        console.log(`Processed ${jsonData.length} rows from Excel buffer`);
        return jsonData;
        
    } catch (error) {
        console.error('Error processing Excel from buffer:', error);
        throw new Error(`Buffer Excel processing failed: ${error.message}`);
    }
};

// Validate Excel data structure
const validateExcelData = (data) => {
    if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Excel data is empty or invalid');
    }
    
    // Check if we have essential fields
    const firstRow = data[0];
    const requiredFields = ['equipment_number', 'description', 'title'];
    const alternativeFields = [
        ['Num_equipement', 'Equipment Number', 'Numéro équipement'],
        ['Description', 'Title', 'Titre'],
        ['Description', 'Title', 'Titre']
    ];
    
    const availableFields = Object.keys(firstRow);
    console.log('Available fields in Excel:', availableFields);
    
    // Check if we have at least some recognizable fields
    const hasRequiredData = alternativeFields.some(alternatives => 
        alternatives.some(field => availableFields.includes(field))
    );
    
    if (!hasRequiredData) {
        console.warn('Excel file may not contain expected anomaly data fields');
        console.warn('Expected fields like: Num_equipement, Description, Equipment Number, etc.');
    }
    
    return true;
};

module.exports = {
    processExcelFile,
    processExcelFromBase64,
    processExcelFromBuffer,
    validateExcelData
};