import { Router } from "express";
import { ArchiveService } from "../services/archiveService";
import { authenticate } from "../middlewares/authMiddleware";
import { requireSystemOwner } from "../middlewares/roleMiddleware";
import { asyncHandler } from "../middlewares/errorMiddleware";
import { HTTP_STATUS } from "../utils/constants";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { Response } from "express";

const router = Router();

// All archive routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/archive/tickets:
 *   post:
 *     summary: Archive old tickets
 *     description: Archive tickets older than 6 months to the archive database. Only accessible by System Owner.
 *     tags: [Archive Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tickets archived successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     result:
 *                       type: object
 *                       properties:
 *                         archivedCount:
 *                           type: integer
 *                           description: Number of tickets archived
 *                           example: 45
 *                         message:
 *                           type: string
 *                           example: "Successfully archived 45 tickets older than 6 months"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Only System Owner can perform archiving
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error during archiving process
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  "/tickets",
  requireSystemOwner,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await ArchiveService.archiveOldTickets();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      result,
      message:
        result.archivedCount > 0
          ? `Successfully archived ${result.archivedCount} tickets older than 6 months`
          : "No tickets found that are older than 6 months",
    });
    return;
  })
);

export { router as archiveRoutes };
