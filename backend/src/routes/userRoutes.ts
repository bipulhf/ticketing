import { Router } from "express";
import { UserController } from "../controllers/userController";
import { authenticate } from "../middlewares/authMiddleware";
import {
  requireSystemOwner,
  requireSuperAdminOrAbove,
  requireAdminOrAbove,
  requireItPersonOrAbove,
} from "../middlewares/roleMiddleware";

const router = Router();

// All user management routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/users/create-super-admin:
 *   post:
 *     summary: Create Super Admin account
 *     description: Create a new Super Admin account with business type and account limits. Only System Owner can create Super Admins.
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password, businessType, location]
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username for the Super Admin
 *                 example: "superadmin_company1"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address for the Super Admin
 *                 example: "superadmin@company.com"
 *               password:
 *                 type: string
 *                 description: Password for the Super Admin
 *                 example: "SecurePass123!"
 *               businessType:
 *                 type: string
 *                 enum: [small_business, medium_business, large_business]
 *                 description: Business type that determines account limits
 *                 example: medium_business
 *               expiryDate:
 *                 type: string
 *                 format: date-time
 *                 description: Account expiry date
 *                 example: "2025-12-31T23:59:59Z"
 *               location:
 *                 type: string
 *                 description: Super Admin location/office
 *                 example: "New York Headquarters"
 *     responses:
 *       201:
 *         description: Super Admin created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
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
 *         description: Forbidden - Only System Owner can create Super Admins
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Conflict - Username or email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  "/create-super-admin",
  requireSystemOwner,
  UserController.createSuperAdmin
);

/**
 * @swagger
 * /api/users/create-admin:
 *   post:
 *     summary: Create Admin account
 *     description: Create a new Admin account. Only Super Admins can create Admin accounts, subject to their account limits.
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password]
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username for the Admin
 *                 example: "admin_dept1"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address for the Admin
 *                 example: "admin@company.com"
 *               password:
 *                 type: string
 *                 description: Password for the Admin
 *                 example: "SecurePass123!"
 *               ipNumber:
 *                 type: string
 *                 description: IP number for the Admin
 *                 example: "192.168.1.10"
 *               deviceName:
 *                 type: string
 *                 description: Device name
 *                 example: "ADMIN-LAPTOP-01"
 *               deviceIpAddress:
 *                 type: string
 *                 description: Device IP address
 *                 example: "192.168.1.10"
 *               location:
 *                 type: string
 *                 description: Admin location/department
 *                 example: "IT Department"
 *     responses:
 *       201:
 *         description: Admin created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
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
 *         description: Forbidden - Only Super Admins can create Admins or account limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Conflict - Username or email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  "/create-admin",
  requireSuperAdminOrAbove,
  UserController.createAdmin
);

/**
 * @swagger
 * /api/users/create-it-person:
 *   post:
 *     summary: Create IT Person account
 *     description: Create a new IT Person account. Admins and higher roles can create IT Person accounts.
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password]
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username for the IT Person
 *                 example: "itperson_support1"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address for the IT Person
 *                 example: "itperson@company.com"
 *               password:
 *                 type: string
 *                 description: Password for the IT Person
 *                 example: "SecurePass123!"
 *               ipNumber:
 *                 type: string
 *                 description: IP number for the IT Person
 *                 example: "192.168.1.20"
 *               deviceName:
 *                 type: string
 *                 description: Device name
 *                 example: "IT-SUPPORT-01"
 *               deviceIpAddress:
 *                 type: string
 *                 description: Device IP address
 *                 example: "192.168.1.20"
 *               location:
 *                 type: string
 *                 description: IT Person location/department
 *                 example: "Help Desk - Floor 2"
 *     responses:
 *       201:
 *         description: IT Person created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
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
 *         description: Forbidden - Only Admins and above can create IT Persons
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Conflict - Username or email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  "/create-it-person",
  requireAdminOrAbove,
  UserController.createItPerson
);

/**
 * @swagger
 * /api/users/create-user:
 *   post:
 *     summary: Create User account
 *     description: Create a new User account. IT Persons and higher roles can create User accounts.
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password, ipNumber, deviceName]
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username for the User
 *                 example: "user_john_doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address for the User
 *                 example: "john.doe@company.com"
 *               password:
 *                 type: string
 *                 description: Password for the User
 *                 example: "SecurePass123!"
 *               ipNumber:
 *                 type: string
 *                 description: IP number for the User (required)
 *                 example: "192.168.1.100"
 *               deviceName:
 *                 type: string
 *                 description: Device name (required)
 *                 example: "LAPTOP-JOHN-01"
 *               deviceIpAddress:
 *                 type: string
 *                 description: Device IP address
 *                 example: "192.168.1.100"
 *               location:
 *                 type: string
 *                 description: User location/department
 *                 example: "Marketing Department"
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
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
 *         description: Forbidden - Only IT Persons and above can create Users
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Conflict - Username or email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/create-user", requireItPersonOrAbove, UserController.createUser);

/**
 * @swagger
 * /api/users/my-users:
 *   get:
 *     summary: Get users created by current user with advanced filtering
 *     description: Retrieve all users created by the authenticated user with pagination, search, and filtering capabilities.
 *     tags: [User Management]
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
 *         description: Number of users per page
 *         example: 10
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [super_admin, admin, it_person, user]
 *         description: Filter users by role
 *         example: user
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by username, email, or device name
 *         example: "john"
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filter by active status
 *         example: "true"
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                         total:
 *                           type: integer
 *                           example: 25
 *                         totalPages:
 *                           type: integer
 *                           example: 3
 *                         hasNextPage:
 *                           type: boolean
 *                           example: true
 *                         hasPreviousPage:
 *                           type: boolean
 *                           example: false
 *                     filters:
 *                       type: object
 *                       properties:
 *                         role:
 *                           type: string
 *                           example: "user"
 *                         search:
 *                           type: string
 *                           example: "john"
 *                         isActive:
 *                           type: string
 *                           example: "true"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/my-users", UserController.getMyUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Retrieve a specific user by their ID. Users can only access their own profile or users they created.
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *         example: "clp123abc456def789"
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Cannot access this user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:id", UserController.getUser);

export { router as userRoutes };
