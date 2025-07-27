# IT Help Desk Ticketing System - Copilot Instructions

## System Architecture

This is a **role-based hierarchical ticketing system** with strict access controls and multi-tenant capabilities:

- **5-tier user hierarchy**: `system_owner` → `super_admin` → `admin` → `it_person` → `user`
- **Account limits by business type**: Small (300), Medium (700), Large (3000 users)
- **Hierarchical data visibility**: Users only see tickets/users in their management chain
- **Auto-archiving**: Tickets older than 6 months moved to archive database

## Key Development Patterns

### Backend Service Layer Pattern

All business logic lives in `src/services/` - controllers are thin wrappers:

```typescript
// Controllers delegate to services
export const login = async (req: Request, res: Response) => {
  const result = await AuthService.login(req.body);
  res.json(result);
};
```

### Role-Based Query Filtering

Use `src/utils/filter.ts` patterns for hierarchical data access:

- Clone Prisma query objects before execution: `const query = structuredClone(baseQuery)`
- Build filters based on user hierarchy (see `UserService.getHierarchicalUsers()`)
- Always include date range filtering capabilities

### Authentication & Authorization Flow

- JWT tokens with 7-day expiry (`src/utils/jwt.ts`)
- Role hierarchy enforcement via `src/middlewares/roleMiddleware.ts`
- Account expiry checking for `super_admin` roles
- Hierarchical user creation permissions (creators can only create lower-tier users)

## Database & Prisma Patterns

### Schema Structure

- **User model**: Contains hierarchy fields (`systemOwnerId`, `superAdminId`, etc.)
- **Ticket model**: Links to creator with device tracking (`ip_address`, `device_name`)
- **Archive pattern**: 6-month threshold with separate archive database

### Query Optimization

- Use `include` for related data, `select` for specific fields only
- Implement pagination with `skip`/`take` for all list endpoints
- Clone query objects before execution to prevent mutation

## Frontend Architecture (Next.js 15)

### Server Actions Pattern

All API calls use server actions in `actions/` directory:

```typescript
// actions/auth.action.ts
export const login = async ({ username, password }: LoginRequest) => {
  const response = await fetchJson("auth/login", {
    /* ... */
  });
  // Set cookies and return data
};
```

### Component Organization

- **Role-specific dashboards**: `components/{role}/` (admin, it-person, etc.)
- **Feature modules**: `components/tickets/`, `components/users/`
- **Shared UI**: `components/ui/` (shadcn/ui components)

### Form Validation

Use Zod schemas with react-hook-form:

```typescript
const createTicketSchema = z.object({
  description: z.string().min(10).max(1000),
  ip_address: z.string().optional().refine(/* IP validation */),
});
```

## Development Workflows

### Local Development

```bash
# Backend
cd backend && npm run dev              # Starts on :5000
npm run prisma:migrate                 # Apply migrations
npm run prisma:studio                  # Database GUI

# Frontend
cd frontend && npm run dev             # Starts on :3000
```

### Docker Deployment

- Full stack: `docker-compose up`
- Backend exposes port 5000 internally
- Nginx reverse proxy handles routing
- PostgreSQL with persistent volumes

### Database Management

- Migrations in `backend/prisma/migrations/`
- Seed data via `backend/prisma/seed.ts`
- Archive service handles 6-month data lifecycle

## Security & Constants

### Key Configuration Files

- `backend/src/utils/constants.ts`: All system limits and configurations
- `backend/.cursorrules`: Project-specific development rules
- Role permissions enforced via middleware chains

### File Upload Handling

- UploadThing integration for frontend uploads
- URL-based attachment storage (not file system)
- Max 10 attachments per ticket, specific file type restrictions

## Testing & API Documentation

- Swagger UI available at `/api-docs` (backend)
- API documentation in `backend/docs/API_DOCUMENTATION.md`
- Comprehensive error handling with standardized HTTP status codes

## Critical Business Rules

1. **Hierarchy enforcement**: Users can only create/manage users below their role level
2. **Account limits**: Super admins cannot exceed their business type limits
3. **Ticket visibility**: Users only see tickets from their hierarchy branch
4. **Archive automation**: 6-month threshold with automatic data movement
5. **Expiry management**: Super admin accounts have configurable expiry dates

When working with this codebase, always consider the hierarchical access model and ensure new features respect the role-based visibility constraints.
