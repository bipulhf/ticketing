/*
  Warnings:

  - The primary key for the `archived_attachments` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `archived_tickets` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `attachments` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `attachments` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `tickets` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `tickets` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `id` on the `archived_attachments` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `ticketId` on the `archived_attachments` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `archived_tickets` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `ticketId` on the `attachments` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "archived_attachments" DROP CONSTRAINT "archived_attachments_ticketId_fkey";

-- DropForeignKey
ALTER TABLE "attachments" DROP CONSTRAINT "attachments_ticketId_fkey";

-- AlterTable
ALTER TABLE "archived_attachments" DROP CONSTRAINT "archived_attachments_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" INTEGER NOT NULL,
DROP COLUMN "ticketId",
ADD COLUMN     "ticketId" INTEGER NOT NULL,
ADD CONSTRAINT "archived_attachments_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "archived_tickets" DROP CONSTRAINT "archived_tickets_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" INTEGER NOT NULL,
ADD CONSTRAINT "archived_tickets_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "attachments" DROP CONSTRAINT "attachments_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "ticketId",
ADD COLUMN     "ticketId" INTEGER NOT NULL,
ADD CONSTRAINT "attachments_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "tickets" DROP CONSTRAINT "tickets_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "tickets_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archived_attachments" ADD CONSTRAINT "archived_attachments_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "archived_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
