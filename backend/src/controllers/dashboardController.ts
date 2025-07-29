import { Response } from "express";
import { UserService } from "../services/userService";
import { asyncHandler } from "../middlewares/errorMiddleware";
import { HTTP_STATUS } from "../utils/constants";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { prisma } from "../config/prisma";
import { buildDateFilter, buildPrismaDateFilter } from "../utils/filter";

export class DashboardController {
  /**
   * Get dashboard metrics for the authenticated user based on their role
   */
  static getDashboardMetrics = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const userId = req.user?.id || 0;
      const { startDate, endDate } = req.query as {
        startDate?: string;
        endDate?: string;
      };

      if (!userId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: { message: "User not authenticated" },
        });
      }

      const metrics = await UserService.getDashboardMetrics(
        userId,
        startDate,
        endDate
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        metrics,
        filters: {
          startDate: startDate || null,
          endDate: endDate || null,
        },
      });
      return;
    }
  );

  /**
   * Get System Owner specific dashboard
   */
  static getSystemOwnerDashboard = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const userId = req.user?.id || 0;
      const { startDate, endDate } = req.query as {
        startDate?: string;
        endDate?: string;
      };

      if (!userId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: { message: "User not authenticated" },
        });
      }

      if (req.user?.role !== "system_owner") {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          error: { message: "Access denied: System Owner role required" },
        });
      }

      const dateFilter = buildDateFilter(startDate, endDate);
      const dateFilterCondition = buildPrismaDateFilter(dateFilter);

      // Get Super Admin accounts with expiry information
      const superAdmins = await prisma.user.findMany({
        where: {
          role: "super_admin",
          isActive: true,
        },
        select: {
          id: true,
          username: true,
          email: true,
          businessType: true,
          accountLimit: true,
          expiryDate: true,
          locations: true,
          createdAt: true,
          _count: {
            select: {
              createdUsers: {
                where: {
                  isActive: true,
                },
              },
            },
          },
        },
        orderBy: {
          expiryDate: "asc",
        },
      });

      // Calculate expiry status
      const now = new Date();
      const superAdminOverview = superAdmins.map((admin) => ({
        ...admin,
        accountsCreated: admin._count?.createdUsers || 0,
        accountUtilization: admin.accountLimit
          ? Math.round(
              ((admin._count?.createdUsers || 0) / admin.accountLimit) * 100
            )
          : 0,
        expiryStatus: admin.expiryDate
          ? admin.expiryDate > now
            ? "active"
            : "expired"
          : "no_expiry",
        daysToExpiry: admin.expiryDate
          ? Math.ceil(
              (admin.expiryDate.getTime() - now.getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : null,
      }));

      const [totalAccounts, totalTickets, pendingTickets, solvedTickets] =
        await Promise.all([
          prisma.user.count({ where: { isActive: true } }),
          prisma.ticket.count({ where: dateFilterCondition }),
          prisma.ticket.count({
            where: { status: "pending", ...dateFilterCondition },
          }),
          prisma.ticket.count({
            where: { status: "solved", ...dateFilterCondition },
          }),
        ]);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        dashboard: {
          superAdminOverview,
          systemStats: {
            totalAccounts,
            totalSuperAdmins: superAdmins.length,
            totalTickets,
            pendingTickets,
            solvedTickets,
          },
          filters: {
            startDate: startDate || null,
            endDate: endDate || null,
          },
        },
      });
      return;
    }
  );

  /**
   * Get Super Admin specific dashboard - Admin, IT Person, User counts and ticket stats
   */
  static getSuperAdminDashboard = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const userId = req.user?.id || 0;
      const { startDate, endDate } = req.query as {
        startDate?: string;
        endDate?: string;
      };

      if (!userId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: { message: "User not authenticated" },
        });
      }

      // Verify user is super admin or above
      if (!["system_owner", "super_admin"].includes(req.user?.role || "")) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          error: {
            message: "Access denied: Super Admin role or above required",
          },
        });
      }

      const metrics = await UserService.getDashboardMetrics(
        userId,
        startDate,
        endDate
      );

      // Get account utilization for Super Admin
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          accountLimit: true,
          businessType: true,
          expiryDate: true,
        },
      });

      const accountUtilization = user?.accountLimit
        ? Math.round((metrics.totalUsers / user.accountLimit) * 100)
        : 0;

      const expiryInfo = user?.expiryDate
        ? {
            expiryDate: user.expiryDate,
            daysToExpiry: Math.ceil(
              (user.expiryDate.getTime() - new Date().getTime()) /
                (1000 * 60 * 60 * 24)
            ),
            isExpired: user.expiryDate < new Date(),
          }
        : null;

      res.status(HTTP_STATUS.OK).json({
        success: true,
        dashboard: {
          userCounts: {
            totalUsers: metrics.totalUsers,
            adminCount: metrics.adminCount,
            itPersonCount: metrics.itPersonCount,
            userCount: metrics.userCount,
          },
          ticketStats: metrics.ticketStats,
          accountInfo: {
            businessType: user?.businessType,
            accountLimit: user?.accountLimit,
            accountUtilization,
            remainingSlots: user?.accountLimit
              ? user.accountLimit - metrics.totalUsers
              : null,
          },
          expiryInfo,
          filters: {
            startDate: startDate || null,
            endDate: endDate || null,
          },
        },
      });
      return;
    }
  );

  /**
   * Get Admin specific dashboard - IT Person and User tracking with ticket management
   */
  static getAdminDashboard = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const userId = req.user?.id || 0;
      const { startDate, endDate } = req.query as {
        startDate?: string;
        endDate?: string;
      };

      if (!userId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: { message: "User not authenticated" },
        });
      }

      // Verify user is admin or above
      if (
        !["system_owner", "super_admin", "admin"].includes(req.user?.role || "")
      ) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          error: { message: "Access denied: Admin role or above required" },
        });
      }

      const metrics = await UserService.getDashboardMetrics(
        userId,
        startDate,
        endDate
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        dashboard: {
          userCounts: {
            totalUsers: metrics.totalUsers,
            itPersonCount: metrics.itPersonCount,
            userCount: metrics.userCount,
          },
          ticketStats: metrics.ticketStats,
          filters: {
            startDate: startDate || null,
            endDate: endDate || null,
          },
        },
      });
      return;
    }
  );

  /**
   * Get IT Person dashboard - User management and ticket assignment overview
   */
  static getItPersonDashboard = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const userId = req.user?.id || 0;
      const { startDate, endDate } = req.query as {
        startDate?: string;
        endDate?: string;
      };

      if (!userId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: { message: "User not authenticated" },
        });
      }

      // Verify user is IT person or above
      if (
        !["system_owner", "super_admin", "admin", "it_person"].includes(
          req.user?.role || ""
        )
      ) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          error: { message: "Access denied: IT Person role or above required" },
        });
      }

      const metrics = await UserService.getDashboardMetrics(
        userId,
        startDate,
        endDate
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        dashboard: {
          userCounts: {
            totalUsers: metrics.totalUsers,
            userCount: metrics.userCount,
          },
          ticketStats: metrics.ticketStats,
          filters: {
            startDate: startDate || null,
            endDate: endDate || null,
          },
        },
      });
      return;
    }
  );
}
