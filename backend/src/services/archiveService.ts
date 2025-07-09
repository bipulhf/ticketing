import { prisma, archivePrisma } from "../config/prisma";
import { ARCHIVE_CONFIG } from "../utils/constants";

export class ArchiveService {
  static async archiveOldTickets() {
    const archiveDate = new Date();
    archiveDate.setMonth(
      archiveDate.getMonth() - ARCHIVE_CONFIG.THRESHOLD_MONTHS
    );

    const oldTickets = await prisma.ticket.findMany({
      where: {
        createdAt: {
          lt: archiveDate,
        },
      },
      include: {
        attachments: true,
      },
    });

    if (oldTickets.length === 0) {
      return { archivedCount: 0 };
    }

    // Move tickets to archive database
    for (const ticket of oldTickets) {
      await archivePrisma.archivedTicket.create({
        data: {
          id: ticket.id,
          description: ticket.description,
          status: ticket.status,
          notes: ticket.notes,
          ip_address: ticket.ip_address,
          device_name: ticket.device_name,
          ip_number: ticket.ip_number,
          createdById: ticket.createdById,
          createdAt: ticket.createdAt,
          updatedAt: ticket.updatedAt,
        },
      });

      // Create archived attachments
      if (ticket.attachments.length > 0) {
        await archivePrisma.archivedAttachment.createMany({
          data: ticket.attachments.map((attachment) => ({
            id: attachment.id,
            name: attachment.name,
            url: attachment.url,
            fileType: attachment.fileType,
            ticketId: attachment.ticketId,
            createdAt: attachment.createdAt,
          })),
        });
      }
    }

    // Delete from main database
    await prisma.ticket.deleteMany({
      where: {
        id: {
          in: oldTickets.map((ticket) => ticket.id),
        },
      },
    });

    return { archivedCount: oldTickets.length };
  }
}
