# TAQA Anomaly Management MVP Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Components](#architecture-components)
3. [Data Flow](#data-flow)
4. [User Workflows](#user-workflows)
5. [Technical Implementation](#technical-implementation)
6. [Integration Points](#integration-points)
7. [Machine Learning Component](#machine-learning-component)
8. [Deployment & Infrastructure](#deployment--infrastructure)

## System Overview

The TAQA Anomaly Management MVP is a cloud-native application designed to streamline anomaly detection, classification, and management for TAQA operators. The system leverages machine learning to automatically assess anomaly criticality and provides a comprehensive dashboard for anomaly lifecycle management.

### Key Features
- **Automated Anomaly Classification**: ML-powered criticality assessment
- **Multi-source Data Integration**: Oracle DB, Maximo, and Excel file imports
- **Real-time Dashboard**: React-based interface for anomaly management
- **REX Integration**: Root cause analysis and reporting
- **File Management**: PDF reports and image attachments
- **Advanced Filtering**: Search and filter capabilities

## Architecture Components

### Frontend Layer
**React Dashboard (AWS Amplify)**
- **Technology**: React.js hosted on AWS Amplify
- **Features**:
  - Anomaly list view with filtering and search
  - Add/Edit forms for anomaly management
  - REX (Root Experience) interface
  - Real-time updates and notifications
- **Authentication**: Integrated with AWS Cognito
- **Responsive Design**: Optimized for desktop and tablet use

### Backend Layer
**API Gateway + AWS Lambda**
- **Authentication**: JWT-based authentication with AWS Cognito
- **CRUD Operations**: Full anomaly lifecycle management
- **File Upload**: Secure file handling for attachments
- **ML Integration**: Real-time classification requests
- **Rate Limiting**: Built-in throttling and security controls

### Database Layer
**PostgreSQL RDS**
The system uses a relational database with the following core tables:

#### anomalies
- Primary anomaly records
- Classification results
- Status tracking
- Metadata and timestamps

#### rex_entries
- Root experience analysis
- Corrective actions
- Lessons learned
- Best practices

#### attachments
- File metadata
- S3 object references
- Version control

#### equipment
- Asset information
- Equipment hierarchy
- Maintenance history integration

### Storage Layer
**S3 Bucket**
- **PDF Reports**: Generated anomaly reports
- **Images**: Equipment photos and diagrams
- **Excel Imports**: Bulk data import files
- **Versioning**: Enabled for audit trail
- **Encryption**: Server-side encryption at rest

### Machine Learning Layer
**SageMaker Endpoint**
- **Model Type**: Multi-class classification
- **Inputs**: Anomaly description, equipment type, historical data
- **Outputs**:
  - Safety Score (0-100)
  - Availability Impact (Low/Medium/High)
  - Urgency Level (1-5)
- **Real-time Inference**: Sub-second response times

### Integration Layer
**Lambda Functions for Data Integration**
- **Oracle Connector**: Equipment and maintenance data sync
- **Maximo API**: Work order and asset management integration
- **Excel Parser**: Bulk anomaly import processing

## Data Flow

### Primary Data Flow
1. **User Interaction**: TAQA operators access the React dashboard
2. **API Processing**: Requests routed through API Gateway to Lambda functions
3. **Database Operations**: CRUD operations performed on PostgreSQL RDS
4. **ML Classification**: New anomalies automatically classified via SageMaker
5. **File Management**: Attachments stored in S3 with metadata in RDS

### Integration Data Flow
1. **External Systems**: Oracle DB, Maximo, and Excel files provide source data
2. **Integration Processing**: Lambda functions process and transform data
3. **Database Storage**: Processed data stored in PostgreSQL RDS
4. **Dashboard Updates**: Real-time updates pushed to React frontend

### File Upload Flow
1. **Frontend Upload**: Users upload files through React interface
2. **Direct S3 Upload**: Files uploaded directly to S3 (presigned URLs)
3. **Metadata Storage**: File metadata stored in RDS attachments table
4. **Processing**: Automated processing for supported file types

## User Workflows

### Anomaly Creation Workflow
1. **Access Dashboard**: User logs in to React dashboard
2. **Create Anomaly**: Navigate to "Add Anomaly" form
3. **Input Details**: Enter anomaly description, equipment, location
4. **Attach Files**: Upload relevant images, PDFs, or documents
5. **Submit**: System automatically classifies and saves anomaly
6. **Review**: ML classification results displayed for user review
7. **Approve/Modify**: User can accept or modify classification

### Anomaly Management Workflow
1. **View Anomalies**: Browse anomaly list with filters
2. **Filter/Search**: Use advanced filters to find specific anomalies
3. **Update Status**: Change anomaly status (Open/In Progress/Closed)
4. **Add Comments**: Document progress and updates
5. **REX Entry**: Create root experience analysis
6. **Generate Reports**: Export anomaly reports in PDF format

### Bulk Import Workflow
1. **Prepare Excel File**: Format data according to template
2. **Upload File**: Use bulk import feature in dashboard
3. **Validation**: System validates data format and completeness
4. **Processing**: Lambda function processes and imports data
5. **Review Results**: Summary of successful imports and errors
6. **Cleanup**: Manual review and correction of failed imports

## Technical Implementation

### Frontend (React)
```javascript
// Key dependencies
- React 18+
- AWS Amplify SDK
- Axios for API calls
- Material-UI or Ant Design
- React Router for navigation
- React Query for state management
```

### Backend (Lambda Functions)
```python
# Core Lambda functions
- anomaly-crud: CRUD operations
- ml-classifier: SageMaker integration
- file-processor: File upload handling
- data-integrator: External system sync
- report-generator: PDF report creation
```

### Database Schema
```sql
-- Key tables structure
anomalies (
    id, title, description, equipment_id,
    classification_result, safety_score,
    availability_impact, urgency_level,
    status, created_by, created_at, updated_at
)

rex_entries (
    id, anomaly_id, root_cause, corrective_action,
    lessons_learned, created_by, created_at
)

equipment (
    id, tag_number, description, location,
    equipment_type, criticality
)
```

## Integration Points

### Oracle Database Integration
- **Connection**: Lambda function with Oracle driver
- **Data Sync**: Equipment master data and maintenance history
- **Frequency**: Hourly scheduled sync
- **Error Handling**: Retry logic with dead letter queue

### Maximo Integration
- **API Type**: REST API integration
- **Authentication**: Service account credentials
- **Data Exchange**: Work orders, asset information
- **Real-time**: Webhook notifications for updates

### Excel File Processing
- **Supported Formats**: .xlsx, .xls, .csv
- **Validation**: Schema validation against predefined templates
- **Processing**: Pandas-based data transformation
- **Error Reporting**: Detailed validation reports

## Machine Learning Component

### Model Architecture
- **Algorithm**: Random Forest or XGBoost classifier
- **Features**: Text embeddings, equipment metadata, historical patterns
- **Training Data**: Historical anomaly data with manual classifications
- **Model Updates**: Monthly retraining with new data

### Classification Output
```json
{
  "safety_score": 85,
  "availability_impact": "High",
  "urgency_level": 4,
  "confidence": 0.92,
  "reasoning": "Equipment criticality and safety implications"
}
```

### Model Monitoring
- **Performance Metrics**: Accuracy, precision, recall, F1-score
- **Data Drift Detection**: Feature distribution monitoring
- **Model Versioning**: A/B testing for model updates
- **Feedback Loop**: User corrections fed back for model improvement

## Deployment & Infrastructure

### AWS Services Used
- **Compute**: Lambda Functions, SageMaker
- **Storage**: RDS PostgreSQL, S3
- **Frontend**: Amplify Hosting
- **API**: API Gateway
- **Authentication**: Cognito
- **Monitoring**: CloudWatch, X-Ray

### Environment Configuration
- **Development**: Single AZ deployment
- **Staging**: Multi-AZ with reduced resources
- **Production**: Multi-AZ with auto-scaling and backup

### Security Implementation
- **Authentication**: Multi-factor authentication via Cognito
- **Authorization**: Role-based access control (RBAC)
- **Data Encryption**: At rest and in transit
- **Network Security**: VPC with private subnets
- **Audit Logging**: CloudTrail and application logs

### Monitoring & Alerting
- **Application Metrics**: Custom CloudWatch metrics
- **Performance Monitoring**: Response times and error rates
- **Resource Utilization**: Lambda memory and duration
- **Business Metrics**: Anomaly creation rates and classification accuracy

### Backup & Recovery
- **Database**: Automated RDS backups with point-in-time recovery
- **Files**: S3 versioning and cross-region replication
- **Configuration**: Infrastructure as Code with CloudFormation
- **Disaster Recovery**: Multi-region deployment capability

## API Endpoints Documentation

### Base Configuration
- **Base URL**: `https://api-gateway-url.amazonaws.com/stage`
- **Authentication**: AWS Cognito JWT tokens
- **Content-Type**: `application/json`
- **CORS**: Enabled for all origins

### Endpoint Overview
| Method | Path | Purpose | Request Type |
|--------|------|---------|--------------|
| GET | `/anomalies` | Retrieve anomalies with filtering | Query Parameters |
| POST | `/process` | Process data from various sources | JSON Body |
| POST | `/upload` | Upload and process files | JSON Body (Base64) |

---

### 1. GET /anomalies
**Purpose**: Retrieve anomalies from the database with optional filtering

#### Request Format
```http
GET /anomalies?status=open&equipment_id=123&limit=50
```

#### Query Parameters
```javascript
{
  status: "open|in_progress|closed",           // Filter by status
  equipment_id: "string",                      // Filter by equipment
  created_by: "string",                        // Filter by creator
  safety_score_min: "number",                  // Minimum safety score
  safety_score_max: "number",                  // Maximum safety score
  urgency_level: "1|2|3|4|5",                 // Filter by urgency
  availability_impact: "Low|Medium|High",      // Filter by impact
  date_from: "YYYY-MM-DD",                     // Filter from date
  date_to: "YYYY-MM-DD",                       // Filter to date
  limit: "number",                             // Limit results (default: 100)
  offset: "number"                             // Pagination offset
}
```

#### Response Format
```json
{
  "success": true,
  "count": 25,
  "data": [
    {
      "id": "uuid",
      "title": "Equipment Overheating",
      "description": "Pump temperature exceeding normal range",
      "equipment_id": "PUMP-001",
      "status": "open",
      "safety_score": 85,
      "availability_impact": "High",
      "urgency_level": 4,
      "created_by": "operator@taqa.com",
      "created_at": "2024-06-24T10:30:00Z",
      "updated_at": "2024-06-24T10:30:00Z"
    }
  ]
}
```

#### Usage Examples
```javascript
// Get all open anomalies
fetch('/anomalies?status=open')

// Get high-priority anomalies
fetch('/anomalies?urgency_level=4&urgency_level=5')

// Get anomalies for specific equipment
fetch('/anomalies?equipment_id=PUMP-001')

// Paginated results
fetch('/anomalies?limit=20&offset=40')
```

---

### 2. POST /process
**Purpose**: Process and import anomaly data from various sources (Excel, Oracle, Manual)

#### Request Format
```json
{
  "source": "excel|oracle|manual",
  "data": [...],              // Optional: Direct data array
  "filePath": "string"        // Optional: S3 file path for Excel
}
```

#### Source-Specific Formats

##### Excel Source
```json
{
  "source": "excel",
  "filePath": "s3://bucket/uploads/anomalies.xlsx"
}
```
*OR*
```json
{
  "source": "excel",
  "data": [
    {
      "Title": "Equipment Issue",
      "Description": "Detailed description",
      "Equipment_ID": "PUMP-001",
      "Location": "Plant A",
      "Reporter": "john.doe@taqa.com"
    }
  ]
}
```

##### Oracle Source
```json
{
  "source": "oracle",
  "data": [
    {
      "ANOMALY_TITLE": "Database Issue",
      "ANOMALY_DESC": "Connection timeout",
      "EQUIPMENT_TAG": "DB-001",
      "LOCATION_CODE": "DC-1",
      "CREATED_BY": "system"
    }
  ]
}
```

##### Manual Source
```json
{
  "source": "manual",
  "data": {
    "title": "Manual Entry",
    "description": "User-created anomaly",
    "equipment_id": "MANUAL-001",
    "location": "Office",
    "severity": "Medium"
  }
}
```

#### Response Format
```json
{
  "success": true,
  "message": "Successfully processed 15 anomalies",
  "processed": 15,
  "source": "excel",
  "data": [
    {
      "id": "uuid",
      "title": "Equipment Issue",
      "description": "Detailed description",
      "equipment_id": "PUMP-001",
      "safety_score": 75,
      "availability_impact": "Medium",
      "urgency_level": 3,
      "created_at": "2024-06-24T10:30:00Z"
    }
  ]
}
```

#### Error Responses
```json
{
  "success": false,
  "error": "No data to process"
}
```

```json
{
  "success": false,
  "error": "Unknown data source: invalid_source"
}
```

---

### 3. POST /upload
**Purpose**: Upload and process files (Excel) encoded as Base64

#### Request Format
```json
{
  "file": "base64-encoded-file-content",
  "filename": "anomalies.xlsx",
  "type": "excel"
}
```

#### Detailed Request Example
```json
{
  "file": "UEsDBBQAAAAIAO6M...",  // Base64 encoded Excel file
  "filename": "weekly_anomalies.xlsx",
  "type": "excel"
}
```

#### Supported File Types
- **Excel Files**: `.xlsx`, `.xls`
- **CSV Files**: `.csv` (processed as Excel)

#### Excel File Structure Expected
| Column | Description | Required |
|--------|-------------|----------|
| Title | Anomaly title | Yes |
| Description | Detailed description | Yes |
| Equipment_ID | Equipment identifier | Yes |
| Location | Physical location | No |
| Reporter | Reporter email/name | No |
| Severity | Initial severity assessment | No |
| Date_Reported | Report date (YYYY-MM-DD) | No |

#### Response Format
```json
{
  "success": true,
  "message": "File processed successfully: 23 anomalies saved",
  "filename": "weekly_anomalies.xlsx",
  "processed": 23,
  "data": [
    {
      "id": "uuid",
      "title": "Processed Anomaly",
      "description": "From Excel file",
      "equipment_id": "EQ-001",
      "safety_score": 80,
      "availability_impact": "High",
      "urgency_level": 4
    }
  ]
}
```

#### Error Responses
```json
{
  "success": false,
  "error": "File and filename are required"
}
```

```json
{
  "success": false,
  "error": "Unsupported file type: pdf"
}
```

---

### Error Handling

#### Global Error Response Format
```json
{
  "success": false,
  "error": "Error message description",
  "stack": "Stack trace (development only)"
}
```

#### HTTP Status Codes
- **200**: Success
- **400**: Bad Request (missing parameters, invalid data)
- **405**: Method Not Allowed
- **500**: Internal Server Error

---

### Usage Examples

#### JavaScript/Frontend Integration
```javascript
// Fetch anomalies with filters
const getAnomalies = async (filters = {}) => {
  const queryString = new URLSearchParams(filters).toString();
  const response = await fetch(`/anomalies?${queryString}`);
  return response.json();
};

// Process Excel data
const processData = async (source, data) => {
  const response = await fetch('/process', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source, data })
  });
  return response.json();
};

// Upload file
const uploadFile = async (file, filename) => {
  const base64 = await fileToBase64(file);
  const response = await fetch('/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      file: base64,
      filename: filename,
      type: 'excel'
    })
  });
  return response.json();
};
```

#### cURL Examples
```bash
# Get anomalies
curl -X GET "https://api-url/anomalies?status=open&limit=10"

# Process manual data
curl -X POST "https://api-url/process" \
  -H "Content-Type: application/json" \
  -d '{
    "source": "manual",
    "data": {
      "title": "Test Anomaly",
      "description": "Test description",
      "equipment_id": "TEST-001"
    }
  }'

# Upload Excel file
curl -X POST "https://api-url/upload" \
  -H "Content-Type: application/json" \
  -d '{
    "file": "UEsDBBQAAAAIAO6M...",
    "filename": "anomalies.xlsx",
    "type": "excel"
  }'
```

---

### Data Processing Flow

#### 1. Data Ingestion
- Raw data received from various sources
- Format validation and error checking
- Source-specific parsing (Excel, Oracle, Manual)

#### 2. Data Normalization
- Convert different formats to unified schema
- Apply business rules and validation
- Enrich data with additional metadata

#### 3. ML Classification (Automatic)
- Safety score calculation (0-100)
- Availability impact assessment (Low/Medium/High)
- Urgency level determination (1-5)

#### 4. Database Storage
- Save normalized data to PostgreSQL
- Create audit trail and timestamps
- Link attachments and related records

#### 5. Response Generation
- Return processing summary
- Include sample processed records
- Provide error details if applicable

## Getting Started

### Prerequisites
- AWS Account with appropriate permissions
- PostgreSQL database setup
- SageMaker model deployment
- External system access credentials

### Deployment Steps
1. **Infrastructure Setup**: Deploy CloudFormation templates
2. **Database Migration**: Run database schema migrations
3. **Model Deployment**: Deploy ML model to SageMaker
4. **Frontend Deployment**: Build and deploy React app to Amplify
5. **Configuration**: Set environment variables and secrets
6. **Testing**: Run integration tests and user acceptance testing

### Configuration
- Environment variables for database connections
- AWS credentials and region configuration
- External system API endpoints and credentials
- ML model endpoint configuration

This MVP provides a solid foundation for anomaly management with room for future enhancements such as mobile apps, advanced analytics, and expanded integrations.
