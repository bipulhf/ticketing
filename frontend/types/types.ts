// Enums
export type UserRole =
  | "system_owner"
  | "super_admin"
  | "admin"
  | "it_person"
  | "user";

export type BusinessType =
  | "small_business"
  | "medium_business"
  | "large_business";

export type TicketStatus = "pending" | "solved";

// IT Departments for Admin & IT Person
export type ITDepartment = "it_operations" | "it_qcs";

// User Departments for display/filtering (Normal Users)
export type UserDepartment =
  | "qa"
  | "qc"
  | "production"
  | "microbiology"
  | "hse"
  | "engineering"
  | "marketing"
  | "accounts"
  | "validation"
  | "ppic"
  | "warehouse"
  | "development";

// Locations for all roles
export type Location = "tongi" | "salna" | "mirpur" | "mawna" | "rupganj";

// Core Models
export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  businessType?: BusinessType;
  accountLimit?: number;
  expiryDate?: string; // ISO date-time string
  department?: ITDepartment; // For super_admin, admin, it_person
  locations?: Location[]; // Multiple locations for super_admin
  userLocation?: Location; // Single location for admin, it_person, user
  createdAt: string;
  updatedAt: string;
  createdBy?: User;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  fileType: string;
  ticketId: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  description: string;
  status: TicketStatus;
  notes?: string;
  ip_address: string; // Required: Valid IPv4 format
  device_name: string; // Required: Device name
  ip_number: string; // Required: IP number field
  department: ITDepartment; // Required: IT Operations or IT QCS
  location: Location; // Required: Location for filtering
  user_department?: UserDepartment; // Optional: User's department for display/filtering
  createdById: string;
  createdBy: User;
  // Solver tracking - who solved/closed the ticket
  solvedById?: string;
  solvedBy?: User;
  solvedAt?: string; // ISO date-time string when the ticket was solved
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
}

// Request DTOs
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  businessType?: BusinessType;
  accountLimit?: number;
  expiryDate?: string;
  department?: ITDepartment;
  locations?: Location[];
  userLocation?: Location;
}

export interface TicketAttachmentInput {
  name: string;
  url: string;
  fileType: string;
}

export interface CreateTicketRequest {
  description: string;
  ip_address: string; // Required
  device_name: string; // Required
  ip_number: string; // Required
  department: ITDepartment; // Required
  location: Location; // Required
  user_department?: UserDepartment; // Optional
  attachments?: File[];
}

export interface UpdateTicketRequest {
  description?: string;
  status?: TicketStatus;
  notes?: string;
  ip_address?: string;
  device_name?: string;
  ip_number?: string;
  department?: ITDepartment;
  location?: Location;
  user_department?: UserDepartment;
  attachments?: TicketAttachmentInput[];
}

export interface CloseTicketRequest {
  notes: string;
}

// Generic API Response
export interface ApiResponse {
  success: boolean;
  message: string;
}

// Specific Response Types
export interface AuthResponse extends ApiResponse {
  token: string;
  user: User;
}

export interface TicketResponse extends ApiResponse {
  ticket: Ticket;
}

export interface DashboardMetrics {
  totalUsers: number;
  adminCount: number;
  itPersonCount: number;
  userCount: number;
  ticketStats: {
    totalTickets: number;
    pendingTickets: number;
    solvedTickets: number;
  };
}

export interface AccountInfo {
  businessType: BusinessType;
  accountLimit: number;
  accountUtilization: number;
  remainingSlots: number;
}

export interface ExpiryInfo {
  expiryDate: string;
  daysToExpiry: number;
  isExpired: boolean;
}

export interface ComprehensiveDashboardData {
  userCounts: {
    totalUsers: number;
    adminCount: number;
    itPersonCount: number;
    userCount: number;
  };
  ticketStats: {
    totalTickets: number;
    pendingTickets: number;
    solvedTickets: number;
  };
  accountInfo: AccountInfo;
  expiryInfo: ExpiryInfo;
}

export interface SystemOwnerData {
  superAdminCount?: number;
  expiringTickets?: number;
  systemHealth?: string;
  recentActivities?: Array<{
    id: string;
    action: string;
    timestamp: string;
    user: string;
  }>;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UsersResponse {
  success: boolean;
  message: string;
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  filters: {
    role?: string;
    search?: string;
    isActive?: string;
  };
}

export interface TicketsListResponse extends ApiResponse {
  tickets: Ticket[];
  pagination: PaginationInfo;
}

// Error Handling Response
export interface ErrorData {
  message: string;
  code: string;
  details?: Record<string, any>;
}

export interface ErrorResponse {
  success: false;
  error: ErrorData;
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
}

// Utility types for form handling
export interface DepartmentOption {
  label: string;
  value: ITDepartment | UserDepartment;
}

export interface LocationOption {
  label: string;
  value: Location;
}

// Form types
export interface UserFormValues {
  username: string;
  email: string;
  role: UserRole | "";
  isActive: boolean;
  businessType?: BusinessType;
  expiryDate?: string;
  department?: ITDepartment;
  locations?: Location[];
  userLocation?: Location;
}

// Constants for frontend use
export const IT_DEPARTMENTS: Record<string, ITDepartment> = {
  IT_OPERATIONS: "it_operations",
  IT_QCS: "it_qcs",
} as const;

export const USER_DEPARTMENTS: Record<string, UserDepartment> = {
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

export const LOCATIONS: Record<string, Location> = {
  TONGI: "tongi",
  SALNA: "salna",
  MIRPUR: "mirpur",
  MAWNA: "mawna",
  RUPGANJ: "rupganj",
} as const;
