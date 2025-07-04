import { Response } from "express";
import { UserService, CreateUserRequest } from "../services/userService";
import { asyncHandler } from "../middlewares/errorMiddleware";
import { HTTP_STATUS } from "../utils/constants";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { clonedPrisma } from "../config/prisma";

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

      // Build filter conditions
      const filters: any = {
        createdById: creatorId,
      };

      if (role) {
        filters.role = role;
      }

      if (isActive !== undefined) {
        filters.isActive = isActive === "true";
      }

      if (search) {
        filters.OR = [
          { username: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { deviceName: { contains: search, mode: "insensitive" } },
        ];
      }

      const [users, totalCount] = await Promise.all([
        clonedPrisma().user.findMany({
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
        clonedPrisma().user.count({ where: filters }),
      ]);

      const totalPages = Math.ceil(totalCount / limitNum);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        users,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalCount,
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
}
