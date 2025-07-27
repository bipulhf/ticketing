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
 *             required: [username, email, password]
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
 * /api/users/all-by-type:
 *   get:
 *     summary: Get all users grouped by type with pagination
 *     description: Retrieve all users in the system grouped by their role types with pagination support. Only accessible by System Owner for administrative oversight.
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
 *         description: Page number for pagination (applies to each user type separately)
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of users per page for each user type
 *         example: 10
 *     responses:
 *       200:
 *         description: All users retrieved successfully grouped by type
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         system_owner:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/User'
 *                           description: List of system owner users
 *                         super_admin:
 *                           type: array
 *                           items:
 *                             allOf:
 *                               - $ref: '#/components/schemas/User'
 *                               - type: object
 *                                 properties:
 *                                   createdBy:
 *                                     type: object
 *                                     properties:
 *                                       username:
 *                                         type: string
 *                                         example: "system_owner"
 *                                       email:
 *                                         type: string
 *                                         example: "system@company.com"
 *                           description: List of super admin users with creator info
 *                         admin:
 *                           type: array
 *                           items:
 *                             allOf:
 *                               - $ref: '#/components/schemas/User'
 *                               - type: object
 *                                 properties:
 *                                   createdBy:
 *                                     type: object
 *                                     properties:
 *                                       username:
 *                                         type: string
 *                                         example: "superadmin_company1"
 *                                       email:
 *                                         type: string
 *                                         example: "superadmin@company.com"
 *                           description: List of admin users with creator info
 *                         it_person:
 *                           type: array
 *                           items:
 *                             allOf:
 *                               - $ref: '#/components/schemas/User'
 *                               - type: object
 *                                 properties:
 *                                   createdBy:
 *                                     type: object
 *                                     properties:
 *                                       username:
 *                                         type: string
 *                                         example: "admin_dept1"
 *                                       email:
 *                                         type: string
 *                                         example: "admin@company.com"
 *                           description: List of IT person users with creator info
 *                         user:
 *                           type: array
 *                           items:
 *                             allOf:
 *                               - $ref: '#/components/schemas/User'
 *                               - type: object
 *                                 properties:
 *                                   createdBy:
 *                                     type: object
 *                                     properties:
 *                                       username:
 *                                         type: string
 *                                         example: "itperson_support1"
 *                                       email:
 *                                         type: string
 *                                         example: "itperson@company.com"
 *                           description: List of regular users with creator info
 *                         totalCount:
 *                           type: object
 *                           properties:
 *                             system_owner:
 *                               type: integer
 *                               example: 1
 *                               description: Total number of system owners
 *                             super_admin:
 *                               type: integer
 *                               example: 5
 *                               description: Total number of super admins
 *                             admin:
 *                               type: integer
 *                               example: 15
 *                               description: Total number of admins
 *                             it_person:
 *                               type: integer
 *                               example: 25
 *                               description: Total number of IT persons
 *                             user:
 *                               type: integer
 *                               example: 150
 *                               description: Total number of regular users
 *                             total:
 *                               type: integer
 *                               example: 196
 *                               description: Total number of all users
 *                         pagination:
 *                           type: object
 *                           properties:
 *                             system_owner:
 *                               type: object
 *                               properties:
 *                                 total:
 *                                   type: integer
 *                                   example: 1
 *                                 page:
 *                                   type: integer
 *                                   example: 1
 *                                 limit:
 *                                   type: integer
 *                                   example: 10
 *                                 totalPages:
 *                                   type: integer
 *                                   example: 1
 *                                 hasNextPage:
 *                                   type: boolean
 *                                   example: false
 *                                 hasPreviousPage:
 *                                   type: boolean
 *                                   example: false
 *                               description: Pagination info for system owners
 *                             super_admin:
 *                               type: object
 *                               properties:
 *                                 total:
 *                                   type: integer
 *                                   example: 5
 *                                 page:
 *                                   type: integer
 *                                   example: 1
 *                                 limit:
 *                                   type: integer
 *                                   example: 10
 *                                 totalPages:
 *                                   type: integer
 *                                   example: 1
 *                                 hasNextPage:
 *                                   type: boolean
 *                                   example: false
 *                                 hasPreviousPage:
 *                                   type: boolean
 *                                   example: false
 *                               description: Pagination info for super admins
 *                             admin:
 *                               type: object
 *                               properties:
 *                                 total:
 *                                   type: integer
 *                                   example: 15
 *                                 page:
 *                                   type: integer
 *                                   example: 1
 *                                 limit:
 *                                   type: integer
 *                                   example: 10
 *                                 totalPages:
 *                                   type: integer
 *                                   example: 2
 *                                 hasNextPage:
 *                                   type: boolean
 *                                   example: true
 *                                 hasPreviousPage:
 *                                   type: boolean
 *                                   example: false
 *                               description: Pagination info for admins
 *                             it_person:
 *                               type: object
 *                               properties:
 *                                 total:
 *                                   type: integer
 *                                   example: 25
 *                                 page:
 *                                   type: integer
 *                                   example: 1
 *                                 limit:
 *                                   type: integer
 *                                   example: 10
 *                                 totalPages:
 *                                   type: integer
 *                                   example: 3
 *                                 hasNextPage:
 *                                   type: boolean
 *                                   example: true
 *                                 hasPreviousPage:
 *                                   type: boolean
 *                                   example: false
 *                               description: Pagination info for IT persons
 *                             user:
 *                               type: object
 *                               properties:
 *                                 total:
 *                                   type: integer
 *                                   example: 150
 *                                 page:
 *                                   type: integer
 *                                   example: 1
 *                                 limit:
 *                                   type: integer
 *                                   example: 10
 *                                 totalPages:
 *                                   type: integer
 *                                   example: 15
 *                                 hasNextPage:
 *                                   type: boolean
 *                                   example: true
 *                                 hasPreviousPage:
 *                                   type: boolean
 *                                   example: false
 *                               description: Pagination info for regular users
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Only System Owner can access this endpoint
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  "/all-by-type",
  requireSystemOwner,
  UserController.getAllUsersByType
);

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

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user by ID
 *     description: Update a specific user by their ID. Users can only update profiles they have permission to manage based on role hierarchy.
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Updated username
 *                 example: "updated_username"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Updated email address
 *                 example: "updated@email.com"
 *               businessType:
 *                 type: string
 *                 enum: [small_business, medium_business, large_business]
 *                 description: Business type (for super_admin role)
 *                 example: "medium_business"
 *               accountLimit:
 *                 type: integer
 *                 description: Account limit (auto-calculated for super_admin based on business type)
 *                 example: 700
 *               expiryDate:
 *                 type: string
 *                 format: date-time
 *                 description: Account expiry date
 *                 example: "2025-12-31T23:59:59Z"
 *               location:
 *                 type: string
 *                 description: User location
 *                 example: "Updated Location"
 *               isActive:
 *                 type: boolean
 *                 description: Account active status
 *                 example: true
 *     responses:
 *       200:
 *         description: User updated successfully
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
 *         description: Forbidden - Cannot update this user
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
router.put("/:id", UserController.updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user by ID
 *     description: Delete (soft delete) a specific user by their ID. Users can only delete users they have permission to manage based on role hierarchy.
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
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "User deleted successfully"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Cannot delete this user
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
router.delete("/:id", UserController.deleteUser);

/**
 * @swagger
 * /api/users/self/profile:
 *   put:
 *     summary: Update self profile
 *     description: Update authenticated user's own profile information (excluding password)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Updated username
 *                 example: "new_username"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Updated email address
 *                 example: "new.email@company.com"
 *               location:
 *                 type: string
 *                 description: Updated location
 *                 example: "New Office Location"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     message:
 *                       type: string
 *                       example: "Profile updated successfully"
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
 *       409:
 *         description: Conflict - Username or email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put("/self/profile", UserController.updateSelfProfile);

/**
 * @swagger
 * /api/users/self/password:
 *   put:
 *     summary: Update self password
 *     description: Update authenticated user's own password with current password verification
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: Current password for verification
 *                 example: "oldPassword123!"
 *               newPassword:
 *                 type: string
 *                 description: New password (must meet strength requirements)
 *                 example: "NewSecurePass123!"
 *     responses:
 *       200:
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Password updated successfully"
 *       400:
 *         description: Invalid request data, password validation failed, or current password incorrect
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
 */
router.put("/self/password", UserController.updateSelfPassword);

/**
 * @swagger
 * /api/users/{userId}/reset-password:
 *   put:
 *     summary: Reset user password to default
 *     description: Reset a user's password to the default password. Only users one level higher in the hierarchy can reset passwords for users one level below them.
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user whose password will be reset
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 message:
 *                   type: string
 *                   example: "Password reset successfully to default password"
 *       400:
 *         description: Invalid request data or user ID
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
 *         description: Forbidden - Cannot reset password for this user (hierarchy violation)
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
router.put("/:userId/reset-password", UserController.resetUserPassword);

export { router as userRoutes };
