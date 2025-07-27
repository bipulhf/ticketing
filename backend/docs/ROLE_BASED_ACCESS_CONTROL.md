# Role-Based Access Control System Documentation

## Overview

This document describes the implementation of the role-based access control system with department and location management for the IT Helpdesk ticketing system.

## Role Hierarchy

### System Owner

- **Can Create**: Super Admin
- **Department Assignment**: Assigns one department (IT Operations or IT QCS) to Super Admin
- **Location Assignment**: Assigns multiple locations using checkbox selection
- **Access**: Can view and manage all tickets across all locations

### Super Admin

- **Can Create**: Admin, IT Person
- **Department**: Inherits department from System Owner
- **Locations**: Inherits multiple locations from System Owner
- **Access**: Can view tickets from all assigned locations, can filter by location

### Admin

- **Can Create**: IT Person, User
- **Department**: Inherits department from Super Admin
- **Location**: Inherits single location from Super Admin
- **Access**: Can view tickets from assigned location and department

### IT Person

- **Can Create**: User
- **Department**: Inherits department from Admin
- **Location**: Inherits single location from Admin
- **Access**: Can view tickets from assigned location and department

### Normal User

- **Can Create**: None
- **Department**: Selectable at ticket creation (for display/filtering only)
- **Location**: Inherits location from IT Person
- **Access**: Can only view their own tickets

## Departments

### IT Departments (Admin & IT Person)

- `it_operations` - IT Operations
- `it_qcs` - IT QCS

### User Departments (Normal Users - Display/Filter Only)

- `qa` - QA
- `qc` - QC
- `production` - Production
- `microbiology` - Microbiology
- `hse` - HSE
- `engineering` - Engineering
- `marketing` - Marketing
- `accounts` - Accounts
- `validation` - Validation
- `ppic` - PPIC
- `warehouse` - Warehouse
- `development` - Development

## Locations

All roles can be assigned to these locations:

- `tongi` - Tongi
- `salna` - Salna
- `mirpur` - Mirpur
- `mawna` - Mawna
- `rupganj` - Rupganj

## Ticket Requirements

All tickets must include the following required fields:

### Required Fields

- **Device Name** (`device_name`): String - Name of the device
- **IP Address** (`ip_address`): String - Valid IPv4 format only
- **IP Number** (`ip_number`): String - IP number field
- **Department** (`department`): ITDepartment - Either "it_operations" or "it_qcs"
- **Location** (`location`): Location - One of the available locations

### Optional Fields

- **User Department** (`user_department`): UserDepartment - For display/filtering (normal users only)

## API Endpoints

### User Management

#### Create Super Admin (System Owner only)

```http
POST /api/users/super-admin
Content-Type: application/json

{
  "username": "superadmin1",
  "email": "superadmin1@example.com",
  "password": "password123",
  "businessType": "medium_business",
  "department": "it_operations",
  "locations": ["tongi", "salna", "mirpur"]
}
```

#### Create Admin (Super Admin only)

```http
POST /api/users/admin
Content-Type: application/json

{
  "username": "admin1",
  "email": "admin1@example.com",
  "password": "password123"
}
```

_Note: Department and location are inherited from Super Admin_

#### Create IT Person (Admin only)

```http
POST /api/users/it-person
Content-Type: application/json

{
  "username": "itperson1",
  "email": "itperson1@example.com",
  "password": "password123"
}
```

_Note: Department and location are inherited from Admin_

#### Create User (IT Person only)

```http
POST /api/users/user
Content-Type: application/json

{
  "username": "user1",
  "email": "user1@example.com",
  "password": "password123"
}
```

_Note: Location is inherited from IT Person_

### Ticket Management

#### Create Ticket (User or IT Person)

```http
POST /api/tickets
Content-Type: application/json

{
  "description": "Network connectivity issue",
  "ip_address": "192.168.1.100",
  "device_name": "PC-001",
  "ip_number": "192.168.1.100",
  "department": "it_operations",
  "location": "tongi",
  "user_department": "production"
}
```

#### Get Tickets (Role-based filtering)

```http
GET /api/tickets?page=1&limit=10&status=pending&location=tongi&department=it_operations
```

#### Update Ticket (IT Person and above)

```http
PUT /api/tickets/:id
Content-Type: application/json

{
  "status": "solved",
  "notes": "Issue resolved by restarting the network adapter"
}
```

## Validation Rules

### IP Address Validation

- Must be valid IPv4 format (e.g., 192.168.1.100)
- No alternative IP formats allowed
- Regex pattern: `/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/`

### Department Validation

- IT roles (Super Admin, Admin, IT Person): Must be `it_operations` or `it_qcs`
- Normal users: Can select from user departments for display/filtering only

### Location Validation

- Super Admin: Multiple locations required
- Admin/IT Person: Single location required
- Normal users: Inherit location from IT Person

## Access Control Rules

### Ticket Access

- **System Owner**: Can access all tickets
- **Super Admin**: Can access tickets from assigned locations
- **Admin**: Can access tickets from assigned location and department
- **IT Person**: Can access tickets from assigned location and department
- **Normal User**: Can only access their own tickets

### User Management

- **System Owner**: Can create Super Admins
- **Super Admin**: Can create Admins and IT Persons
- **Admin**: Can create IT Persons and Users
- **IT Person**: Can create Users
- **Normal User**: Cannot create any users

## Frontend Integration

### Utility Functions

The backend provides utility functions for frontend integration:

```typescript
// Get department options based on role
const departmentOptions = getDepartmentOptions(userRole);

// Get location options
const locationOptions = getLocationOptions();

// Get display names
const roleName = getRoleDisplayName(role);
const departmentName = getDepartmentDisplayName(department);
const locationName = getLocationDisplayName(location);
```

### Form Validation

When creating tickets, ensure:

1. All required fields are provided
2. IP address is in valid IPv4 format
3. Department is appropriate for the user's role
4. Location is valid and accessible to the user

### UI Considerations

1. **System Owner Dashboard**:

   - Show department and location assignment options when creating Super Admin
   - Multiple location selection with checkboxes

2. **Super Admin Dashboard**:

   - Show inherited department and locations
   - Filter tickets by location

3. **Admin/IT Person Dashboard**:

   - Show inherited department and single location
   - Filter tickets by location and department

4. **User Dashboard**:
   - Show inherited location
   - Allow department selection at ticket creation (for display only)

## Error Messages

Common error messages and their meanings:

- `DEPARTMENT_REQUIRED`: Department is required for this role
- `LOCATION_REQUIRED`: Location is required for this role
- `INVALID_IP_FORMAT`: IP address format is invalid
- `DEVICE_NAME_REQUIRED`: Device name is required
- `IP_NUMBER_REQUIRED`: IP number is required
- `IP_ADDRESS_REQUIRED`: IP address is required
- `MULTIPLE_LOCATIONS_REQUIRED`: Multiple locations are required for Super Admin
- `SINGLE_LOCATION_REQUIRED`: Only one location can be assigned to Admin/IT Person

## Testing

### Test Cases

1. **User Creation Hierarchy**:

   - System Owner creates Super Admin with department and locations
   - Super Admin creates Admin (inherits department and one location)
   - Admin creates IT Person (inherits department and location)
   - IT Person creates User (inherits location only)

2. **Ticket Creation**:

   - Validate required fields
   - Test IP address format validation
   - Test department assignment based on role
   - Test location inheritance

3. **Access Control**:
   - Test ticket access based on role and location
   - Test user management permissions
   - Test filtering capabilities

### Sample Data

```json
{
  "systemOwner": {
    "username": "system_owner",
    "email": "system@example.com",
    "role": "system_owner"
  },
  "superAdmin": {
    "username": "super_admin",
    "email": "super@example.com",
    "role": "super_admin",
    "department": "it_operations",
    "locations": ["tongi", "salna"]
  },
  "admin": {
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin",
    "department": "it_operations",
    "userLocation": "tongi"
  },
  "itPerson": {
    "username": "it_person",
    "email": "it@example.com",
    "role": "it_person",
    "department": "it_operations",
    "userLocation": "tongi"
  },
  "user": {
    "username": "user",
    "email": "user@example.com",
    "role": "user",
    "userLocation": "tongi"
  }
}
```
