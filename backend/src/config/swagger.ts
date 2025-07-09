import swaggerJsdoc from "swagger-jsdoc";
import { SwaggerDefinition } from "swagger-jsdoc";
import fs from "fs";

const swaggerDefinition: SwaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "IT Help Desk Ticketing System API",
    version: "1.0.0",
    description:
      "Comprehensive API documentation for the IT Help Desk Ticketing Software Backend",
    contact: {
      name: "IT Helpdesk Team",
      email: "support@ithelpdesk.com",
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  servers: [
    {
      url: process.env.API_URL || "http://localhost:5000",
      description: "Development server",
    },
    {
      url: "https://api.ithelpdesk.com",
      description: "Production server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter JWT token in the format: Bearer <token>",
      },
    },
    schemas: {
      // User Schemas
      User: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "Unique user identifier",
            example: "clp123abc456def789",
          },
          username: {
            type: "string",
            description: "Username for login",
            example: "john_doe",
          },
          email: {
            type: "string",
            format: "email",
            description: "User email address",
            example: "john.doe@company.com",
          },
          role: {
            type: "string",
            enum: ["system_owner", "super_admin", "admin", "it_person", "user"],
            description: "User role in the system",
            example: "user",
          },
          isActive: {
            type: "boolean",
            description: "Whether the user account is active",
            example: true,
          },
          businessType: {
            type: "string",
            enum: ["small_business", "medium_business", "large_business"],
            description: "Business type (for super_admin role)",
            example: "medium_business",
          },
          accountLimit: {
            type: "integer",
            description: "Account limit for super_admin",
            example: 700,
          },
          expiryDate: {
            type: "string",
            format: "date-time",
            description: "Account expiry date",
            example: "2024-12-31T23:59:59Z",
          },
          location: {
            type: "string",
            description: "User location",
            example: "New York Office",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "User creation timestamp",
            example: "2024-01-01T00:00:00Z",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            description: "User last update timestamp",
            example: "2024-01-01T00:00:00Z",
          },
        },
      },

      // Ticket Schemas
      Ticket: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "Unique ticket identifier",
            example: "clp123abc456def789",
          },
          description: {
            type: "string",
            description: "Ticket description",
            example:
              "Unable to access company email. Getting authentication error when trying to log in.",
          },
          status: {
            type: "string",
            enum: ["pending", "solved"],
            description: "Current ticket status",
            example: "pending",
          },
          notes: {
            type: "string",
            description: "Notes added when closing the ticket",
            example:
              "Reset password and updated security settings. User can now access email.",
          },
          ip_address: {
            type: "string",
            description: "IP address of the user's device",
            example: "192.168.1.100",
          },
          device_name: {
            type: "string",
            description: "Name of the user's device",
            example: "LAPTOP-ABC123",
          },
          ip_number: {
            type: "string",
            description: "Alternative IP number field",
            example: "10.0.0.15",
          },
          createdById: {
            type: "string",
            description: "ID of user who created the ticket",
            example: "clp123abc456def789",
          },
          createdBy: {
            $ref: "#/components/schemas/User",
          },
          attachments: {
            type: "array",
            items: {
              $ref: "#/components/schemas/Attachment",
            },
            description: "Attachments associated with the ticket",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Ticket creation timestamp",
            example: "2024-01-01T00:00:00Z",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            description: "Ticket last update timestamp",
            example: "2024-01-01T00:00:00Z",
          },
        },
      },

      // Attachment Schema
      Attachment: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "Unique attachment identifier",
            example: "clp123abc456def789",
          },
          name: {
            type: "string",
            description: "Display name for the attachment",
            example: "screenshot.png",
          },
          url: {
            type: "string",
            description: "URL/link to the attachment",
            example: "/uploads/tickets/screenshot_1234567890.png",
          },
          fileType: {
            type: "string",
            description: "File type/extension",
            example: "image/png",
          },
          ticketId: {
            type: "string",
            description: "Associated ticket ID",
            example: "clp123abc456def789",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Attachment upload timestamp",
            example: "2024-01-01T00:00:00Z",
          },
        },
      },

      // Request/Response Schemas
      LoginRequest: {
        type: "object",
        required: ["username", "password"],
        properties: {
          username: {
            type: "string",
            description: "Username for authentication",
            example: "john_doe",
          },
          password: {
            type: "string",
            description: "User password",
            example: "securePassword123",
          },
        },
      },

      RegisterRequest: {
        type: "object",
        required: ["username", "email", "password", "role"],
        properties: {
          username: {
            type: "string",
            description: "Username for the new user",
            example: "jane_smith",
          },
          email: {
            type: "string",
            format: "email",
            description: "Email address for the new user",
            example: "jane.smith@company.com",
          },
          password: {
            type: "string",
            description: "Password for the new user",
            example: "securePassword123",
          },
          role: {
            type: "string",
            enum: ["system_owner", "super_admin", "admin", "it_person", "user"],
            description: "Role to assign to the new user",
            example: "user",
          },
          businessType: {
            type: "string",
            enum: ["small_business", "medium_business", "large_business"],
            description: "Business type (for super_admin role)",
            example: "medium_business",
          },
          accountLimit: {
            type: "integer",
            description: "Account limit (for super_admin role)",
            example: 700,
          },
          expiryDate: {
            type: "string",
            format: "date-time",
            description: "Account expiry date",
            example: "2024-12-31T23:59:59Z",
          },
          location: {
            type: "string",
            description: "User location",
            example: "New York Office",
          },
        },
      },

      CreateTicketRequest: {
        type: "object",
        required: ["description"],
        properties: {
          description: {
            type: "string",
            description: "Detailed description of the issue",
            example:
              "Unable to access company email. Getting authentication error when trying to log in.",
          },
          ip_address: {
            type: "string",
            description: "IP address of the user's device (optional)",
            example: "192.168.1.100",
          },
          device_name: {
            type: "string",
            description: "Name of the user's device (optional)",
            example: "LAPTOP-ABC123",
          },
          ip_number: {
            type: "string",
            description: "Alternative IP number field (optional)",
            example: "10.0.0.15",
          },
          attachments: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  description: "File name",
                  example: "error_screenshot.png",
                },
                url: {
                  type: "string",
                  description: "File URL",
                  example: "/uploads/tickets/error_screenshot_1234567890.png",
                },
                fileType: {
                  type: "string",
                  description: "File MIME type",
                  example: "image/png",
                },
              },
            },
            description: "Attachments to include with the ticket",
          },
        },
      },

      UpdateTicketRequest: {
        type: "object",
        properties: {
          description: {
            type: "string",
            description: "Updated description of the issue",
            example:
              "Updated: Unable to access company email after recent password change.",
          },
          status: {
            type: "string",
            enum: ["pending", "solved"],
            description: "Updated ticket status",
            example: "pending",
          },
          notes: {
            type: "string",
            description: "Additional notes (required when closing ticket)",
            example: "Password reset completed. User can now access email.",
          },
          ip_address: {
            type: "string",
            description: "Updated IP address of the user's device (optional)",
            example: "192.168.1.101",
          },
          device_name: {
            type: "string",
            description: "Updated name of the user's device (optional)",
            example: "LAPTOP-DEF456",
          },
          ip_number: {
            type: "string",
            description: "Updated alternative IP number field (optional)",
            example: "10.0.0.16",
          },
          attachments: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  description: "File name",
                  example: "additional_info.pdf",
                },
                url: {
                  type: "string",
                  description: "File URL",
                  example: "/uploads/tickets/additional_info_1234567890.pdf",
                },
                fileType: {
                  type: "string",
                  description: "File MIME type",
                  example: "application/pdf",
                },
              },
            },
            description: "Additional attachments",
          },
        },
      },

      CloseTicketRequest: {
        type: "object",
        required: ["notes"],
        properties: {
          notes: {
            type: "string",
            description: "Notes explaining the resolution (required)",
            example:
              "Issue resolved by resetting user password and updating security settings. User confirmed they can now access email successfully.",
          },
        },
      },

      // Response Schemas
      ApiResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            description: "Indicates if the request was successful",
            example: true,
          },
          message: {
            type: "string",
            description: "Response message",
            example: "Operation completed successfully",
          },
        },
      },

      AuthResponse: {
        allOf: [
          { $ref: "#/components/schemas/ApiResponse" },
          {
            type: "object",
            properties: {
              token: {
                type: "string",
                description: "JWT authentication token",
                example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
              },
              user: {
                $ref: "#/components/schemas/User",
              },
            },
          },
        ],
      },

      TicketResponse: {
        allOf: [
          { $ref: "#/components/schemas/ApiResponse" },
          {
            type: "object",
            properties: {
              ticket: {
                $ref: "#/components/schemas/Ticket",
              },
            },
          },
        ],
      },

      TicketsListResponse: {
        allOf: [
          { $ref: "#/components/schemas/ApiResponse" },
          {
            type: "object",
            properties: {
              tickets: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/Ticket",
                },
              },
              pagination: {
                type: "object",
                properties: {
                  page: {
                    type: "integer",
                    description: "Current page number",
                    example: 1,
                  },
                  limit: {
                    type: "integer",
                    description: "Number of items per page",
                    example: 10,
                  },
                  total: {
                    type: "integer",
                    description: "Total number of tickets",
                    example: 50,
                  },
                  totalPages: {
                    type: "integer",
                    description: "Total number of pages",
                    example: 5,
                  },
                },
              },
            },
          },
        ],
      },

      ErrorResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: false,
          },
          error: {
            type: "object",
            properties: {
              message: {
                type: "string",
                description: "Error message",
                example: "An error occurred",
              },
              code: {
                type: "string",
                description: "Error code",
                example: "VALIDATION_ERROR",
              },
              details: {
                type: "object",
                description: "Additional error details",
              },
            },
          },
        },
      },
    },
  },
  tags: [
    {
      name: "Authentication",
      description: "User authentication and authorization endpoints",
    },
    {
      name: "Tickets",
      description: "Ticket management endpoints",
    },
    {
      name: "Health",
      description: "System health check endpoints",
    },
  ],
};

const options = {
  definition: swaggerDefinition,
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts", "./src/app.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
