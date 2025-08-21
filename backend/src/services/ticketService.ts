import {
  Ticket,
  TicketStatus,
  ITDepartment,
  UserDepartment,
  Location,
} from "@prisma/client";
import { prisma } from "../config/prisma";
import { createError } from "../middlewares/errorMiddleware";
import {
  HTTP_STATUS,
  ERROR_MESSAGES,
  TICKET_STATUSES,
} from "../utils/constants";
import {
  AttachmentData,
  sanitizeAttachmentData,
} from "../middlewares/attachmentMiddleware";
import { validateTicketRequiredFields } from "../utils/validation";
import {
  buildDateFilter,
  buildPrismaDateFilter,
  buildPaginationFilter,
  calculatePaginationInfo,
} from "../utils/filter";
import { LOCATIONS, IT_DEPARTMENTS } from "../utils/constants";

export interface CreateTicketRequest {
  description: string;
  attachments?: AttachmentData[];
  ip_address: string;
  device_name: string;
  ip_number: string;
  department: ITDepartment;
  location: Location;
  user_department?: UserDepartment;
}

export interface UpdateTicketRequest {
  description?: string;
  status?: TicketStatus;
  notes?: string;
  attachments?: AttachmentData[];
  ip_address?: string;
  device_name?: string;
  ip_number?: string;
  department?: ITDepartment;
  location?: Location;
}

export interface GetTicketsFilters {
  page?: number;
  limit?: number;
  status?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
  department?: string;
  location?: string;
}

export class TicketService {
  static async createTicket(
    ticketData: CreateTicketRequest,
    createdById: number
  ) {
    const {
      description,
      attachments = [],
      ip_address,
      device_name,
      ip_number,
      department,
    } = ticketData;

    // Validate that the user exists and can create tickets
    const user = await prisma.user.findUnique({
      where: { id: createdById },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        department: true,
        locations: true,
        userLocation: true,
      },
    });

    if (!user || !user.isActive) {
      throw createError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Check if user role can create tickets (user and it_person can create tickets)
    if (!["user", "it_person"].includes(user.role)) {
      throw createError(
        ERROR_MESSAGES.UNAUTHORIZED_ACTION,
        HTTP_STATUS.FORBIDDEN
      );
    }

    // Validate required fields
    const validation = validateTicketRequiredFields({
      ip_address,
      device_name,
      ip_number,
      department: department as string,
      location: user.userLocation as string,
    });

    if (!validation.isValid) {
      throw createError(
        `Validation failed: ${validation.errors.join(", ")}`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Determine the department for the ticket based on user role
    let ticketDepartment = department;

    // Determine the location for the ticket
    let ticketLocation = user.userLocation;
    if (user.role === "user") {
      // Normal users inherit location from their IT Person
      ticketLocation = user.userLocation || user.userLocation;
    } else if (user.role === "it_person") {
      // IT Person uses their assigned location
      ticketLocation = user.userLocation || user.userLocation;
    }

    // Sanitize attachment data
    const sanitizedAttachments =
      attachments.length > 0 ? sanitizeAttachmentData(attachments) : [];

    // Create ticket with attachments in a transaction
    const ticket = await prisma.$transaction(async (tx) => {
      const newTicket = await tx.ticket.create({
        data: {
          description,
          createdById,
          status: TICKET_STATUSES.PENDING,
          ip_address,
          device_name,
          ip_number,
          department: ticketDepartment,
          location: ticketLocation,
        },
        include: {
          createdBy: {
            select: {
              id: true,
              username: true,
              email: true,
              role: true,
            },
          },
          attachments: true,
        },
      });

      // Create attachments if provided
      if (sanitizedAttachments.length > 0) {
        await tx.attachment.createMany({
          data: sanitizedAttachments.map((attachment) => ({
            name: attachment.name,
            url: attachment.url,
            fileType: attachment.fileType || null,
            ticketId: newTicket.id,
          })),
        });

        // Fetch the ticket with attachments
        return await tx.ticket.findUnique({
          where: { id: newTicket.id },
          include: {
            createdBy: {
              select: {
                id: true,
                username: true,
                email: true,
                role: true,
              },
            },
            attachments: true,
          },
        });
      }

      return newTicket;
    });

    return ticket;
  }

  static async getTicketById(ticketId: number, userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        department: true,
        locations: true,
        userLocation: true,
      },
    });

    if (!user) {
      throw createError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
          },
        },
        attachments: true,
      },
    });

    if (!ticket) {
      throw createError(ERROR_MESSAGES.TICKET_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Check if user can access this ticket based on location and role
    const canAccess = await this.canUserAccessTicket(
      user.role,
      userId,
      ticket,
      user
    );

    if (!canAccess) {
      throw createError(
        ERROR_MESSAGES.UNAUTHORIZED_ACTION,
        HTTP_STATUS.FORBIDDEN
      );
    }

    return ticket;
  }

  static async updateTicket(
    ticketId: number,
    updateData: UpdateTicketRequest,
    updaterId: number
  ) {
    const user = await prisma.user.findUnique({
      where: { id: updaterId },
      select: {
        role: true,
        department: true,
        locations: true,
        userLocation: true,
      },
    });

    if (!user) {
      throw createError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
          },
        },
        attachments: true,
      },
    });

    if (!ticket) {
      throw createError(ERROR_MESSAGES.TICKET_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Check if user can modify this ticket
    const canModify = await this.canUserModifyTicket(
      user.role,
      updaterId,
      ticket,
      updateData.status,
      user
    );

    if (!canModify) {
      throw createError(
        ERROR_MESSAGES.UNAUTHORIZED_ACTION,
        HTTP_STATUS.FORBIDDEN
      );
    }

    // Validate required fields if they are being updated
    if (
      updateData.ip_address ||
      updateData.device_name ||
      updateData.ip_number ||
      updateData.department ||
      updateData.location
    ) {
      const validation = validateTicketRequiredFields({
        ip_address: updateData.ip_address || ticket.ip_address || "",
        device_name: updateData.device_name || ticket.device_name || "",
        ip_number: updateData.ip_number || ticket.ip_number || "",
        department: (updateData.department || ticket.department) as string,
        location: (updateData.location || ticket.location) as string,
      });

      if (!validation.isValid) {
        throw createError(
          `Validation failed: ${validation.errors.join(", ")}`,
          HTTP_STATUS.BAD_REQUEST
        );
      }
    }

    // Sanitize attachment data if provided
    const sanitizedAttachments = updateData.attachments
      ? sanitizeAttachmentData(updateData.attachments)
      : [];

    // Update ticket
    const updatedTicket = await prisma.$transaction(async (tx) => {
      const updated = await tx.ticket.update({
        where: { id: ticketId },
        data: {
          ...(updateData.description && {
            description: updateData.description,
          }),
          ...(updateData.status && { status: updateData.status }),
          ...(updateData.notes && { notes: updateData.notes }),
          ...(updateData.ip_address && { ip_address: updateData.ip_address }),
          ...(updateData.device_name && {
            device_name: updateData.device_name,
          }),
          ...(updateData.ip_number && { ip_number: updateData.ip_number }),
          ...(updateData.department && { department: updateData.department }),
          ...(updateData.location && { location: updateData.location }),
        },
        include: {
          createdBy: {
            select: {
              id: true,
              username: true,
              email: true,
              role: true,
            },
          },
          attachments: true,
        },
      });

      // Create new attachments if provided
      if (sanitizedAttachments.length > 0) {
        await tx.attachment.createMany({
          data: sanitizedAttachments.map((attachment) => ({
            name: attachment.name,
            url: attachment.url,
            fileType: attachment.fileType || null,
            ticketId: ticketId,
          })),
        });

        // Fetch the updated ticket with all attachments
        return await tx.ticket.findUnique({
          where: { id: ticketId },
          include: {
            createdBy: {
              select: {
                id: true,
                username: true,
                email: true,
                role: true,
              },
            },
            attachments: true,
          },
        });
      }

      return updated;
    });

    return updatedTicket;
  }

  static async getTickets(userId: number, filters: GetTicketsFilters = {}) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        department: true,
        locations: true,
        userLocation: true,
      },
    });

    if (!user) {
      throw createError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const {
      page = 1,
      limit = 10,
      status,
      fromDate,
      toDate,
      search,
      department,
      location,
    } = filters;

    // Build where clause based on user role and access permissions
    const whereClause: any = {};

    // Add status filter
    if (status) {
      whereClause.status = status;
    }

    // Add date filters
    if (fromDate || toDate) {
      const dateFilter = buildDateFilter(fromDate, toDate);
      if (dateFilter) {
        whereClause.createdAt = buildPrismaDateFilter(dateFilter);
      }
    }

    // Add search filter
    if (search) {
      whereClause.OR = [
        { description: { contains: search, mode: "insensitive" } },
        { device_name: { contains: search, mode: "insensitive" } },
        { ip_address: { contains: search, mode: "insensitive" } },
        { ip_number: { contains: search, mode: "insensitive" } },
      ];
    }

    // Add location filter
    if (location) {
      whereClause.location = location;
    }
    // Apply role-based access control
    if (user.role === "system_owner") {
      // System owner can see all tickets
    } else if (user.role === "super_admin") {
      // Super admin can see tickets from their assigned department and locations
      if (user.department) {
        whereClause.department = user.department;
      }
      if (user.locations && user.locations.length > 0) {
        whereClause.location = { in: user.locations };
      }
    } else if (user.role === "admin") {
      // Admin can see tickets from their assigned location and department
      if (user.userLocation) {
        whereClause.location = user.userLocation;
      }
      if (user.department) {
        whereClause.department = user.department;
      }
    } else if (user.role === "it_person") {
      // IT Person can see tickets from their assigned location and department
      if (user.userLocation) {
        whereClause.location = user.userLocation;
      }
      if (user.department) {
        whereClause.department = user.department;
      }
    } else if (user.role === "user") {
      // Normal users can only see their own tickets
      whereClause.createdById = userId;
    }

    // Get total count for pagination
    const totalTickets = await prisma.ticket.count({ where: whereClause });

    // Get tickets with pagination
    const tickets = await prisma.ticket.findMany({
      where: whereClause,
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
          },
        },
        attachments: true,
      },
      orderBy: { createdAt: "desc" },
      ...buildPaginationFilter(page, limit),
    });

    const pagination = calculatePaginationInfo(totalTickets, page, limit);

    return {
      tickets,
      pagination,
    };
  }

  static async getSearchOptions(userId: number): Promise<{
    locations: Location[];
    departments: ITDepartment[];
    canSearchByDepartment: boolean;
    canSearchByLocation: boolean;
  }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        locations: true,
        userLocation: true,
        department: true,
      },
    });

    if (!user) {
      throw createError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Only super_admin and system_owner can search by department and location
    const canSearchByDepartment = ["system_owner", "super_admin"].includes(
      user.role
    );
    const canSearchByLocation = ["system_owner", "super_admin"].includes(
      user.role
    );

    if (!canSearchByDepartment && !canSearchByLocation) {
      return {
        locations: [],
        departments: [],
        canSearchByDepartment: false,
        canSearchByLocation: false,
      };
    }

    let locations: Location[] = [];
    let departments: ITDepartment[] = [];

    if (user.role === "system_owner") {
      // System owner can search by all locations and departments
      locations = Object.values(LOCATIONS);
      departments = Object.values(IT_DEPARTMENTS);
    } else if (user.role === "super_admin") {
      // Super admin can search by their assigned locations and departments
      if (user.locations && user.locations.length > 0) {
        locations = user.locations;
      }
      if (user.department) {
        departments = [user.department];
      }
    }

    return {
      locations,
      departments,
      canSearchByDepartment,
      canSearchByLocation,
    };
  }

  private static async canUserAccessTicket(
    userRole: string,
    userId: number,
    ticket: any,
    user: any
  ): Promise<boolean> {
    // System owner can access all tickets
    if (userRole === "system_owner") return true;

    // Super admin can access tickets from their assigned locations
    if (userRole === "super_admin") {
      return user.locations && user.locations.includes(ticket.location);
    }

    // Admin can access tickets from their assigned location and department
    if (userRole === "admin") {
      return (
        user.userLocation === ticket.location &&
        user.department === ticket.department
      );
    }

    // IT Person can access tickets from their assigned location and department
    if (userRole === "it_person") {
      return (
        user.userLocation === ticket.location &&
        user.department === ticket.department
      );
    }

    // Normal users can only access their own tickets
    if (userRole === "user") {
      return ticket.createdById === userId;
    }

    return false;
  }

  private static async canUserModifyTicket(
    userRole: string,
    userId: number,
    ticket: any,
    newStatus?: TicketStatus,
    user?: any
  ): Promise<boolean> {
    // Check if user can access the ticket first
    const canAccess = await this.canUserAccessTicket(
      userRole,
      userId,
      ticket,
      user
    );
    if (!canAccess) return false;

    // Only IT Person and above can modify tickets
    if (
      !["it_person", "admin", "super_admin", "system_owner"].includes(userRole)
    ) {
      return false;
    }

    return true;
  }
}
