/*
  Warnings:

  - You are about to drop the column `location` on the `users` table. All the data in the column will be lost.
  - Made the column `ip_number` on table `archived_tickets` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "archived_tickets" ALTER COLUMN "ip_number" SET NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "location";
