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
| **System Owner** | Super Admins      | All            | ❌            | System-wide      | None                   |
| **Super Admin**  | Admins            | Hierarchy      | ❌            | Business-level   | Based on business type |
| **Admin**        | IT Persons, Users | Hierarchy      | ❌            | Department-level | None                   |
| **IT Person**    | Users             | Hierarchy      | ✅            | Team-level       | None                   |
| **User**         | None              | Own tickets    | ❌            | Personal         | None                   |

### **Hierarchy Tracking System**

- **New Feature**: Each user tracks their complete hierarchy chain
- **Fields**: `systemOwnerId`, `superAdminId`, `adminId`, `itPersonId`
- **Inheritance**: Users inherit the full chain from their creator
- **Visibility**: `/my_users` API shows all users in your hierarchy
- **Ticket Access**: See tickets from users anywhere in your management chain

### **Database Schema**

The system uses the following core models:

- **Users** - With hierarchical relationships and role-based fields
- **Tickets** - With device information and status tracking
- **Attachments** - URL-based file storage
- **Archive Models** - For historical data (6+ months)

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

### Setup Instructions (For Server Deployment using Docker CLI)

1. **Install Docker and Docker Compose**

   Make sure Docker and Docker Compose are installed on your server.

   **Install Docker:**

   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   ```

   **Install Docker Compose (if not included):**

   ```bash
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

2. **Navigate to the Project Directory**

   ```bash
   cd /path/to/your/project
   ```

3. **Update `UPLOADTHING_CALLBACK_URL`**

   Open the `docker-compose.yml` file and **update the `UPLOADTHING_CALLBACK_URL`** environment variable with your actual domain name or IP.

   Example:

   ```yaml
   environment:
     UPLOADTHING_CALLBACK_URL: "https://yourdomain.com"
   ```

4. **Build and Start the Application**

   Use Docker Compose to build and run the application in detached mode:

   ```bash
   sudo docker compose up --build -d
   ```

5. **Access the Application**

   Once the services are up and running, you can access the system via:

   - **URL:** [http://your-server-ip-or-domain](http://your-server-ip-or-domain)

6. **Default System Owner Account**

   A default **System Owner** account will be created automatically:

   - **Username:** `system_owner`
   - **Password:** `defaultPassword123!`

7. **User Account Policy**

   - Each user must register with a **unique username**.
   - The default password for all new users is: `defaultPassword123!`
   - All users are strongly encouraged to **change their password** after first login.
