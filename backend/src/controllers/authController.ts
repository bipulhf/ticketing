import { Request, Response } from "express";
import {
  AuthService,
  LoginRequest,
  RegisterRequest,
} from "../services/authService";
import { asyncHandler } from "../middlewares/errorMiddleware";
import { HTTP_STATUS } from "../utils/constants";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

export class AuthController {
  static login = asyncHandler(async (req: Request, res: Response) => {
    const loginData: LoginRequest = req.body;

    const result = await AuthService.login(loginData);

    res.status(HTTP_STATUS.OK).json(result);
  });

  static register = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const registerData: RegisterRequest = {
        ...req.body,
        createdById: req.user?.id || "",
      };

      const result = await AuthService.register(registerData);

      res.status(HTTP_STATUS.CREATED).json(result);
    }
  );

  static refreshToken = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: { message: "User not authenticated" },
        });
      }

      const token = await AuthService.refreshToken(userId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        token,
      });
      return;
    }
  );

  static getProfile = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const user = req.user;

      res.status(HTTP_STATUS.OK).json({
        success: true,
        user,
      });
    }
  );

  static logout = asyncHandler(async (req: Request, res: Response) => {
    // In a stateless JWT system, logout is handled client-side
    // The client should remove the token from storage
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Logged out successfully",
    });
  });
}
