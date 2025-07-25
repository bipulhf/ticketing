import { Ticket, TicketStatus } from "@prisma/client";
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

export interface CreateTicketRequest {
  description: string;
  attachments?: AttachmentData[];
  ip_address?: string;
  device_name?: string;
  ip_number?: string;
}

export interface UpdateTicketRequest {
  description?: string;
  status?: TicketStatus;
  notes?: string;
  attachments?: AttachmentData[];
  ip_address?: string;
  device_name?: string;
  ip_number?: string;
}

export interface GetTicketsFilters {
  page?: number;
  limit?: number;
  status?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
}

export class TicketService {
  static async createTicket(
    ticketData: CreateTicketRequest,
    createdById: string
  ) {
    const {
      description,
      attachments = [],
      ip_address,
      device_name,
      ip_number,
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
          ip_address: ip_address || null,
          device_name: device_name || null,
          ip_number: ip_number || null,
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

  static async getTicketById(ticketId: string, userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
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

    // Check if user can view this ticket
    const canView = await this.canUserAccessTicket(user.role, userId, ticket);
    if (!canView) {
      throw createError(
        ERROR_MESSAGES.UNAUTHORIZED_ACTION,
        HTTP_STATUS.FORBIDDEN
      );
    }

    return ticket;
  }

  static async updateTicket(
    ticketId: string,
    updateData: UpdateTicketRequest,
    updaterId: string
  ) {
    const {
      description,
      status,
      notes,
      attachments,
      ip_address,
      device_name,
      ip_number,
    } = updateData;

    const user = await prisma.user.findUnique({
      where: { id: updaterId },
      select: { role: true },
    });

    if (!user) {
      throw createError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw createError(ERROR_MESSAGES.TICKET_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Check permissions
    const canUpdate = await this.canUserModifyTicket(
      user.role,
      updaterId,
      ticket,
      status
    );
    if (!canUpdate) {
      throw createError(
        ERROR_MESSAGES.UNAUTHORIZED_ACTION,
        HTTP_STATUS.FORBIDDEN
      );
    }

    // If closing ticket, notes are required
    if (status === TICKET_STATUSES.SOLVED && !notes) {
      throw createError(ERROR_MESSAGES.NOTES_REQUIRED, HTTP_STATUS.BAD_REQUEST);
    }

    // Update ticket
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        ...(description && { description }),
        ...(status && { status }),
        ...(notes && { notes }),
        ...(ip_address !== undefined && { ip_address: ip_address || null }),
        ...(device_name !== undefined && { device_name: device_name || null }),
        ...(ip_number !== undefined && { ip_number: ip_number || null }),
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

    return updatedTicket;
  }

  static async getTickets(userId: string, filters: GetTicketsFilters = {}) {
    const { page = 1, limit = 10, status, fromDate, toDate, search } = filters;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      throw createError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const skip = (page - 1) * limit;

    // Build access filter based on user role and hierarchy
    let where: any = {};
    if (user.role === "user") {
      // Users see only their own tickets
      where.createdById = userId;
    } else {
      // IT persons and above see tickets from users in their hierarchy
      where.createdBy = {
        OR: [
          { systemOwnerId: userId },
          { superAdminId: userId },
          { adminId: userId },
          { itPersonId: userId },
          { id: userId }, // Include their own tickets if they created any
        ],
      };
    }

    // Add status filter
    if (status && status !== "all") {
      where.status = status;
    }

    // Add date range filter
    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) {
        where.createdAt.gte = new Date(fromDate);
      }
      if (toDate) {
        // Add 1 day and subtract 1ms to include the entire toDate day
        const endDate = new Date(toDate);
        endDate.setDate(endDate.getDate() + 1);
        endDate.setMilliseconds(endDate.getMilliseconds() - 1);
        where.createdAt.lte = endDate;
      }
    }

    // Add search filter
    if (search) {
      where.OR = [
        { description: { contains: search, mode: "insensitive" } },
        { id: { contains: search, mode: "insensitive" } },
        {
          createdBy: {
            username: { contains: search, mode: "insensitive" },
          },
        },
        {
          createdBy: {
            email: { contains: search, mode: "insensitive" },
          },
        },
      ];
    }

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
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
      }),
      prisma.ticket.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      tickets,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  private static async canUserAccessTicket(
    userRole: string,
    userId: string,
    ticket: any
  ): Promise<boolean> {
    if (userRole === "user") {
      return ticket.createdById === userId;
    }

    // For IT persons and above, check if the ticket creator is in their hierarchy
    const ticketCreator = await prisma.user.findUnique({
      where: { id: ticket.createdById },
      select: {
        systemOwnerId: true,
        superAdminId: true,
        adminId: true,
        itPersonId: true,
      },
    });

    if (!ticketCreator) {
      return false;
    }

    // Check if current user is in the ticket creator's hierarchy
    return (
      ticketCreator.systemOwnerId === userId ||
      ticketCreator.superAdminId === userId ||
      ticketCreator.adminId === userId ||
      ticketCreator.itPersonId === userId ||
      ticket.createdById === userId // They created the ticket themselves
    );
  }

  private static async canUserModifyTicket(
    userRole: string,
    userId: string,
    ticket: any,
    newStatus?: TicketStatus
  ): Promise<boolean> {
    if (userRole === "user") {
      return ticket.createdById === userId;
    }

    // For ticket closure, only IT persons can close tickets (but need hierarchy check)
    if (newStatus === TICKET_STATUSES.SOLVED) {
      if (userRole !== "it_person") {
        return false;
      }
    }

    // Check if user has access to this ticket through hierarchy
    return await this.canUserAccessTicket(userRole, userId, ticket);
  }
}
