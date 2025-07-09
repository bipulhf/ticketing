import { User, UserRole, BusinessType } from "@prisma/client";
import { prisma } from "../config/prisma";
import { hashPassword } from "../utils/password";
import { createError } from "../middlewares/errorMiddleware";
import {
  HTTP_STATUS,
  ERROR_MESSAGES,
  ACCOUNT_LIMITS,
} from "../utils/constants";
import { canCreateAccount, canManageUser } from "../middlewares/roleMiddleware";
import {
  buildDateFilter,
  buildPrismaDateFilter,
  buildPaginationFilter,
  calculatePaginationInfo,
} from "../utils/filter";

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  businessType?: BusinessType;
  accountLimit?: number;
  expiryDate?: Date;
  location?: string;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  businessType?: BusinessType;
  accountLimit?: number;
  expiryDate?: Date;
  location?: string;
  isActive?: boolean;
}

export interface DashboardMetrics {
  totalUsers: number;
  adminCount: number;
  itPersonCount: number;
  userCount: number;
  superAdminCount?: number;
  ticketStats: {
    totalTickets: number;
    pendingTickets: number;
    solvedTickets: number;
  };
}

export class UserService {
  static async createUserWithValidation(
    userData: CreateUserRequest,
    creatorId: string
  ): Promise<User> {
    // Get creator information to validate permissions and limits
    const creator = await prisma.user.findUnique({
      where: { id: creatorId },
      select: {
        id: true,
        role: true,
        accountLimit: true,
        businessType: true,
        isActive: true,
        expiryDate: true,
      },
    });

    if (!creator) {
      throw createError("Creator not found", HTTP_STATUS.NOT_FOUND);
    }

    // Check if creator account is active
    if (!creator.isActive) {
      throw createError("Creator account is inactive", HTTP_STATUS.FORBIDDEN);
    }

    // Check if creator account has expired (for super_admin)
    if (
      creator.role === "super_admin" &&
      creator.expiryDate &&
      new Date() > creator.expiryDate
    ) {
      throw createError("Creator account has expired", HTTP_STATUS.FORBIDDEN);
    }

    // Validate role hierarchy permissions
    const canCreate = canCreateAccount(creator.role, userData.role);
    if (!canCreate) {
      throw createError(
        `${creator.role} cannot create ${userData.role} accounts`,
        HTTP_STATUS.FORBIDDEN
      );
    }

    // Check account limits for super_admin creating accounts
    if (creator.role === "super_admin" && creator.accountLimit) {
      const createdUsersCount = await prisma.user.count({
        where: {
          createdById: creatorId,
          isActive: true,
        },
      });

      if (createdUsersCount >= creator.accountLimit) {
        const businessType = creator.businessType || "unknown";
        throw createError(
          `Account creation limit exceeded. ${businessType} accounts are limited to ${creator.accountLimit} users.`,
          HTTP_STATUS.FORBIDDEN
        );
      }
    }

    // For super_admin creation, validate business type and set account limits
    if (userData.role === "super_admin") {
      if (!userData.businessType) {
        throw createError(
          "Business type is required for Super Admin accounts",
          HTTP_STATUS.BAD_REQUEST
        );
      }
      if (!userData.location) {
        throw createError(
          "Location is required for Super Admin accounts",
          HTTP_STATUS.BAD_REQUEST
        );
      }
      // Set account limit based on business type
      userData.accountLimit = ACCOUNT_LIMITS[userData.businessType];
    }

    return this.createUser(userData, creatorId);
  }

  static async createUser(
    userData: CreateUserRequest,
    creatorId: string
  ): Promise<User> {
    // Check if username or email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username: userData.username }, { email: userData.email }],
      },
    });

    if (existingUser) {
      throw createError(
        "Username or email already exists",
        HTTP_STATUS.CONFLICT
      );
    }

    // Get creator information to determine hierarchy relationships
    const creator = await prisma.user.findUnique({
      where: { id: creatorId },
      select: {
        id: true,
        role: true,
        systemOwnerId: true,
        superAdminId: true,
        adminId: true,
        itPersonId: true,
      },
    });

    if (!creator) {
      throw createError("Creator not found", HTTP_STATUS.NOT_FOUND);
    }

    // Hash password
    const hashedPassword = await hashPassword(userData.password);

    // Set account limits for super admin
    let accountLimit = userData.accountLimit;
    if (userData.role === "super_admin" && userData.businessType) {
      accountLimit = ACCOUNT_LIMITS[userData.businessType];
    }

    // Determine hierarchy field values based on creator's role
    let hierarchyFields: {
      systemOwnerId?: string;
      superAdminId?: string;
      adminId?: string;
      itPersonId?: string;
    } = {};

    // Set hierarchy based on who is creating the user
    switch (creator.role) {
      case "system_owner":
        hierarchyFields.systemOwnerId = creator.id;
        break;
      case "super_admin":
        hierarchyFields.superAdminId = creator.id;
        // Inherit system owner from creator if they have one
        if (creator.systemOwnerId) {
          hierarchyFields.systemOwnerId = creator.systemOwnerId;
        }
        break;
      case "admin":
        hierarchyFields.adminId = creator.id;
        // Inherit higher hierarchy from creator
        if (creator.superAdminId) {
          hierarchyFields.superAdminId = creator.superAdminId;
        }
        if (creator.systemOwnerId) {
          hierarchyFields.systemOwnerId = creator.systemOwnerId;
        }
        break;
      case "it_person":
        hierarchyFields.itPersonId = creator.id;
        // Inherit higher hierarchy from creator
        if (creator.adminId) {
          hierarchyFields.adminId = creator.adminId;
        }
        if (creator.superAdminId) {
          hierarchyFields.superAdminId = creator.superAdminId;
        }
        if (creator.systemOwnerId) {
          hierarchyFields.systemOwnerId = creator.systemOwnerId;
        }
        break;
    }

    // Create user
    const newUser = await prisma.user.create({
      data: {
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
        businessType: userData.businessType || null,
        accountLimit: accountLimit || null,
        expiryDate: userData.expiryDate || null,
        location: userData.location || null,
        createdById: creatorId || null,
        isActive: true,
        ...hierarchyFields,
      },
    });

    return newUser;
  }

  static async updateUser(
    userId: string,
    updateData: UpdateUserRequest,
    updaterId: string
  ): Promise<User> {
    const updater = await prisma.user.findUnique({
      where: { id: updaterId },
      select: { role: true },
    });

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!updater || !targetUser) {
      throw createError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Check if updater can manage target user
    if (!canManageUser(updater.role, targetUser.role) && updaterId !== userId) {
      throw createError(
        ERROR_MESSAGES.UNAUTHORIZED_ACTION,
        HTTP_STATUS.FORBIDDEN
      );
    }

    // If updating business type, update account limit
    let accountLimit = updateData.accountLimit;
    if (updateData.businessType && targetUser.role === "super_admin") {
      accountLimit = ACCOUNT_LIMITS[updateData.businessType];
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(updateData.username && { username: updateData.username }),
        ...(updateData.email && { email: updateData.email }),
        ...(updateData.businessType && {
          businessType: updateData.businessType,
        }),
        ...(accountLimit && { accountLimit }),
        ...(updateData.expiryDate && { expiryDate: updateData.expiryDate }),
        ...(updateData.location && { location: updateData.location }),
        ...(updateData.isActive !== undefined && {
          isActive: updateData.isActive,
        }),
      },
    });

    return updatedUser;
  }

  static async deleteUser(userId: string, deleterId: string): Promise<void> {
    const deleter = await prisma.user.findUnique({
      where: { id: deleterId },
      select: { role: true },
    });

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!deleter || !targetUser) {
      throw createError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Check if deleter can manage target user
    if (!canManageUser(deleter.role, targetUser.role)) {
      throw createError(
        ERROR_MESSAGES.UNAUTHORIZED_ACTION,
        HTTP_STATUS.FORBIDDEN
      );
    }

    // Soft delete by setting isActive to false
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });
  }

  static async getUsersByCreator(
    creatorId: string,
    page: number = 1,
    limit: number = 10
  ) {
    const { skip, take } = buildPaginationFilter(page, limit);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: { createdById: creatorId, isActive: true },
        skip,
        take,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          businessType: true,
          accountLimit: true,
          expiryDate: true,
          location: true,
          createdAt: true,
          isActive: true,
        },
      }),
      prisma.user.count({
        where: { createdById: creatorId, isActive: true },
      }),
    ]);

    const pagination = calculatePaginationInfo(total, page, limit);

    return {
      users,
      pagination,
    };
  }

  static async getDashboardMetrics(
    userId: string,
    startDate?: string,
    endDate?: string
  ): Promise<DashboardMetrics> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      throw createError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const dateFilter = buildDateFilter(startDate, endDate);
    const dateFilterCondition = buildPrismaDateFilter(dateFilter);

    // Build user filter based on hierarchy fields
    const userFilter = {
      OR: [
        { systemOwnerId: userId },
        { superAdminId: userId },
        { adminId: userId },
        { itPersonId: userId },
      ],
    };

    // Get user counts
    const [adminCount, itPersonCount, userCount, superAdminCount] =
      await Promise.all([
        prisma.user.count({
          where: {
            role: "admin",
            isActive: true,
            ...userFilter,
          },
        }),
        prisma.user.count({
          where: {
            role: "it_person",
            isActive: true,
            ...userFilter,
          },
        }),
        prisma.user.count({
          where: {
            role: "user",
            isActive: true,
            ...userFilter,
          },
        }),
        user.role === "system_owner"
          ? prisma.user.count({
              where: {
                role: "super_admin",
                isActive: true,
                systemOwnerId: userId,
              },
            })
          : 0,
      ]);

    // Get ticket stats - tickets from users in the hierarchy
    const [totalTickets, pendingTickets, solvedTickets] = await Promise.all([
      prisma.ticket.count({
        where: {
          ...dateFilterCondition,
          createdBy: userFilter,
        },
      }),
      prisma.ticket.count({
        where: {
          status: "pending",
          ...dateFilterCondition,
          createdBy: userFilter,
        },
      }),
      prisma.ticket.count({
        where: {
          status: "solved",
          ...dateFilterCondition,
          createdBy: userFilter,
        },
      }),
    ]);

    return {
      totalUsers:
        adminCount + itPersonCount + userCount + (superAdminCount || 0),
      adminCount,
      itPersonCount,
      userCount,
      ...(user.role === "system_owner" && { superAdminCount }),
      ticketStats: {
        totalTickets,
        pendingTickets,
        solvedTickets,
      },
    };
  }

  static async getUser(userId: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id: userId },
    });
  }

  static async getUserProfile(userId: string): Promise<Partial<User> | null> {
    return await prisma.user.findUnique({
      where: { id: userId },
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
    });
  }

  static async getAllUsersByType(
    page: number = 1,
    limit: number = 10
  ): Promise<{
    users: Partial<User>[];
    pagination: any;
  }> {
    const { skip, take } = buildPaginationFilter(page, limit);

    // Simple approach: get all users with pagination
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: { isActive: true },
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
          createdBy: {
            select: {
              username: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.user.count({
        where: { isActive: true },
      }),
    ]);

    const pagination = calculatePaginationInfo(total, page, limit);

    return {
      users,
      pagination,
    };
  }

  static async updateSelfProfile(
    userId: string,
    updateData: {
      username?: string;
      email?: string;
      location?: string;
    }
  ): Promise<User> {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw createError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Check if username or email already exists (if being updated)
    if (updateData.username || updateData.email) {
      const conflictConditions = [];

      if (
        updateData.username &&
        updateData.username !== existingUser.username
      ) {
        conflictConditions.push({ username: updateData.username });
      }

      if (updateData.email && updateData.email !== existingUser.email) {
        conflictConditions.push({ email: updateData.email });
      }

      if (conflictConditions.length > 0) {
        const conflictingUser = await prisma.user.findFirst({
          where: {
            OR: conflictConditions,
            NOT: { id: userId },
          },
        });

        if (conflictingUser) {
          throw createError(
            "Username or email already exists",
            HTTP_STATUS.CONFLICT
          );
        }
      }
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(updateData.username && { username: updateData.username }),
        ...(updateData.email && { email: updateData.email }),
        ...(updateData.location && { location: updateData.location }),
        updatedAt: new Date(),
      },
    });

    return updatedUser;
  }

  static async updateSelfPassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<User> {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Verify current password
    const { comparePassword } = await import("../utils/password");
    const isCurrentPasswordValid = await comparePassword(
      currentPassword,
      user.password
    );

    if (!isCurrentPasswordValid) {
      throw createError(
        "Current password is incorrect",
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Validate new password strength
    const { validatePasswordStrength } = await import("../utils/password");
    const passwordValidation = validatePasswordStrength(newPassword);

    if (!passwordValidation.isValid) {
      throw createError(
        `Password validation failed: ${passwordValidation.errors.join(", ")}`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update password
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedNewPassword,
        updatedAt: new Date(),
      },
    });

    return updatedUser;
  }
}
