import { Response } from "express";
import { UserService, CreateUserRequest } from "../services/userService";
import { asyncHandler } from "../middlewares/errorMiddleware";
import { HTTP_STATUS } from "../utils/constants";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { prisma } from "../config/prisma";

export class UserController {
  static createSuperAdmin = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const userData: CreateUserRequest = {
        ...req.body,
        role: "super_admin",
      };
      const creatorId = req.user?.id;

      if (!creatorId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: { message: "User not authenticated" },
        });
      }

      const user = await UserService.createUserWithValidation(
        userData,
        creatorId
      );

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        user,
        message: "Super Admin created successfully",
      });
      return;
    }
  );

  static createAdmin = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const userData: CreateUserRequest = {
        ...req.body,
        role: "admin",
      };
      const creatorId = req.user?.id;

      if (!creatorId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: { message: "User not authenticated" },
        });
      }

      const user = await UserService.createUserWithValidation(
        userData,
        creatorId
      );

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        user,
        message: "Admin created successfully",
      });
      return;
    }
  );

  static createItPerson = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const userData: CreateUserRequest = {
        ...req.body,
        role: "it_person",
      };
      const creatorId = req.user?.id;

      if (!creatorId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: { message: "User not authenticated" },
        });
      }

      const user = await UserService.createUserWithValidation(
        userData,
        creatorId
      );

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        user,
        message: "IT Person created successfully",
      });
      return;
    }
  );

  static createUser = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const userData: CreateUserRequest = {
        ...req.body,
        role: "user",
      };
      const creatorId = req.user?.id;

      if (!creatorId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: { message: "User not authenticated" },
        });
      }

      const user = await UserService.createUserWithValidation(
        userData,
        creatorId
      );

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        user,
        message: "User created successfully",
      });
      return;
    }
  );

  static getUsersByCreator = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const creatorId = req.user?.id;

      if (!creatorId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: { message: "User not authenticated" },
        });
      }

      const users = await UserService.getUsersByCreator(creatorId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        users,
      });
      return;
    }
  );

  static getUser = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { id } = req.params;

      const user = await UserService.getUser(id!);

      if (!user) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: { message: "User not found" },
        });
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        user,
      });
      return;
    }
  );

  static getMyUsers = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const creatorId = req.user?.id;
      const {
        page = "1",
        limit = "10",
        role,
        search,
        isActive,
      } = req.query as {
        page?: string;
        limit?: string;
        role?: string;
        search?: string;
        isActive?: string;
      };

      if (!creatorId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: { message: "User not authenticated" },
        });
      }

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const offset = (pageNum - 1) * limitNum;

      // Build filter conditions to include all users in the hierarchy
      const filters: any = {
        OR: [
          { systemOwnerId: creatorId },
          { superAdminId: creatorId },
          { adminId: creatorId },
          { itPersonId: creatorId },
        ],
      };

      if (role) {
        filters.role = role;
      }

      if (isActive !== undefined) {
        filters.isActive = isActive === "true";
      }

      if (search) {
        // Combine search with the hierarchy filter
        const searchFilter = {
          OR: [
            { username: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        };
        filters.AND = [{ OR: filters.OR }, searchFilter];
        delete filters.OR;
      }

      const [users, totalCount] = await Promise.all([
        prisma.user.findMany({
          where: filters,
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
            isActive: true,
            businessType: true,
            accountLimit: true,
            expiryDate: true,
            location: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { createdAt: "desc" },
          skip: offset,
          take: limitNum,
        }),
        prisma.user.count({ where: filters }),
      ]);

      const totalPages = Math.ceil(totalCount / limitNum);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        users,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalCount,
          totalPages,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
        filters: {
          role: role || null,
          search: search || null,
          isActive: isActive || null,
        },
      });
      return;
    }
  );

  static getAllUsersByType = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      console.log("Working");
      const { page = "1", limit = "10" } = req.query as {
        page?: string;
        limit?: string;
      };

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      // Validate pagination parameters
      if (isNaN(pageNum) || pageNum < 1) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: { message: "Invalid page number" },
        });
      }

      if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: { message: "Invalid limit. Must be between 1 and 100" },
        });
      }

      const data = await UserService.getAllUsersByType(pageNum, limitNum);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data,
        message: "Users retrieved successfully by type",
      });
      return;
    }
  );

  static updateUser = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { id } = req.params;
      const updaterId = req.user?.id;

      if (!updaterId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: { message: "User not authenticated" },
        });
      }

      const user = await UserService.updateUser(id!, req.body, updaterId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        user,
        message: "User updated successfully",
      });
      return;
    }
  );

  static deleteUser = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { id } = req.params;
      const deleterId = req.user?.id;

      if (!deleterId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: { message: "User not authenticated" },
        });
      }

      await UserService.deleteUser(id!, deleterId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "User deleted successfully",
      });
      return;
    }
  );

  static updateSelfProfile = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: { message: "User not authenticated" },
        });
      }

      const { username, email, location } = req.body;

      const user = await UserService.updateSelfProfile(userId, {
        username,
        email,
        location,
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        user,
        message: "Profile updated successfully",
      });
      return;
    }
  );

  static updateSelfPassword = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: { message: "User not authenticated" },
        });
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: { message: "Current password and new password are required" },
        });
      }

      const user = await UserService.updateSelfPassword(
        userId,
        currentPassword,
        newPassword
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Password updated successfully",
      });
      return;
    }
  );
}
