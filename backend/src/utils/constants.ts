export const ACCOUNT_LIMITS = {
  small_business: 300,
  medium_business: 700,
  large_business: 3000,
} as const;

export const USER_ROLES = {
  SYSTEM_OWNER: "system_owner",
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  IT_PERSON: "it_person",
  USER: "user",
} as const;

export const BUSINESS_TYPES = {
  SMALL_BUSINESS: "small_business",
  MEDIUM_BUSINESS: "medium_business",
  LARGE_BUSINESS: "large_business",
} as const;

export const TICKET_STATUSES = {
  PENDING: "pending",
  SOLVED: "solved",
} as const;

// IT Departments for Admin & IT Person
export const IT_DEPARTMENTS = {
  IT_OPERATIONS: "it_operations",
  IT_QCS: "it_qcs",
} as const;

// User Departments for display/filtering (Normal Users)
export const USER_DEPARTMENTS = {
  QA: "qa",
  QC: "qc",
  PRODUCTION: "production",
  MICROBIOLOGY: "microbiology",
  HSE: "hse",
  ENGINEERING: "engineering",
  MARKETING: "marketing",
  ACCOUNTS: "accounts",
  VALIDATION: "validation",
  PPIC: "ppic",
  WAREHOUSE: "warehouse",
  DEVELOPMENT: "development",
} as const;

// Locations for all roles
export const LOCATIONS = {
  TONGI: "tongi",
  SALNA: "salna",
  MIRPUR: "mirpur",
  MAWNA: "mawna",
  RUPGANJ: "rupganj",
} as const;

// Role hierarchy for department and location inheritance
export const ROLE_HIERARCHY = {
  SYSTEM_OWNER: {
    canCreate: ["super_admin"],
    departmentInheritance: false, // System Owner assigns department
    locationInheritance: false, // System Owner assigns multiple locations
  },
  SUPER_ADMIN: {
    canCreate: ["admin", "it_person"],
    departmentInheritance: true, // Inherits department from System Owner
    locationInheritance: true, // Inherits locations from System Owner
  },
  ADMIN: {
    canCreate: ["it_person", "user"],
    departmentInheritance: true, // Inherits department from Super Admin
    locationInheritance: true, // Inherits single location from Super Admin
  },
  IT_PERSON: {
    canCreate: ["user"],
    departmentInheritance: true, // Inherits department from Admin
    locationInheritance: true, // FORCED: Inherits single location from Admin (overrides frontend selection)
  },
  USER: {
    canCreate: [],
    departmentInheritance: false, // Users select department at ticket creation
    locationInheritance: true, // FORCED: Inherits location from IT Person (overrides frontend selection)
  },
} as const;

// Utility functions for frontend integration
export const getDepartmentOptions = (role: string) => {
  if (["super_admin", "admin", "it_person"].includes(role)) {
    return Object.entries(IT_DEPARTMENTS).map(([key, value]) => ({
      label: key.replace(/_/g, " ").toUpperCase(),
      value: value,
    }));
  }
  return Object.entries(USER_DEPARTMENTS).map(([key, value]) => ({
    label: key.charAt(0).toUpperCase() + key.slice(1).toLowerCase(),
    value: value,
  }));
};

export const getLocationOptions = () => {
  return Object.entries(LOCATIONS).map(([key, value]) => ({
    label: key.charAt(0).toUpperCase() + key.slice(1).toLowerCase(),
    value: value,
  }));
};

export const getRoleDisplayName = (role: string) => {
  const roleNames = {
    system_owner: "System Owner",
    super_admin: "Super Admin",
    admin: "Admin",
    it_person: "IT Person",
    user: "User",
  };
  return roleNames[role as keyof typeof roleNames] || role;
};

export const getDepartmentDisplayName = (department: string) => {
  if (Object.values(IT_DEPARTMENTS).includes(department as any)) {
    return department.replace(/_/g, " ").toUpperCase();
  }
  return department.charAt(0).toUpperCase() + department.slice(1).toLowerCase();
};

export const getLocationDisplayName = (location: string) => {
  return location.charAt(0).toUpperCase() + location.slice(1).toLowerCase();
};

export const ATTACHMENT_CONFIG = {
  MAX_ATTACHMENTS_PER_TICKET: 10,
  ALLOWED_FILE_TYPES: [
    "pdf",
    "doc",
    "docx",
    "txt",
    "jpg",
    "jpeg",
    "png",
    "gif",
    "zip",
    "rar",
  ],
  MAX_URL_LENGTH: 2048,
  MAX_NAME_LENGTH: 255,
} as const;

export const ARCHIVE_CONFIG = {
  THRESHOLD_MONTHS: 6,
} as const;

export const JWT_CONFIG = {
  EXPIRES_IN: "7d",
  ALGORITHM: "HS256",
} as const;

export const PASSWORD_CONFIG = {
  DEFAULT_PASSWORD: "123456",
} as const;

export const RATE_LIMIT_CONFIG = {
  WINDOW_MS: 1 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 60,
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const ERROR_MESSAGES = {
  USER_NOT_FOUND: "User not found",
  INVALID_CREDENTIALS: "Invalid credentials",
  ACCESS_DENIED: "Access denied",
  TOKEN_EXPIRED: "Token expired",
  ACCOUNT_EXPIRED: "Account has expired",
  ACCOUNT_LIMIT_EXCEEDED: "Account creation limit exceeded",
  TICKET_NOT_FOUND: "Ticket not found",
  INVALID_URL: "Invalid attachment URL",
  INVALID_ATTACHMENT_TYPE: "Invalid attachment type",
  VALIDATION_ERROR: "Validation error",
  INTERNAL_ERROR: "Internal server error",
  UNAUTHORIZED_ACTION: "Unauthorized to perform this action",
  NOTES_REQUIRED: "Notes are required when closing a ticket",
  CANNOT_RESET_PASSWORD: "Cannot reset password for this user",
  DEPARTMENT_REQUIRED: "Department is required for this role",
  LOCATION_REQUIRED: "Location is required for this role",
  INVALID_IP_FORMAT: "Invalid IP address format",
  DEVICE_NAME_REQUIRED: "Device name is required",
  IP_NUMBER_REQUIRED: "IP number is required",
  IP_ADDRESS_REQUIRED: "IP address is required",
  INVALID_DEPARTMENT: "Invalid department for this role",
  INVALID_LOCATION: "Invalid location",
  MULTIPLE_LOCATIONS_REQUIRED:
    "Multiple locations are required for Super Admin",
  SINGLE_LOCATION_REQUIRED:
    "Only one location can be assigned to Admin (IT Person location is automatically inherited)",
} as const;
