import { Router } from "express";
import { TicketController } from "../controllers/ticketController";
import { authenticate } from "../middlewares/authMiddleware";
import {
  requireItPersonOrAbove,
  requireUser,
} from "../middlewares/roleMiddleware";
import { validateAttachments } from "../middlewares/attachmentMiddleware";

const router = Router();

// All ticket routes require authentication
router.use(authenticate);

// Create ticket (users and IT persons can create tickets)
/**
 * @swagger
 * /api/tickets:
 *   post:
 *     summary: Create a new ticket
 *     description: Create a new support ticket with optional file attachments. Available to users and IT personnel.
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTicketRequest'
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 description: Detailed description of the issue
 *                 example: "Unable to access company email. Getting authentication error when trying to log in."
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: "Attachment files (max 25MB each, formats: JPEG, PNG, PDF, TXT)"
 *     responses:
 *       201:
 *         description: Ticket created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TicketResponse'
 *       400:
 *         description: Invalid request data or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       413:
 *         description: File too large (exceeds 25MB limit)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  "/",
  requireUser,
  validateAttachments,
  TicketController.createTicket
);

// Get all tickets (filtered based on user role)
/**
 * @swagger
 * /api/tickets:
 *   get:
 *     summary: Get all tickets
 *     description: Retrieve tickets with pagination. Users see only their own tickets, IT personnel see all tickets.
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of tickets per page
 *         example: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, solved]
 *         description: Filter tickets by status
 *         example: pending
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter tickets created from this date (YYYY-MM-DD)
 *         example: 2024-01-01
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter tickets created until this date (YYYY-MM-DD)
 *         example: 2024-12-31
 *     responses:
 *       200:
 *         description: Tickets retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TicketsListResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/", requireUser, TicketController.getTickets);

// Get specific ticket by ID
/**
 * @swagger
 * /api/tickets/{id}:
 *   get:
 *     summary: Get ticket by ID
 *     description: Retrieve a specific ticket by its ID. Users can only view their own tickets, IT personnel can view any ticket.
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique ticket identifier
 *         example: clp123abc456def789
 *     responses:
 *       200:
 *         description: Ticket retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TicketResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Insufficient permissions or not ticket owner
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Ticket not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:id", requireUser, TicketController.getTicketById);

// Update ticket
/**
 * @swagger
 * /api/tickets/{id}:
 *   put:
 *     summary: Update ticket
 *     description: Update ticket details including description and attachments. Users can only update their own pending tickets.
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique ticket identifier
 *         example: clp123abc456def789
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 description: Updated description of the issue
 *                 example: "Updated description with more details about the email access issue"
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: File name
 *                       example: updated_screenshot.png
 *                     url:
 *                       type: string
 *                       description: File URL
 *                       example: /uploads/tickets/updated_screenshot_1234567890.png
 *                     fileType:
 *                       type: string
 *                       description: File MIME type
 *                       example: image/png
 *                 description: Updated attachments
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 description: Updated description of the issue
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: New attachment files
 *     responses:
 *       200:
 *         description: Ticket updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TicketResponse'
 *       400:
 *         description: Invalid request data or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Cannot update this ticket (not owner or ticket already solved)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Ticket not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put(
  "/:id",
  requireUser,
  validateAttachments,
  TicketController.updateTicket
);

// Close ticket (only IT persons can close tickets)
/**
 * @swagger
 * /api/tickets/{id}/close:
 *   patch:
 *     summary: Close ticket
 *     description: Close a ticket and mark it as solved. Only IT personnel can close tickets. Notes are required when closing.
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique ticket identifier
 *         example: clp123abc456def789
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [notes]
 *             properties:
 *               notes:
 *                 type: string
 *                 description: Notes explaining the resolution (required)
 *                 example: "Issue resolved by resetting user password and updating security settings. User confirmed they can now access email successfully."
 *     responses:
 *       200:
 *         description: Ticket closed successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/TicketResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Ticket closed successfully"
 *       400:
 *         description: Invalid request data or missing notes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Only IT personnel can close tickets
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Ticket not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Conflict - Ticket is already closed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch(
  "/:id/close",
  requireItPersonOrAbove,
  TicketController.closeTicket
);

// Reopen ticket (only IT persons can reopen tickets)
/**
 * @swagger
 * /api/tickets/{id}/reopen:
 *   patch:
 *     summary: Reopen ticket
 *     description: Reopen a closed ticket and mark it as pending. Only IT personnel can reopen tickets.
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique ticket identifier
 *         example: clp123abc456def789
 *     responses:
 *       200:
 *         description: Ticket reopened successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/TicketResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Ticket reopened successfully"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Only IT personnel can reopen tickets
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Ticket not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Conflict - Ticket is already open
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch("/:id/reopen", requireUser, TicketController.reopenTicket);

export { router as ticketRoutes };
