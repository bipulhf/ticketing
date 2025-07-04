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

export const RATE_LIMIT_CONFIG = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100,
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
} as const;
