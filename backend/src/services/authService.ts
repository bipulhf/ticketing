import { User, UserRole } from "@prisma/client";
import { clonedPrisma } from "../config/prisma";
import { hashPassword, comparePassword } from "../utils/password";
import { generateToken } from "../utils/jwt";
import { createError } from "../middlewares/errorMiddleware";
import { HTTP_STATUS, ERROR_MESSAGES } from "../utils/constants";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user: {
    id: string;
    username: string;
    email: string;
    role: UserRole;
  };
  token: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  ipNumber?: string;
  deviceName?: string;
  deviceIpAddress?: string;
  businessType?: "small_business" | "medium_business" | "large_business";
  accountLimit?: number;
  expiryDate?: Date;
  location?: string;
  createdById: string;
}

export class AuthService {
  static async login(loginData: LoginRequest): Promise<LoginResponse> {
    const { username, password } = loginData;

    // Find user by username
    const user = await clonedPrisma().user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        email: true,
        password: true,
        role: true,
        isActive: true,
        expiryDate: true,
      },
    });

    if (!user) {
      throw createError(
        ERROR_MESSAGES.INVALID_CREDENTIALS,
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    // Check if user is active
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

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw createError(
        ERROR_MESSAGES.INVALID_CREDENTIALS,
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }

  static async register(
    registerData: RegisterRequest
  ): Promise<{ success: boolean; user: Partial<User> }> {
    const {
      username,
      email,
      password,
      role,
      businessType,
      accountLimit,
      expiryDate,
      location,
      createdById,
    } = registerData;

    // Check if username or email already exists
    const existingUser = await clonedPrisma().user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      throw createError(
        "Username or email already exists",
        HTTP_STATUS.CONFLICT
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser = await clonedPrisma().user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role,
        businessType: businessType || null,
        accountLimit: accountLimit || null,
        expiryDate: expiryDate || null,
        location: location || null,
        createdById: createdById || null,
        isActive: true,
      },
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
      },
    });

    return {
      success: true,
      user: newUser,
    };
  }

  static async validateUser(userId: string): Promise<User | null> {
    return await clonedPrisma().user.findUnique({
      where: { id: userId },
    });
  }

  static async refreshToken(userId: string): Promise<string> {
    const user = await clonedPrisma().user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        expiryDate: true,
      },
    });

    if (!user || !user.isActive) {
      throw createError(
        ERROR_MESSAGES.USER_NOT_FOUND,
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    // Check expiry for super admin
    if (user.role === "super_admin" && user.expiryDate) {
      const now = new Date();
      if (now > user.expiryDate) {
        throw createError(
          ERROR_MESSAGES.ACCOUNT_EXPIRED,
          HTTP_STATUS.UNAUTHORIZED
        );
      }
    }

    return generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
  }
}
