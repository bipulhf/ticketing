# Docker Setup for Ticketing System

This guide explains how to run the ticketing system using Docker and Docker Compose.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+

## Quick Start

1. **Clone the repository and navigate to the project directory**:

   ```bash
   cd /path/to/ticketing
   ```

2. **Create environment files**:

   Create a `.env` file in the root directory:

   ```env
   # Database Configuration
   DATABASE_URL="postgresql://postgres:password123@postgres:5432/ticketing_system"
   DIRECT_URL="postgresql://postgres:password123@postgres:5432/ticketing_system"

   # JWT Configuration
   JWT_SECRET="your_super_secret_jwt_key_here_change_this_in_production"

   # Backend Configuration
   PORT=5000
   NODE_ENV=production
   OPENSSL_CONF=/dev/null

   # Frontend Configuration
   NEXT_PUBLIC_API_URL="http://localhost:5000"

   # PostgreSQL Database
   POSTGRES_DB=ticketing_system
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=password123
   ```

3. **Build and start all services**:

   ```bash
   docker-compose up --build
   ```

4. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Database: localhost:5432

## Services

### Frontend (Next.js)

- **Port**: 3000
- **Container**: ticketing_system_frontend
- **Build context**: ./frontend

### Backend (Node.js/Express)

- **Port**: 5000
- **Container**: ticketing_system_backend
- **Build context**: ./backend
- **Features**:
  - Automatic database migration on startup
  - Prisma client generation
  - Health checks for database connectivity
  - OpenSSL support for Prisma compatibility

### Database (PostgreSQL)

- **Port**: 5432
- **Container**: ticketing_system
- **Image**: postgres:17
- **Persistent storage**: postgres_data volume

## Development Mode

For development with hot reload:

1. **Backend development**:

   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Frontend development**:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Database only**:
   ```bash
   docker-compose up postgres
   ```

## Docker Commands

### Build and start all services

```bash
docker-compose up --build
```

### Start services in detached mode

```bash
docker-compose up -d
```

### Stop all services

```bash
docker-compose down
```

### View logs

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres
```

### Rebuild specific service

```bash
# Backend only
docker-compose build backend

# Frontend only
docker-compose build frontend
```

### Database Management

#### Access database shell

```bash
docker-compose exec postgres psql -U postgres -d ticketing_system
```

#### Run Prisma commands

```bash
# Generate Prisma client
docker-compose exec backend npx prisma generate

# Run migrations
docker-compose exec backend npx prisma migrate deploy

# View database in Prisma Studio
docker-compose exec backend npx prisma studio
```

#### Reset database

```bash
docker-compose down
docker volume rm ticketing_system_postgres_data
docker-compose up --build
```

## Environment Variables

### Backend (.env)

```env
DATABASE_URL="postgresql://postgres:password123@postgres:5432/ticketing_system"
DIRECT_URL="postgresql://postgres:password123@postgres:5432/ticketing_system"
JWT_SECRET="your_jwt_secret_key"
PORT=5000
NODE_ENV=production
OPENSSL_CONF=/dev/null
```

### Frontend

```env
NEXT_PUBLIC_API_URL="http://localhost:5000"
NODE_ENV=production
```

## Troubleshooting

### Backend fails to start

1. Check if PostgreSQL is running:

   ```bash
   docker-compose logs postgres
   ```

2. Verify database connection:
   ```bash
   docker-compose exec backend nc -z postgres 5432
   ```

### Frontend build fails

1. Clear Next.js cache:
   ```bash
   docker-compose exec frontend rm -rf .next
   docker-compose restart frontend
   ```

### Database migration issues

1. Reset migrations:
   ```bash
   docker-compose exec backend npx prisma migrate reset
   ```

### Prisma OpenSSL issues

If you see warnings about OpenSSL detection in Prisma:

```
prisma:warn Prisma failed to detect the libssl/openssl version to use
```

This is resolved by:

1. OpenSSL packages installed in the Docker image
2. `OPENSSL_CONF=/dev/null` environment variable set
3. Using Node.js 22 with proper Alpine packages

The warning may still appear but shouldn't affect functionality.

### Port conflicts

If ports 3000, 5000, or 5432 are already in use, modify the port mappings in `docker-compose.yml`:

```yaml
services:
  frontend:
    ports:
      - "3001:3000" # Change host port
  backend:
    ports:
      - "5001:5000" # Change host port
  postgres:
    ports:
      - "5433:5432" # Change host port
```

## Security Notes

1. **Change default passwords** in production
2. **Use environment files** (.env) and never commit them to version control
3. **Update JWT_SECRET** to a strong, unique key
4. **Configure proper CORS** settings for production domains

## Production Deployment

For production deployment:

1. Use environment-specific configuration files
2. Set up proper SSL/TLS certificates
3. Configure reverse proxy (nginx/apache)
4. Use managed database services
5. Implement proper logging and monitoring
6. Set up automated backups

## File Structure

```
ticketing/
├── docker-compose.yml          # Docker Compose configuration
├── DOCKER_README.md           # This file
├── backend/
│   ├── Dockerfile             # Backend Docker configuration
│   ├── docker-entrypoint.sh   # Backend startup script
│   └── .dockerignore          # Backend Docker ignore file
├── frontend/
│   ├── Dockerfile             # Frontend Docker configuration
│   └── .dockerignore          # Frontend Docker ignore file
└── .env.example               # Environment variables template
```
