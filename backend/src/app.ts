import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import "express-async-errors";

import { authRoutes } from "./routes/authRoutes";
import { ticketRoutes } from "./routes/ticketRoutes";
import { userRoutes } from "./routes/userRoutes";
import { dashboardRoutes } from "./routes/dashboardRoutes";
import { archiveRoutes } from "./routes/archiveRoutes";
import { errorHandler, notFoundHandler } from "./middlewares/errorMiddleware";
import { RATE_LIMIT_CONFIG } from "./utils/constants";
import { swaggerSpec } from "./config/swagger";

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.WINDOW_MS,
  max: RATE_LIMIT_CONFIG.MAX_REQUESTS,
  message: {
    success: false,
    error: {
      message: "Too many requests from this IP, please try again later.",
    },
  },
});
app.use(limiter);

// Body parsing middleware
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Swagger documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "IT Help Desk API Documentation",
    swaggerOptions: {
      persistAuthorization: true,
    },
  })
);

// Health check endpoint
/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the current status of the API server
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is running successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                       description: Current server timestamp
 *                       example: '2024-01-01T00:00:00.000Z'
 */
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "IT Helpdesk API is running",
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/archive", archiveRoutes);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

export { app };
