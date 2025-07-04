# IT Help Desk Ticketing System - API Documentation

## Overview

This document provides comprehensive information about the IT Help Desk Ticketing System API. The API is built with Express.js, TypeScript, and uses Prisma ORM with PostgreSQL for data management.

## Swagger Documentation

### Accessing Swagger UI

Once the server is running, you can access the interactive Swagger documentation at:

**Development:** [http://localhost:5000/api-docs/](http://localhost:5000/api-docs/)

The Swagger UI provides:

- Interactive API testing interface
- Complete endpoint documentation
- Request/response schemas
- Authentication testing capabilities
- Real-time API exploration

### Features

- **Interactive Testing**: Test API endpoints directly from the browser
- **Authentication Support**: Built-in JWT bearer token authentication
- **Schema Validation**: Complete request/response schema documentation
- **Role-Based Access**: Documentation includes role-based permission requirements
- **File Upload Support**: Documented file upload capabilities for ticket attachments

## Quick Start Guide

### 1. Start the Development Server

```bash
npm run dev
```

### 2. Access Swagger Documentation

Open your browser and navigate to: `http://localhost:5000/api-docs/`

### 3. Test the API

1. Use the `/api/auth/login` endpoint to authenticate
2. Copy the JWT token from the response
3. Click "Authorize" in Swagger UI and enter: `Bearer <your-token>`
4. Test other endpoints with authentication

## API Endpoints Summary

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Create new user (authenticated)
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/logout` - User logout

### Tickets

- `POST /api/tickets` - Create new ticket
- `GET /api/tickets` - Get all tickets (paginated)
- `GET /api/tickets/{id}` - Get specific ticket
- `PUT /api/tickets/{id}` - Update ticket
- `PATCH /api/tickets/{id}/close` - Close ticket (IT only)
- `PATCH /api/tickets/{id}/reopen` - Reopen ticket (IT only)

### Health

- `GET /health` - API health check

## User Roles & Permissions

1. **system_owner** - Highest level access
2. **super_admin** - Administrative access with account limits
3. **admin** - Administrative access to tickets and users
4. **it_person** - Can manage and close tickets
5. **user** - Can create and view their own tickets

## File Upload Support

- **Max file size**: 25MB per file
- **Supported formats**: JPEG, PNG, PDF, TXT
- **Multiple files**: Supported per ticket
- **Storage**: `/uploads/tickets/` directory

## Authentication

The API uses JWT authentication. Include the token in requests:

```
Authorization: Bearer <your-jwt-token>
```

## Error Handling

Standard error response format:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

## Environment Setup

Required environment variables:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/helpdesk"
JWT_SECRET="your-secret-key"
PORT=5000
```

For complete documentation, examples, and interactive testing, visit the Swagger UI at http://localhost:5000/api-docs/

## API Structure

### Base URL

- **Development**: `http://localhost:5000`
- **Production**: `https://api.ithelpdesk.com`

### Authentication

The API uses JWT (JSON Web Token) authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### User Roles

The system supports five user roles with different permission levels:

1. **system_owner** - Highest level access
2. **super_admin** - Administrative access with account limits
3. **admin** - Administrative access to tickets and users
4. **it_person** - Can manage and close tickets
5. **user** - Can create and view their own tickets

## API Endpoints

### Authentication Endpoints

#### POST `/api/auth/login`

- **Purpose**: User authentication
- **Access**: Public
- **Request Body**: Username and password
- **Response**: JWT token and user information

#### POST `/api/auth/register`

- **Purpose**: Create new user account
- **Access**: Authenticated users with appropriate permissions
- **Request Body**: User details including role assignment
- **Response**: Created user information

#### POST `/api/auth/refresh`

- **Purpose**: Refresh JWT token
- **Access**: Authenticated users
- **Response**: New JWT token

#### GET `/api/auth/profile`

- **Purpose**: Get authenticated user's profile
- **Access**: Authenticated users
- **Response**: User profile information

#### POST `/api/auth/logout`

- **Purpose**: Logout user (client-side token removal)
- **Access**: Authenticated users
- **Response**: Success confirmation

### Ticket Management Endpoints

#### POST `/api/tickets`

- **Purpose**: Create new support ticket
- **Access**: Users and IT personnel
- **Features**:
  - File attachments support (max 25MB per file)
  - Supported formats: JPEG, PNG, PDF, TXT
  - Multiple attachments per ticket
- **Request Body**: Ticket description and optional attachments
- **Response**: Created ticket with ID and details

#### GET `/api/tickets`

- **Purpose**: Retrieve tickets with pagination
- **Access**: All authenticated users
- **Features**:
  - Users see only their own tickets
  - IT personnel see all tickets
  - Pagination support
  - Status filtering (pending/solved)
  - Date range filtering
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10, max: 100)
  - `status`: Filter by status (pending/solved)
  - `fromDate`: Filter from date (YYYY-MM-DD)
  - `toDate`: Filter to date (YYYY-MM-DD)
- **Response**: Paginated list of tickets

#### GET `/api/tickets/{id}`

- **Purpose**: Get specific ticket by ID
- **Access**: Ticket owner or IT personnel
- **Response**: Complete ticket details with attachments

#### PUT `/api/tickets/{id}`

- **Purpose**: Update ticket details
- **Access**: Ticket owner (for pending tickets only)
- **Features**:
  - Update description
  - Add/update attachments
- **Request Body**: Updated ticket information
- **Response**: Updated ticket details

#### PATCH `/api/tickets/{id}/close`

- **Purpose**: Close ticket and mark as solved
- **Access**: IT personnel only
- **Features**:
  - Notes required when closing
  - Changes status to "solved"
- **Request Body**: Resolution notes (required)
- **Response**: Updated ticket with solved status

#### PATCH `/api/tickets/{id}/reopen`

- **Purpose**: Reopen closed ticket
- **Access**: IT personnel only
- **Features**:
  - Changes status back to "pending"
  - Allows for ticket follow-up
- **Response**: Updated ticket with pending status

### Health Check

#### GET `/health`

- **Purpose**: API health status
- **Access**: Public
- **Response**: Server status and timestamp

## Data Models

### User Model

```json
{
  "id": "string",
  "username": "string",
  "email": "string",
  "role": "system_owner|super_admin|admin|it_person|user",
  "isActive": "boolean",
  "ipNumber": "string",
  "deviceName": "string",
  "deviceIpAddress": "string",
  "businessType": "small_business|medium_business|large_business",
  "accountLimit": "number",
  "expiryDate": "date-time",
  "location": "string",
  "createdAt": "date-time",
  "updatedAt": "date-time"
}
```

### Ticket Model

```json
{
  "id": "string",
  "description": "string",
  "status": "pending|solved",
  "notes": "string",
  "createdById": "string",
  "createdBy": "User object",
  "attachments": ["Attachment objects"],
  "createdAt": "date-time",
  "updatedAt": "date-time"
}
```

### Attachment Model

```json
{
  "id": "string",
  "name": "string",
  "url": "string",
  "fileType": "string",
  "ticketId": "string",
  "createdAt": "date-time"
}
```

## File Upload Specifications

### Supported File Types

- **Images**: JPEG (.jpg, .jpeg), PNG (.png)
- **Documents**: PDF (.pdf), Text files (.txt)

### File Size Limits

- **Maximum per file**: 25MB
- **Multiple files**: Supported per ticket

### Upload Process

1. Files are uploaded to `/uploads/tickets/` directory
2. Unique filenames are generated to prevent conflicts
3. File metadata is stored in the database
4. Files are associated with specific tickets

## Error Handling

### Standard Error Response Format

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

### Common HTTP Status Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (authentication required)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **409**: Conflict (duplicate data)
- **413**: Payload Too Large (file size exceeded)
- **429**: Too Many Requests (rate limited)
- **500**: Internal Server Error

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Window**: 15 minutes
- **Maximum requests**: Configurable per IP address
- **Response**: 429 status code when limit exceeded

## Security Features

### Authentication & Authorization

- JWT-based authentication
- Role-based access control
- Token expiration and refresh mechanisms

### Security Headers

- Helmet.js for security headers
- CORS configuration
- Input validation and sanitization

### File Upload Security

- File type validation
- Size limitations
- Secure file storage

## Testing with Swagger UI

### Step-by-Step Guide

1. **Start the Development Server**

   ```bash
   npm run dev
   ```

2. **Access Swagger UI**

   - Open browser and navigate to `http://localhost:5000/api-docs/`

3. **Authenticate**

   - Click "Authorize" button in Swagger UI
   - Use the login endpoint to get a JWT token
   - Enter token in format: `Bearer <your-token>`
   - Click "Authorize"

4. **Test Endpoints**
   - Expand any endpoint section
   - Click "Try it out"
   - Fill in required parameters
   - Click "Execute"
   - View response in the UI

### Sample Test Flow

1. **Login** using the `/api/auth/login` endpoint
2. **Copy the JWT token** from the response
3. **Authorize** using the token in Swagger UI
4. **Create a ticket** using `/api/tickets` POST endpoint
5. **View tickets** using `/api/tickets` GET endpoint
6. **Update or close tickets** as needed

## Environment Configuration

Ensure the following environment variables are configured:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/helpdesk"

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"

# Server
PORT=5000
NODE_ENV="development"

# CORS
FRONTEND_URL="http://localhost:3000"
```

## Best Practices

### For API Consumers

1. **Always include authentication headers** for protected endpoints
2. **Handle rate limiting** by implementing retry logic
3. **Validate file types and sizes** before upload
4. **Use pagination** for large data sets
5. **Implement proper error handling** for all status codes

### For Development

1. **Use Swagger UI** for endpoint testing during development
2. **Follow RESTful conventions** when adding new endpoints
3. **Document new endpoints** with proper JSDoc annotations
4. **Test authentication flows** thoroughly
5. **Validate all input data** before processing

## Support

For API support and questions:

- **Email**: support@ithelpdesk.com
- **Documentation**: Use Swagger UI for interactive documentation
- **Issue Reporting**: Include API endpoint, request details, and error messages

---

**Last Updated**: January 2024  
**API Version**: 1.0.0  
**Documentation Version**: 1.0.0
