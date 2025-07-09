import { Request, Response, NextFunction } from "express";
import { verifyToken, getTokenFromHeader, JwtPayload } from "../utils/jwt";
import { createError } from "./errorMiddleware";
import { HTTP_STATUS, ERROR_MESSAGES } from "../utils/constants";
import { prisma } from "../config/prisma";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    username: string;
    isActive: boolean;
    expiryDate?: Date | null;
  };
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = getTokenFromHeader(req.headers.authorization);

    if (!token) {
      throw createError(ERROR_MESSAGES.ACCESS_DENIED, HTTP_STATUS.UNAUTHORIZED);
    }

    const decoded: JwtPayload = verifyToken(token);

    // Get user from database to ensure they still exist and are active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isActive: true,
        expiryDate: true,
      },
    });

    if (!user) {
      throw createError(
        ERROR_MESSAGES.USER_NOT_FOUND,
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    if (!user.isActive) {
      throw createError(ERROR_MESSAGES.ACCESS_DENIED, HTTP_STATUS.UNAUTHORIZED);
    }

    // Check if super admin account has expired
    if (user.role === "super_admin" && user.expiryDate) {
      const now = new Date();
      if (now > user.expiryDate) {
        throw createError(
          ERROR_MESSAGES.ACCOUNT_EXPIRED,
          HTTP_STATUS.UNAUTHORIZED
        );
      }
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = getTokenFromHeader(req.headers.authorization);

    if (token) {
      const decoded: JwtPayload = verifyToken(token);

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          isActive: true,
          expiryDate: true,
        },
      });

      if (user && user.isActive) {
        // Check expiry for super admin
        if (user.role === "super_admin" && user.expiryDate) {
          const now = new Date();
          if (now <= user.expiryDate) {
            req.user = user;
          }
        } else {
          req.user = user;
        }
      }
    }

    next();
  } catch (error) {
    // For optional auth, we don't throw errors, just continue without user
    next();
  }
};
