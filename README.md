# 🎫 IT Help Desk Ticketing System

A comprehensive, role-based IT Help Desk ticketing system with hierarchical user management, built with modern web technologies.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?logo=postgresql&logoColor=white)](https://postgresql.org/)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture Overview](#-architecture-overview)
- [User Roles & Hierarchy](#-user-roles--hierarchy)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Environment Configuration](#-environment-configuration)
- [Database Setup](#-database-setup)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Key Features](#-key-features)
- [Development](#-development)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [Support](#-support)

## ✨ Features

### 🔐 **Advanced User Management**

- **5-tier hierarchical role system** (System Owner → Super Admin → Admin → IT Person → User)
- **Account limits** based on business type (Small: 300, Medium: 700, Large: 3000 users)
- **Account expiry management** for Super Admin accounts
- **Hierarchical visibility** - users see only tickets/users in their management chain

### 🎫 **Comprehensive Ticket System**

- **Rich ticket creation** with descriptions, device info, and file attachments
- **Role-based ticket access** - users see only relevant tickets
- **Ticket lifecycle management** - create, update, close, reopen
- **File attachment support** with URL-based storage
- **Device tracking** (IP addresses, device names)

### 📊 **Dynamic Dashboard & Analytics**

- **Role-specific dashboards** with relevant metrics
- **Real-time ticket statistics** (pending, solved, total)
- **User management insights** by role
- **Date range filtering** for historical analysis
- **Account utilization tracking**

### 🔧 **Advanced Technical Features**

- **Automatic data archiving** (6+ month old tickets)
- **Comprehensive API documentation** with Swagger UI
- **JWT-based authentication** with refresh tokens
- **Rate limiting** and security headers
- **Full TypeScript implementation**

## 🚀 Tech Stack

### **Frontend**

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: React Hook Form + Zod validation
- **Notifications**: Sonner toasts
- **File Uploads**: UploadThing integration

### **Backend**

- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Documentation**: Swagger/OpenAPI 3.0
- **Security**: Helmet, CORS, Rate limiting
- **Validation**: Joi schemas

### **Infrastructure**

- **Database**: PostgreSQL (main + archive)
- **File Storage**: URL-based attachment system
- **API Documentation**: Interactive Swagger UI
- **Environment**: Docker support ready

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│                 │    │                 │    │                 │
│ Next.js 15      │◄──►│ Express.js      │◄──►│ PostgreSQL      │
│ TypeScript      │    │ TypeScript      │    │ Prisma ORM      │
│ Tailwind CSS    │    │ JWT Auth        │    │ Archive DB      │
│ Radix UI        │    │ Swagger Docs    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 👥 User Roles & Hierarchy

### **Role Hierarchy Flow**

```
System Owner
    ↓ creates
Super Admin (with account limits)
    ↓ creates
Admin
    ↓ creates
IT Person
    ↓ creates
User
```

### **Permissions Matrix**

| Role             | Create Users      | Manage Tickets | Close Tickets | View Dashboard   | Account Limits         |
| ---------------- | ----------------- | -------------- | ------------- | ---------------- | ---------------------- |
| **System Owner** | Super Admins      | All            | ✅            | System-wide      | None                   |
| **Super Admin**  | Admins            | Hierarchy      | ✅            | Business-level   | Based on business type |
| **Admin**        | IT Persons, Users | Hierarchy      | ❌            | Department-level | None                   |
| **IT Person**    | Users             | Hierarchy      | ✅            | Team-level       | None                   |
| **User**         | None              | Own tickets    | ❌            | Personal         | None                   |

### **Hierarchy Tracking System**

- **New Feature**: Each user tracks their complete hierarchy chain
- **Fields**: `systemOwnerId`, `superAdminId`, `adminId`, `itPersonId`
- **Inheritance**: Users inherit the full chain from their creator
- **Visibility**: `/my_users` API shows all users in your hierarchy
- **Ticket Access**: See tickets from users anywhere in your management chain

## ⚡ Quick Start

### **Prerequisites**

- Node.js 20+
- PostgreSQL 16+
- npm or yarn

### **1-Minute Setup**

```bash
# Clone the repository
git clone https://github.com/bipulhf/ticketing.git
cd ticketing

# Backend setup
cd backend
npm install
cp .env.example .env  # Configure your database
npx prisma migrate dev
npm run prisma:seed
npm run dev

# Frontend setup (new terminal)
cd ../frontend
npm install
npm run dev
```

**Default Login:**

- Username: `system_owner`
- Password: `admin123!`

## 📦 Installation

### **Backend Setup**

```bash
cd backend

# Install dependencies
npm install

# Environment configuration
cp .env.example .env
# Edit .env with your configuration

# Database setup
npx prisma generate
npx prisma migrate dev
npm run prisma:seed

# Start development server
npm run dev
```

### **Frontend Setup**

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## ⚙️ Environment Configuration

### **Backend (.env)**

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/helpdesk_db"
DIRECT_URL="postgresql://username:password@localhost:5432/helpdesk_db"
ARCHIVE_DATABASE_URL="postgresql://username:password@localhost:5432/helpdesk_archive_db"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=5000
NODE_ENV="development"

# CORS Configuration
FRONTEND_URL="http://localhost:3000"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
```

### **Frontend (.env.local)**

```env
# API Configuration
NEXT_PUBLIC_API_URL="http://localhost:5000/api"

# File Upload (if using UploadThing)
UPLOADTHING_SECRET="your-uploadthing-secret"
UPLOADTHING_APP_ID="your-uploadthing-app-id"
```

## 🗄️ Database Setup

### **PostgreSQL Setup**

```sql
-- Create main database
CREATE DATABASE helpdesk_db;

-- Create archive database
CREATE DATABASE helpdesk_archive_db;

-- Create user with permissions
CREATE USER helpdesk_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE helpdesk_db TO helpdesk_user;
GRANT ALL PRIVILEGES ON DATABASE helpdesk_archive_db TO helpdesk_user;
```

### **Database Schema**

The system uses the following core models:

- **Users** - With hierarchical relationships and role-based fields
- **Tickets** - With device information and status tracking
- **Attachments** - URL-based file storage
- **Archive Models** - For historical data (6+ months)

### **Migrations & Seeding**

```bash
# Apply database migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Seed with default system owner
npm run prisma:seed

# Open Prisma Studio (optional)
npx prisma studio
```

## 🚀 Running the Application

### **Development Mode**

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
# Server running on http://localhost:5000
# API docs: http://localhost:5000/api-docs
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
# Application running on http://localhost:3000
```

### **Production Mode**

**Backend:**

```bash
cd backend
npm run build
npm start
```

**Frontend:**

```bash
cd frontend
npm run build
npm start
```

## 📚 API Documentation

### **Interactive Swagger UI**

- **Local**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
- **Features**: Interactive testing, authentication, schema validation

### **Key API Endpoints**

#### **Authentication**

```
POST /api/auth/login          # User login
POST /api/auth/register       # Create user (protected)
POST /api/auth/refresh        # Refresh JWT token
GET  /api/auth/profile        # Get user profile
POST /api/auth/logout         # User logout
```

#### **User Management**

```
POST /api/users/create-super-admin  # Create Super Admin (System Owner only)
POST /api/users/create-admin        # Create Admin (Super Admin only)
POST /api/users/create-it-person    # Create IT Person (Admin+)
POST /api/users/create-user         # Create User (IT Person+)
GET  /api/users/my-users           # Get users in hierarchy
```

#### **Ticket Management**

```
POST /api/tickets              # Create ticket
GET  /api/tickets              # Get tickets (filtered by hierarchy)
GET  /api/tickets/{id}         # Get specific ticket
PUT  /api/tickets/{id}         # Update ticket
PATCH /api/tickets/{id}/close  # Close ticket (IT Person only)
```

#### **Dashboard & Analytics**

```
GET /api/dashboard/system-owner    # System Owner dashboard
GET /api/dashboard/super-admin     # Super Admin dashboard
GET /api/dashboard/admin           # Admin dashboard
GET /api/dashboard/it-person       # IT Person dashboard
```

### **Authentication**

All protected endpoints require JWT token:

```
Authorization: Bearer <your-jwt-token>
```

## 📁 Project Structure

### **Backend Structure**

```
backend/
├── src/
│   ├── controllers/         # Request handlers
│   │   ├── authController.ts
│   │   ├── userController.ts
│   │   ├── ticketController.ts
│   │   └── dashboardController.ts
│   ├── routes/             # API routes
│   │   ├── authRoutes.ts
│   │   ├── userRoutes.ts
│   │   ├── ticketRoutes.ts
│   │   └── dashboardRoutes.ts
│   ├── services/           # Business logic
│   │   ├── authService.ts
│   │   ├── userService.ts
│   │   ├── ticketService.ts
│   │   └── archiveService.ts
│   ├── middlewares/        # Express middlewares
│   │   ├── authMiddleware.ts
│   │   ├── roleMiddleware.ts
│   │   └── errorMiddleware.ts
│   ├── utils/             # Utilities
│   │   ├── constants.ts
│   │   ├── jwt.ts
│   │   ├── password.ts
│   │   └── filter.ts
│   ├── config/            # Configuration
│   │   ├── prisma.ts
│   │   └── swagger.ts
│   ├── app.ts            # Express app setup
│   └── server.ts         # Server entry point
├── prisma/
│   ├── schema.prisma     # Database schema
│   ├── migrations/       # Database migrations
│   └── seed.ts          # Seed data
├── docs/
│   └── API_DOCUMENTATION.md
└── package.json
```

### **Frontend Structure**

```
frontend/
├── app/                   # Next.js App Router
│   ├── dashboard/         # Dashboard pages
│   │   ├── profile/
│   │   ├── tickets/
│   │   └── users/
│   ├── login/            # Login page
│   ├── page.tsx          # Home page
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/           # React components
│   ├── admin/           # Admin-specific components
│   ├── it-person/       # IT Person components
│   ├── super-admin/     # Super Admin components
│   ├── system-owner/    # System Owner components
│   ├── tickets/         # Ticket components
│   ├── users/           # User management components
│   └── ui/              # Reusable UI components
├── actions/             # Server actions
│   ├── auth.action.ts
│   ├── tickets.action.ts
│   └── users.action.ts
├── types/               # TypeScript types
│   └── types.ts
├── utils/               # Utilities
│   └── custom-fetch.ts
└── package.json
```

## 🔑 Key Features

### **1. Hierarchical User Management**

- **Role-based user creation** with permission validation
- **Account limits** enforced based on business type
- **Hierarchy tracking** - complete parent chain stored for each user
- **Inherited permissions** - users inherit access from their creators

### **2. Advanced Ticket System**

- **Rich ticket creation** with device information tracking
- **File attachments** with URL-based storage system
- **Role-based visibility** - see only relevant tickets
- **Status management** - pending, solved, with IT Person closure

### **3. Dynamic Dashboards**

- **Role-specific metrics** tailored to user responsibilities
- **Real-time statistics** with date range filtering
- **Account utilization** tracking for Super Admins
- **Expiry management** with alerts

### **4. Security & Performance**

- **JWT authentication** with refresh token support
- **Rate limiting** to prevent API abuse
- **Input validation** with Joi schemas
- **SQL injection protection** with Prisma ORM
- **CORS and security headers** with Helmet

### **5. Data Management**

- **Automatic archiving** of tickets older than 6 months
- **Dual database** system (main + archive)
- **Database connection pooling** for performance
- **Migration system** for schema updates

## 🛠️ Development

### **Development Scripts**

**Backend:**

```bash
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server
npm run prisma:generate # Generate Prisma client
npm run prisma:migrate  # Run database migrations
npm run prisma:studio   # Open Prisma Studio
npm run prisma:seed     # Seed database
```

**Frontend:**

```bash
npm run dev     # Start development server
npm run build   # Build for production
npm run start   # Start production server
npm run lint    # Run ESLint
```

### **Code Quality**

- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting
- **Husky** for git hooks (optional)

### **Testing Strategy**

- **API Testing**: Use Swagger UI for interactive testing
- **Authentication Flow**: Test all role-based permissions
- **Database**: Test migrations and seed data
- **File Uploads**: Validate attachment functionality

## 🚀 Deployment

### **Production Checklist**

- [ ] Configure production environment variables
- [ ] Set up PostgreSQL databases (main + archive)
- [ ] Configure JWT secrets and security
- [ ] Set up file storage/CDN for attachments
- [ ] Configure CORS for production domains
- [ ] Set up SSL certificates
- [ ] Configure logging and monitoring

### **Environment Variables for Production**

```bash
# Security
NODE_ENV=production
JWT_SECRET="production-secret-min-32-chars"

# Database
DATABASE_URL="postgresql://user:pass@prod-db:5432/helpdesk"
ARCHIVE_DATABASE_URL="postgresql://user:pass@prod-db:5432/helpdesk_archive"

# CORS
FRONTEND_URL="https://your-domain.com"

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=50
```

### **Docker Support**

```dockerfile
# Example backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Contributing

### **Development Workflow**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with proper TypeScript types
4. Test thoroughly with all user roles
5. Update documentation if needed
6. Commit changes (`git commit -m 'Add amazing feature'`)
7. Push to branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### **Coding Standards**

- **TypeScript**: Use strict typing throughout
- **Error Handling**: Use consistent error responses
- **API Design**: Follow RESTful conventions
- **Database**: Use Prisma for all database operations
- **Security**: Validate all inputs and sanitize outputs

### **Testing Guidelines**

- Test all user role permissions
- Verify hierarchy relationships work correctly
- Test file upload/attachment functionality
- Ensure dashboard metrics are accurate
- Validate API endpoints with Swagger

## 🆘 Support

### **Documentation**

- **API Documentation**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
- **Backend README**: [backend/README.md](backend/README.md)
- **API Guide**: [backend/docs/API_DOCUMENTATION.md](backend/docs/API_DOCUMENTATION.md)

### **Common Issues**

**Database Connection:**

```bash
# Check PostgreSQL is running
pg_isready -h localhost -p 5432

# Reset database
npx prisma migrate reset
npm run prisma:seed
```

**Authentication Issues:**

```bash
# Check JWT secret is set
echo $JWT_SECRET

# Clear browser cookies/local storage
# Restart backend server
```

**File Upload Problems:**

- Verify file size limits (25MB default)
- Check supported file types
- Ensure proper CORS configuration

### **Getting Help**

- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Use GitHub Discussions for questions
- **Security**: Report security issues privately

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js** team for the amazing React framework
- **Prisma** for the excellent ORM and database tools
- **Radix UI** for the accessible component primitives
- **Tailwind CSS** for the utility-first CSS framework
- **Express.js** community for the robust backend framework

---

**Built with ❤️ for efficient IT support management**

For detailed API documentation and interactive testing, visit: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
