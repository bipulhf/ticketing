import { PrismaClient } from "@prisma/client";

// Create main database client
const createPrismaClient = () => {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "info", "warn", "error"]
        : ["error"],
    errorFormat: "pretty",
  });
};

// Create archive database client
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

// Main database instance
export const prisma = createPrismaClient();

// Archive database instance
export const archivePrisma = createArchivePrismaClient();

// Query optimization: Clone before execution
export const clonedPrisma = () => {
  return createPrismaClient();
};

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
