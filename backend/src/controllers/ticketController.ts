import { Response } from "express";
import {
  TicketService,
  CreateTicketRequest,
  UpdateTicketRequest,
  GetTicketsFilters,
} from "../services/ticketService";
import { asyncHandler } from "../middlewares/errorMiddleware";
import { HTTP_STATUS } from "../utils/constants";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

export class TicketController {
  static createTicket = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const ticketData: CreateTicketRequest = req.body;
      const createdById = req.user?.id || 0;

      if (!createdById) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: { message: "User not authenticated" },
        });
      }

      const ticket = await TicketService.createTicket(ticketData, createdById);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        ticket,
      });
      return;
    }
  );

  static getTicketById = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const id = parseInt(req.params.id || "0");
      const userId = req.user?.id || 0;

      if (!userId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: { message: "User not authenticated" },
        });
      }

      const ticket = await TicketService.getTicketById(id!, userId!);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        ticket,
      });
      return;
    }
  );

  static updateTicket = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const id = parseInt(req.params.id || "0");
      const updateData: UpdateTicketRequest = req.body;
      const updaterId = req.user?.id || 0;

      if (!updaterId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: { message: "User not authenticated" },
        });
      }

      const ticket = await TicketService.updateTicket(
        id!,
        updateData,
        updaterId!
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        ticket,
      });
      return;
    }
  );

  static getTickets = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const userId = req.user?.id || 0;

      if (!userId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: { message: "User not authenticated" },
        });
      }

      const filters: GetTicketsFilters = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        status: req.query.status as string,
        fromDate: req.query.fromDate as string,
        toDate: req.query.toDate as string,
        search: req.query.search as string,
        location: req.query.location as string,
        department: req.query.department as string,
      };

      const result = await TicketService.getTickets(userId!, filters);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        ...result,
      });
      return;
    }
  );

  static closeTicket = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const id = parseInt(req.params.id || "0");
      const { notes } = req.body;
      const updaterId = req.user?.id || 0;

      if (!updaterId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: { message: "User not authenticated" },
        });
      }

      const ticket = await TicketService.updateTicket(
        id!,
        {
          status: "solved",
          notes,
        },
        updaterId!
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        ticket,
        message: "Ticket closed successfully",
      });
      return;
    }
  );

  static reopenTicket = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const id = parseInt(req.params.id || "0");
      const updaterId = req.user?.id || 0;

      if (!updaterId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: { message: "User not authenticated" },
        });
      }

      const ticket = await TicketService.updateTicket(
        id!,
        {
          status: "pending",
        },
        updaterId!
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        ticket,
        message: "Ticket reopened successfully",
      });
      return;
    }
  );
}
