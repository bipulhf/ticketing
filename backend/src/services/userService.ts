import {
  User,
  UserRole,
  BusinessType,
  ITDepartment,
  Location,
} from "@prisma/client";
import { prisma } from "../config/prisma";
import { hashPassword } from "../utils/password";
import { createError } from "../middlewares/errorMiddleware";
import {
  HTTP_STATUS,
  ERROR_MESSAGES,
  ACCOUNT_LIMITS,
  PASSWORD_CONFIG,
  ROLE_HIERARCHY,
  LOCATIONS,
} from "../utils/constants";
import { canCreateAccount, canManageUser } from "../middlewares/roleMiddleware";
import {
  buildDateFilter,
  buildPrismaDateFilter,
  buildPaginationFilter,
  calculatePaginationInfo,
} from "../utils/filter";
import { validateUserCreationData } from "../utils/validation";

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  businessType?: BusinessType;
  accountLimit?: number;
  expiryDate?: Date;
  department?: ITDepartment;
  locations?: Location[];
  userLocation?: Location;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  businessType?: BusinessType;
  accountLimit?: number;
  expiryDate?: Date;
  department?: ITDepartment;
  locations?: Location[];
  userLocation?: Location;
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
        department: true,
        locations: true,
        userLocation: true,
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

    // Apply department and location inheritance based on role hierarchy
    const inheritedData = await this.applyDepartmentLocationInheritance(
      userData,
      creator,
      creatorId
    );

    // Validate the final user data
    const validation = validateUserCreationData(inheritedData, creator.role);
    if (!validation.isValid) {
      throw createError(
        `Validation failed: ${validation.errors.join(", ")}`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // For super_admin creation, validate business type and set account limits
    if (userData.role === "super_admin") {
      if (!userData.businessType) {
        throw createError(
          "Business type is required for Super Admin accounts",
          HTTP_STATUS.BAD_REQUEST
        );
      }
      // Set account limit based on business type
      inheritedData.accountLimit = ACCOUNT_LIMITS[userData.businessType];
    }

    return this.createUser(inheritedData, creatorId);
  }

  private static async applyDepartmentLocationInheritance(
    userData: CreateUserRequest,
    creator: any,
    creatorId: string
  ): Promise<CreateUserRequest> {
    const inheritedData = { ...userData };

    // Apply department inheritance
    if (
      ROLE_HIERARCHY[userData.role as keyof typeof ROLE_HIERARCHY]
        ?.departmentInheritance
    ) {
      if (userData.role === "super_admin") {
        // Super Admin inherits department from System Owner
        inheritedData.department = creator.department;
      } else if (["admin", "it_person"].includes(userData.role)) {
        // Admin and IT Person inherit department from their creator
        inheritedData.department = creator.department;
      }
    }

    // Apply location inheritance - FORCE automatic inheritance for IT persons and users
    if (
      ROLE_HIERARCHY[userData.role as keyof typeof ROLE_HIERARCHY]
        ?.locationInheritance
    ) {
      if (userData.role === "super_admin") {
        // Super Admin inherits multiple locations from System Owner
        inheritedData.locations = creator.locations;
      } else if (["admin", "it_person"].includes(userData.role)) {
        // Admin and IT Person inherit single location from their creator
        // For Super Admin creating Admin/IT Person, assign one of their locations
        if (
          creator.role === "super_admin" &&
          creator.locations &&
          creator.locations.length > 0
        ) {
          inheritedData.userLocation = creator.locations[0]; // Assign first location
        } else {
          inheritedData.userLocation = creator.userLocation;
        }
        // Override any frontend location selection for IT persons
        if (userData.role === "it_person") {
          inheritedData.userLocation = creator.userLocation;
        }
      } else if (userData.role === "user") {
        // Normal users inherit location from IT Person - ALWAYS override frontend selection
        inheritedData.userLocation = creator.userLocation;
      }
    }

    return inheritedData;
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

    // Hash password
    const hashedPassword = await hashPassword(userData.password);

    // Prepare hierarchy tracking data
    const hierarchyData = await this.buildHierarchyData(
      creatorId,
      userData.role
    );

    let admin: {
      userLocation: Location | null;
      department: ITDepartment | null;
    } | null = null;

    let superAdmin: {
      userLocation: Location | null;
      department: ITDepartment | null;
    } | null = null;

    if (hierarchyData.adminId) {
      admin = await prisma.user.findUnique({
        where: { id: hierarchyData.adminId },
        select: { userLocation: true, department: true },
      });
    }

    if (hierarchyData.superAdminId) {
      superAdmin = await prisma.user.findUnique({
        where: { id: hierarchyData.superAdminId },
        select: { userLocation: true, department: true },
      });
    }

    // Create user with department and location data
    const user = await prisma.user.create({
      data: {
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
        businessType: userData.businessType,
        accountLimit: userData.accountLimit,
        expiryDate: userData.expiryDate,
        locations: userData.role === "super_admin" ? userData.locations : [],
        userLocation: admin?.userLocation || userData.userLocation,
        department:
          superAdmin?.department || admin?.department || userData.department,
        createdById: creatorId,
        ...hierarchyData,
      },
    });

    return user;
  }

  private static async buildHierarchyData(
    creatorId: string,
    userRole: UserRole
  ): Promise<any> {
    const creator = await prisma.user.findUnique({
      where: { id: creatorId },
      select: { role: true },
    });

    if (!creator) {
      throw createError("Creator not found", HTTP_STATUS.NOT_FOUND);
    }

    const hierarchyData: any = {};

    // Set hierarchy tracking based on creator role
    switch (creator.role) {
      case "system_owner":
        hierarchyData.systemOwnerId = creatorId;
        break;
      case "super_admin":
        hierarchyData.superAdminId = creatorId;
        // Inherit system owner from creator
        const superAdmin = await prisma.user.findUnique({
          where: { id: creatorId },
          select: { systemOwnerId: true },
        });
        if (superAdmin?.systemOwnerId) {
          hierarchyData.systemOwnerId = superAdmin.systemOwnerId;
        }
        break;
      case "admin":
        hierarchyData.adminId = creatorId;
        // Inherit super admin and system owner from creator
        const admin = await prisma.user.findUnique({
          where: { id: creatorId },
          select: { superAdminId: true, systemOwnerId: true },
        });
        if (admin) {
          hierarchyData.superAdminId = admin.superAdminId;
          hierarchyData.systemOwnerId = admin.systemOwnerId;
        }
        break;
      case "it_person":
        hierarchyData.itPersonId = creatorId;
        // Inherit admin, super admin, and system owner from creator
        const itPerson = await prisma.user.findUnique({
          where: { id: creatorId },
          select: { adminId: true, superAdminId: true, systemOwnerId: true },
        });
        if (itPerson) {
          hierarchyData.adminId = itPerson.adminId;
          hierarchyData.superAdminId = itPerson.superAdminId;
          hierarchyData.systemOwnerId = itPerson.systemOwnerId;
        }
        break;
    }

    return hierarchyData;
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
        ...(updateData.department && { department: updateData.department }),
        ...(updateData.locations && { locations: updateData.locations }),
        ...(updateData.userLocation && {
          userLocation: updateData.userLocation,
        }),
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
          department: true,
          locations: true,
          userLocation: true,
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
        department: true,
        locations: true,
        userLocation: true,
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
          department: true,
          locations: true,
          userLocation: true,
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

  static async resetUserPassword(
    targetUserId: string,
    resetterId: string
  ): Promise<Omit<User, "password">> {
    // Get the resetter information to validate permissions
    const resetter = await prisma.user.findUnique({
      where: { id: resetterId },
      select: {
        id: true,
        role: true,
        isActive: true,
        expiryDate: true,
      },
    });

    if (!resetter) {
      throw createError("Resetter not found", HTTP_STATUS.NOT_FOUND);
    }

    // Check if resetter account is active
    if (!resetter.isActive) {
      throw createError("Resetter account is inactive", HTTP_STATUS.FORBIDDEN);
    }

    // Check if resetter account has expired (for super_admin)
    if (
      resetter.role === "super_admin" &&
      resetter.expiryDate &&
      new Date() > resetter.expiryDate
    ) {
      throw createError("Resetter account has expired", HTTP_STATUS.FORBIDDEN);
    }

    // Get the target user information
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (!targetUser) {
      throw createError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Validate hierarchy permissions - resetter can only reset password for one level below
    const canReset = canManageUser(resetter.role, targetUser.role);
    if (!canReset) {
      throw createError(
        ERROR_MESSAGES.CANNOT_RESET_PASSWORD,
        HTTP_STATUS.FORBIDDEN
      );
    }

    // Hash the default password
    const hashedPassword = await hashPassword(PASSWORD_CONFIG.DEFAULT_PASSWORD);

    // Update the user's password
    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: {
        password: hashedPassword,
        updatedAt: new Date(),
      },
    });

    // Return user without password field
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  static async getAvailableLocations(userId: string): Promise<{
    locations: Location[];
    userLocation: Location | null;
    canSelectMultiple: boolean;
  }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        locations: true,
        userLocation: true,
        systemOwnerId: true,
        superAdminId: true,
        adminId: true,
      },
    });

    if (!user) {
      throw createError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // System Owner can assign any locations to Super Admin
    if (user.role === "system_owner") {
      return {
        locations: Object.values(LOCATIONS),
        userLocation: null,
        canSelectMultiple: true,
      };
    }

    // Super Admin can assign one of their locations to Admin/IT Person
    if (user.role === "super_admin") {
      if (!user.locations || user.locations.length === 0) {
        throw createError(
          "Super Admin has no assigned locations",
          HTTP_STATUS.BAD_REQUEST
        );
      }
      return {
        locations: user.locations,
        userLocation: null,
        canSelectMultiple: false,
      };
    }

    // Admin can assign their location to IT Person/User
    if (user.role === "admin") {
      if (!user.userLocation) {
        throw createError(
          "Admin has no assigned location",
          HTTP_STATUS.BAD_REQUEST
        );
      }
      return {
        locations: [user.userLocation],
        userLocation: user.userLocation,
        canSelectMultiple: false,
      };
    }

    // IT Person can assign their location to User
    if (user.role === "it_person") {
      if (!user.userLocation) {
        throw createError(
          "IT Person has no assigned location",
          HTTP_STATUS.BAD_REQUEST
        );
      }
      return {
        locations: [user.userLocation],
        userLocation: user.userLocation,
        canSelectMultiple: false,
      };
    }

    // Normal users cannot assign locations
    throw createError(
      "Users cannot assign locations to other users",
      HTTP_STATUS.FORBIDDEN
    );
  }
}
