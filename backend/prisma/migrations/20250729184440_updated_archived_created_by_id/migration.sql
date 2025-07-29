/*
  Warnings:

  - Changed the type of `createdById` on the `archived_tickets` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "archived_tickets" DROP COLUMN "createdById",
ADD COLUMN     "createdById" INTEGER NOT NULL;
