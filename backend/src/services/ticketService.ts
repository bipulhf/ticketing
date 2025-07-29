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
  user_department?: UserDepartment;
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
      location,
      user_department,
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
      location: location as string,
      user_department: user_department as string | undefined,
    });

    if (!validation.isValid) {
      throw createError(
        `Validation failed: ${validation.errors.join(", ")}`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Determine the department for the ticket based on user role
    let ticketDepartment = department;
    let ticketUserDepartment = user_department;

    if (user.role === "user") {
      // Normal users inherit department from their IT Person creator
      // The department field should be IT Operations or IT QCS based on issue type
      // user_department is for display/filtering only
      ticketUserDepartment = user_department;
    } else if (user.role === "it_person") {
      // IT Person uses their assigned department
      ticketDepartment = user.department || department;
    }

    // Determine the location for the ticket
    let ticketLocation = location;
    if (user.role === "user") {
      // Normal users inherit location from their IT Person
      ticketLocation = user.userLocation || location;
    } else if (user.role === "it_person") {
      // IT Person uses their assigned location
      ticketLocation = user.userLocation || location;
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
          user_department: ticketUserDepartment || null,
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
        user_department: (updateData.user_department ||
          ticket.user_department) as string | undefined,
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
          ...(updateData.user_department && {
            user_department: updateData.user_department,
          }),
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

    // Add user department filter
    if (department) {
      whereClause.user_department = department;
    }

    // Apply role-based access control
    if (user.role === "system_owner") {
      // System owner can see all tickets
    } else if (user.role === "super_admin") {
      // Super admin can see tickets from their assigned locations
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

    // If closing a ticket, notes are required
    if (newStatus === TICKET_STATUSES.SOLVED && !ticket.notes) {
      throw createError(ERROR_MESSAGES.NOTES_REQUIRED, HTTP_STATUS.BAD_REQUEST);
    }

    return true;
  }
}
