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
  location?: string;
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
  createdById: string;
  createdBy: User;
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
  location?: string;
}

export interface TicketAttachmentInput {
  name: string;
  url: string;
  fileType: string;
}

export interface CreateTicketRequest {
  description: string;
  attachments?: TicketAttachmentInput[];
}

export interface UpdateTicketRequest {
  description?: string;
  status?: TicketStatus;
  notes?: string;
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
