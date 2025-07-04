# IT Help Desk Ticketing Software Backend

A comprehensive IT Help Desk ticketing system built with Node.js, Express, TypeScript, and Prisma.

## Features

- **Role-Based Access Control**: 5 user roles (System Owner, Super Admin, Admin, IT Person, User)
- **Ticket Management**: Create, view, update, and close tickets with URL-based attachments
- **Account Management**: Hierarchical user creation with account limits
- **Dashboard Metrics**: Real-time statistics and filtering
- **Data Archiving**: Automatic archiving of tickets older than 6 months
- **Authentication**: JWT-based authentication with role-based permissions
- **Type Safety**: Full TypeScript implementation with strict type checking
- **Error Handling**: Comprehensive error handling and validation

## Tech Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi for request validation
- **Security**: Helmet, CORS, Rate limiting

## Project Structure

```
src/
├── controllers/           # Request handlers
│   ├── authController.ts
│   ├── ticketController.ts
│   └── userController.ts
├── routes/               # API routes
│   ├── authRoutes.ts
│   └── ticketRoutes.ts
├── services/             # Business logic
│   ├── authService.ts
│   ├── ticketService.ts
│   ├── userService.ts
│   └── archiveService.ts
├── middlewares/          # Express middlewares
│   ├── authMiddleware.ts
│   ├── roleMiddleware.ts
│   ├── errorMiddleware.ts
│   └── attachmentMiddleware.ts
├── utils/               # Utility functions
│   ├── jwt.ts
│   ├── password.ts
│   ├── filter.ts
│   └── constants.ts
├── config/              # Configuration
│   ├── prisma.ts
│   └── swagger.ts
├── app.ts              # Express app setup
└── server.ts           # Server entry point
```

## Installation

1. **Clone the repository and install dependencies**

   ```bash
   npm install
   ```

2. **Set up environment variables**

   ```bash
   cp env.template .env
   ```

   Update `.env` with your configuration:

   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/helpdesk_db"
   ARCHIVE_DATABASE_URL="postgresql://username:password@localhost:5432/helpdesk_archive_db"
   JWT_SECRET="your-super-secret-jwt-key-here"
   PORT=5000
   NODE_ENV="development"
   ```

3. **Set up the database**

   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run database migrations
   npx prisma migrate dev

   # Seed the database with system owner
   npm run prisma:seed
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## User Roles & Permissions

### System Owner

- Full system access
- Manage Super Admin accounts
- Set account limits and expiry dates
- View all reports and dashboards

### Super Admin

- Create Admin accounts (limited by business type)
- View dashboard with Admin, IT Person, and User counts
- Track ticket statistics with date filtering
- Account expiry management

### Admin

- Create IT Person and User accounts
- View tickets from managed users
- Dashboard with ticket tracking
- Date filtering capabilities

### IT Person

- Create User accounts
- View and close tickets
- Add notes when closing tickets
- Raise tickets on behalf of users

### User

- Raise tickets with descriptions and attachments
- Track own ticket status
- Provide IP numbers and device information

## API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Create new user (protected)
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/logout` - User logout

### Tickets

- `POST /api/tickets` - Create new ticket
- `GET /api/tickets` - Get tickets (filtered by role)
- `GET /api/tickets/:id` - Get specific ticket
- `PUT /api/tickets/:id` - Update ticket
- `PATCH /api/tickets/:id/close` - Close ticket (IT Person only)
- `PATCH /api/tickets/:id/reopen` - Reopen ticket (IT Person only)

## 📚 API Documentation (Swagger)

### Interactive Documentation

The API includes comprehensive Swagger documentation for easy testing and exploration:

**Access Swagger UI**: [http://localhost:5000/api-docs/](http://localhost:5000/api-docs/)

### Features

- 🔧 **Interactive Testing**: Test all endpoints directly from the browser
- 🔐 **Authentication Support**: Built-in JWT token authentication testing
- 📋 **Complete Schemas**: Detailed request/response documentation
- 🎯 **Role-Based Examples**: Examples for different user roles
- 📁 **File Upload Testing**: Test file attachments with size and type validation
- 📄 **Export Options**: Export API specification for external tools

### Quick Start with Swagger

1. **Start the server**: `npm run dev`
2. **Open Swagger UI**: Navigate to `http://localhost:5000/api-docs/`
3. **Authenticate**:
   - Use the `/api/auth/login` endpoint with default credentials
   - Copy the JWT token from the response
   - Click the "Authorize" button and enter: `Bearer <your-token>`
4. **Test endpoints**: All authenticated endpoints are now accessible

### Swagger Features Included

- **Complete API Coverage**: All endpoints documented with examples
- **Schema Validation**: Request/response models with validation rules
- **Authentication Flow**: JWT token-based authentication testing
- **Error Documentation**: Comprehensive error codes and messages
- **File Upload Support**: Test attachment uploads with validation
- **Pagination Examples**: Ticket listing with pagination parameters
- **Role-Based Access**: Clear permission requirements for each endpoint

### API Documentation Files

- **Swagger Config**: `src/config/swagger.ts` - OpenAPI 3.0 specification
- **Route Documentation**: JSDoc annotations in route files
- **Detailed Guide**: `docs/API_DOCUMENTATION.md` - Comprehensive API guide

For detailed API documentation and usage examples, see: [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)

## Default Credentials

After running the seed script:

- **Username**: `system_owner`
- **Password**: `admin123!`

⚠️ **Important**: Change the default password after first login!

## Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Start production server
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio
npm run prisma:seed      # Seed database
```

## Attachment System

The system uses URL-based attachments instead of file uploads:

```javascript
// Example attachment structure
{
  "attachments": [
    {
      "name": "Error Screenshot",
      "url": "https://example.com/screenshot.png",
      "fileType": "png"
    }
  ]
}
```

## Business Logic

### Account Limits

- Small Business: 300 accounts
- Medium Business: 700 accounts
- Large Business: 3000 accounts

### Data Archiving

- Tickets older than 6 months are automatically archived
- Archived data moved to separate database
- Original tickets deleted from main database

## API Response Format

```javascript
// Success Response
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}

// Error Response
{
  "success": false,
  "error": {
    "message": "Error description"
  }
}
```
