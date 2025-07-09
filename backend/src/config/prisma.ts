import { PrismaClient } from "@prisma/client";

// Global singleton instances to prevent multiple client creation
declare global {
  var __prisma: PrismaClient | undefined;
  var __archivePrisma: PrismaClient | undefined;
}

// Create main database client with connection pooling
const createPrismaClient = () => {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "info", "warn", "error"]
        : ["error"],
    errorFormat: "pretty",
    // Connection pooling configuration to prevent connection exhaustion
    datasources: {
      db: {
        url: process.env.DATABASE_URL || "",
      },
    },
  });
};

// Create archive database client with connection pooling
const createArchivePrismaClient = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url:
          process.env.ARCHIVE_DATABASE_URL ||
          process.env.DATABASE_URL ||
          "postgresql://localhost:5432/helpdesk_archive_db",
      },
    },
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "info", "warn", "error"]
        : ["error"],
    errorFormat: "pretty",
  });
};

// Main database instance - singleton pattern to prevent multiple clients
export const prisma = globalThis.__prisma ?? createPrismaClient();

// Archive database instance - singleton pattern
export const archivePrisma =
  globalThis.__archivePrisma ?? createArchivePrismaClient();

// In development, store clients on global to prevent recreation during hot reloads
if (process.env.NODE_ENV === "development") {
  globalThis.__prisma = prisma;
  globalThis.__archivePrisma = archivePrisma;
}

// Graceful shutdown
export const disconnectPrisma = async (): Promise<void> => {
  await prisma.$disconnect();
  await archivePrisma.$disconnect();
};

// Health check
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
};
