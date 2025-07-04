import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./authMiddleware";
import { createError } from "./errorMiddleware";
import { HTTP_STATUS, ERROR_MESSAGES, USER_ROLES } from "../utils/constants";

export const requireRole = (allowedRoles: string[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      if (!req.user) {
        throw createError(
          ERROR_MESSAGES.ACCESS_DENIED,
          HTTP_STATUS.UNAUTHORIZED
        );
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw createError(
          ERROR_MESSAGES.UNAUTHORIZED_ACTION,
          HTTP_STATUS.FORBIDDEN
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Role-specific middlewares
export const requireSystemOwner = requireRole([USER_ROLES.SYSTEM_OWNER]);

export const requireSuperAdminOrAbove = requireRole([
  USER_ROLES.SYSTEM_OWNER,
  USER_ROLES.SUPER_ADMIN,
]);

export const requireAdminOrAbove = requireRole([
  USER_ROLES.SYSTEM_OWNER,
  USER_ROLES.SUPER_ADMIN,
  USER_ROLES.ADMIN,
]);

export const requireItPersonOrAbove = requireRole([
  USER_ROLES.SYSTEM_OWNER,
  USER_ROLES.SUPER_ADMIN,
  USER_ROLES.ADMIN,
  USER_ROLES.IT_PERSON,
]);

export const requireUser = requireRole([
  USER_ROLES.SYSTEM_OWNER,
  USER_ROLES.SUPER_ADMIN,
  USER_ROLES.ADMIN,
  USER_ROLES.IT_PERSON,
  USER_ROLES.USER,
]);

// Check if user can create accounts based on role hierarchy
export const canCreateAccount = (
  creatorRole: string,
  targetRole: string
): boolean => {
  const roleHierarchy: Record<string, string[]> = {
    [USER_ROLES.SYSTEM_OWNER]: [USER_ROLES.SUPER_ADMIN],
    [USER_ROLES.SUPER_ADMIN]: [USER_ROLES.ADMIN],
    [USER_ROLES.ADMIN]: [USER_ROLES.IT_PERSON, USER_ROLES.USER],
    [USER_ROLES.IT_PERSON]: [USER_ROLES.USER],
    [USER_ROLES.USER]: [],
  };

  return roleHierarchy[creatorRole]?.includes(targetRole) || false;
};

// Middleware to check account creation permissions
export const requireAccountCreationPermission = (targetRole: string) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      if (!req.user) {
        throw createError(
          ERROR_MESSAGES.ACCESS_DENIED,
          HTTP_STATUS.UNAUTHORIZED
        );
      }

      if (!canCreateAccount(req.user.role, targetRole)) {
        throw createError(
          ERROR_MESSAGES.UNAUTHORIZED_ACTION,
          HTTP_STATUS.FORBIDDEN
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Check if user can view/manage another user
export const canManageUser = (
  managerRole: string,
  targetUserRole: string
): boolean => {
  // System owner can manage everyone
  if (managerRole === USER_ROLES.SYSTEM_OWNER) return true;

  // Super admin can manage admin, it_person, user
  if (managerRole === USER_ROLES.SUPER_ADMIN) {
    return [USER_ROLES.ADMIN, USER_ROLES.IT_PERSON, USER_ROLES.USER].includes(
      targetUserRole as any
    );
  }

  // Admin can manage it_person, user
  if (managerRole === USER_ROLES.ADMIN) {
    return [USER_ROLES.IT_PERSON, USER_ROLES.USER].includes(
      targetUserRole as any
    );
  }

  // IT person can manage user
  if (managerRole === USER_ROLES.IT_PERSON) {
    return targetUserRole === USER_ROLES.USER;
  }

  return false;
};

// Check if user can view tickets
export const canViewTickets = (userRole: string): boolean => {
  return [
    USER_ROLES.SYSTEM_OWNER,
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
    USER_ROLES.IT_PERSON,
  ].includes(userRole as any);
};

// Check if user can close tickets
export const canCloseTickets = (userRole: string): boolean => {
  return userRole === USER_ROLES.IT_PERSON || canViewTickets(userRole);
};
