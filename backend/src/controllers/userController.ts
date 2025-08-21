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
      const creatorId = req.user?.id || 0;

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
      const creatorId = req.user?.id || 0;

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
      const creatorId = req.user?.id || 0;

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
      const creatorId = req.user?.id || 0;

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
      const creatorId = req.user?.id || 0;

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
      const id = parseInt(req.params.id || "0");

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
      const creatorId = req.user?.id || 0;
      const {
        page = "1",
        limit = "10",
        role,
        search,
        isActive,
        department,
        location,
      } = req.query as {
        page?: string;
        limit?: string;
        role?: string;
        search?: string;
        isActive?: string;
        department?: string;
        location?: string;
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

      // Get the current user's information to determine their role and management permissions
      const currentUser = await prisma.user.findUnique({
        where: { id: creatorId },
        select: { role: true },
      });

      if (!currentUser) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: { message: "User not found" },
        });
      }

      // Build base hierarchy filter
      const hierarchyFilter: any = {
        OR: [
          { systemOwnerId: creatorId },
          { superAdminId: creatorId },
          { adminId: creatorId },
          { itPersonId: creatorId },
        ],
      };

      // Apply role-based restrictions based on management permissions
      const roleRestrictions: any = [];

      // System Owner can see all roles
      if (currentUser.role === "system_owner") {
        roleRestrictions.push(
          { role: "super_admin" },
          { role: "admin" },
          { role: "it_person" },
          { role: "user" }
        );
      }
      // Super Admin can see admin, it_person, user
      else if (currentUser.role === "super_admin") {
        roleRestrictions.push(
          { role: "admin" },
          { role: "it_person" },
          { role: "user" }
        );
      }
      // Admin can see it_person, user
      else if (currentUser.role === "admin") {
        roleRestrictions.push({ role: "it_person" }, { role: "user" });
      }
      // IT Person can see user
      else if (currentUser.role === "it_person") {
        roleRestrictions.push({ role: "user" });
      }
      // User cannot see other users
      else if (currentUser.role === "user") {
        roleRestrictions.push(
          { role: "user" } // Only themselves
        );
        // For users, restrict to only see themselves
        hierarchyFilter.OR = [{ id: creatorId }];
      }

      const filters: any = {
        AND: [hierarchyFilter, { OR: roleRestrictions }],
      };

      if (role) {
        filters.AND.push({ role });
      }

      if (isActive !== undefined) {
        filters.AND.push({ isActive: isActive === "true" });
      }

      if (department && department !== "all") {
        filters.AND.push({ department });
      }

      if (location && location !== "all") {
        filters.AND.push({ userLocation: location });
      }

      if (search) {
        // Add search filter to the existing AND conditions
        const searchFilter = {
          OR: [
            { username: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        };
        filters.AND.push(searchFilter);
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
            locations: true,
            userLocation: true,
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
          department: department || null,
          location: location || null,
        },
      });
      return;
    }
  );

  static getAllUsersByType = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
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
      const id = parseInt(req.params.id || "0");
      const updaterId = req.user?.id || 0;

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
      const id = parseInt(req.params.id || "0");
      const deleterId = req.user?.id || 0;

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
      const userId = req.user?.id || 0;

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
      const userId = req.user?.id || 0;

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

  static resetUserPassword = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const userId = parseInt(req.params.id || "0");
      const resetterId = req.user?.id || 0;

      if (!resetterId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: { message: "User not authenticated" },
        });
      }

      if (!userId) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: { message: "User ID is required" },
        });
      }

      const user = await UserService.resetUserPassword(userId, resetterId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        user,
        message: "Password reset successfully to default password",
      });
      return;
    }
  );

  static getAvailableLocations = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const userId = req.user?.id || 0;

      if (!userId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: { message: "User not authenticated" },
        });
      }

      const availableLocations = await UserService.getAvailableLocations(
        userId
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: availableLocations,
      });
      return;
    }
  );

  static getAvailableDepartments = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const userId = req.user?.id || 0;

      if (!userId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: { message: "User not authenticated" },
        });
      }

      const availableDepartments = await UserService.getAvailableDepartments(
        userId
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: availableDepartments,
      });
      return;
    }
  );
}
