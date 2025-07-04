import { Router } from "express";
import { DashboardController } from "../controllers/dashboardController";
import { authenticate } from "../middlewares/authMiddleware";
import {
  requireSystemOwner,
  requireSuperAdminOrAbove,
  requireAdminOrAbove,
  requireItPersonOrAbove,
} from "../middlewares/roleMiddleware";

const router = Router();

// All dashboard routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/dashboard/metrics:
 *   get:
 *     summary: Get role-based dashboard metrics
 *     description: Retrieve dashboard metrics based on the authenticated user's role
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering (YYYY-MM-DD)
 *         example: "2024-01-01"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering (YYYY-MM-DD)
 *         example: "2024-12-31"
 *     responses:
 *       200:
 *         description: Dashboard metrics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     metrics:
 *                       type: object
 *                       properties:
 *                         totalUsers:
 *                           type: integer
 *                           example: 150
 *                         adminCount:
 *                           type: integer
 *                           example: 5
 *                         itPersonCount:
 *                           type: integer
 *                           example: 10
 *                         userCount:
 *                           type: integer
 *                           example: 135
 *                         ticketStats:
 *                           type: object
 *                           properties:
 *                             totalTickets:
 *                               type: integer
 *                               example: 245
 *                             pendingTickets:
 *                               type: integer
 *                               example: 12
 *                             solvedTickets:
 *                               type: integer
 *                               example: 233
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/metrics", DashboardController.getDashboardMetrics);

/**
 * @swagger
 * /api/dashboard/system-owner:
 *   get:
 *     summary: System Owner dashboard
 *     description: Get comprehensive system overview including Super Admin management and expiry tracking
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering
 *         example: "2024-01-01"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering
 *         example: "2024-12-31"
 *     responses:
 *       200:
 *         description: System Owner dashboard data retrieved successfully
 *       403:
 *         description: Forbidden - Only System Owner can access
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  "/system-owner",
  requireSystemOwner,
  DashboardController.getSystemOwnerDashboard
);

/**
 * @swagger
 * /api/dashboard/super-admin:
 *   get:
 *     summary: Super Admin dashboard
 *     description: Get Super Admin specific metrics including account utilization, managed user counts, ticket statistics, and expiry information.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering ticket statistics
 *         example: "2024-01-01"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering ticket statistics
 *         example: "2024-12-31"
 *     responses:
 *       200:
 *         description: Super Admin dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     dashboard:
 *                       type: object
 *                       properties:
 *                         userCounts:
 *                           type: object
 *                           properties:
 *                             totalUsers:
 *                               type: integer
 *                               example: 245
 *                             adminCount:
 *                               type: integer
 *                               example: 5
 *                             itPersonCount:
 *                               type: integer
 *                               example: 15
 *                             userCount:
 *                               type: integer
 *                               example: 225
 *                         ticketStats:
 *                           type: object
 *                           properties:
 *                             totalTickets:
 *                               type: integer
 *                               example: 456
 *                             pendingTickets:
 *                               type: integer
 *                               example: 18
 *                             solvedTickets:
 *                               type: integer
 *                               example: 438
 *                         accountInfo:
 *                           type: object
 *                           properties:
 *                             businessType:
 *                               type: string
 *                               enum: [small_business, medium_business, large_business]
 *                               example: "medium_business"
 *                             accountLimit:
 *                               type: integer
 *                               example: 700
 *                             accountUtilization:
 *                               type: integer
 *                               description: Percentage of account limit used
 *                               example: 35
 *                             remainingSlots:
 *                               type: integer
 *                               description: Number of remaining account slots
 *                               example: 455
 *                         expiryInfo:
 *                           type: object
 *                           properties:
 *                             expiryDate:
 *                               type: string
 *                               format: date-time
 *                               example: "2025-12-31T23:59:59Z"
 *                             daysToExpiry:
 *                               type: integer
 *                               example: 365
 *                             isExpired:
 *                               type: boolean
 *                               example: false
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Super Admin role or above required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  "/super-admin",
  requireSuperAdminOrAbove,
  DashboardController.getSuperAdminDashboard
);

/**
 * @swagger
 * /api/dashboard/admin:
 *   get:
 *     summary: Admin dashboard
 *     description: Get Admin specific metrics including managed IT Person and User counts with ticket tracking capabilities.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering ticket statistics
 *         example: "2024-01-01"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering ticket statistics
 *         example: "2024-12-31"
 *     responses:
 *       200:
 *         description: Admin dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     dashboard:
 *                       type: object
 *                       properties:
 *                         userCounts:
 *                           type: object
 *                           properties:
 *                             totalUsers:
 *                               type: integer
 *                               example: 85
 *                             itPersonCount:
 *                               type: integer
 *                               example: 8
 *                             userCount:
 *                               type: integer
 *                               example: 77
 *                         ticketStats:
 *                           type: object
 *                           properties:
 *                             totalTickets:
 *                               type: integer
 *                               example: 234
 *                             pendingTickets:
 *                               type: integer
 *                               example: 12
 *                             solvedTickets:
 *                               type: integer
 *                               example: 222
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin role or above required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  "/admin",
  requireAdminOrAbove,
  DashboardController.getAdminDashboard
);

/**
 * @swagger
 * /api/dashboard/it-person:
 *   get:
 *     summary: IT Person dashboard
 *     description: Get IT Person specific metrics including managed User counts and assigned ticket overview.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering ticket statistics
 *         example: "2024-01-01"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering ticket statistics
 *         example: "2024-12-31"
 *     responses:
 *       200:
 *         description: IT Person dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     dashboard:
 *                       type: object
 *                       properties:
 *                         userCounts:
 *                           type: object
 *                           properties:
 *                             totalUsers:
 *                               type: integer
 *                               example: 25
 *                             userCount:
 *                               type: integer
 *                               example: 25
 *                         ticketStats:
 *                           type: object
 *                           properties:
 *                             totalTickets:
 *                               type: integer
 *                               example: 67
 *                             pendingTickets:
 *                               type: integer
 *                               example: 4
 *                             solvedTickets:
 *                               type: integer
 *                               example: 63
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - IT Person role or above required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  "/it-person",
  requireItPersonOrAbove,
  DashboardController.getItPersonDashboard
);

export { router as dashboardRoutes };
