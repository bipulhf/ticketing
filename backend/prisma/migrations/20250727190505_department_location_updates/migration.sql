/*
  Warnings:

  - Added the required column `department` to the `archived_tickets` table without a default value. This is not possible if the table is not empty.
  - Made the column `ip_address` on table `archived_tickets` required. This step will fail if there are existing NULL values in that column.
  - Made the column `device_name` on table `archived_tickets` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "ITDepartment" AS ENUM ('it_operations', 'it_qcs');

-- CreateEnum
CREATE TYPE "UserDepartment" AS ENUM ('qa', 'qc', 'production', 'microbiology', 'hse', 'engineering', 'marketing', 'accounts', 'validation', 'ppic', 'warehouse', 'development');

-- CreateEnum
CREATE TYPE "Location" AS ENUM ('tongi', 'salna', 'mirpur', 'mawna', 'rupganj');

-- AlterTable
ALTER TABLE "archived_tickets" ADD COLUMN     "department" "ITDepartment" NOT NULL,
ADD COLUMN     "location" "Location",
ADD COLUMN     "user_department" "UserDepartment",
ALTER COLUMN "ip_address" SET NOT NULL,
ALTER COLUMN "device_name" SET NOT NULL;

-- AlterTable
ALTER TABLE "tickets" ADD COLUMN     "department" "ITDepartment" NOT NULL DEFAULT 'it_operations',
ADD COLUMN     "location" "Location",
ADD COLUMN     "user_department" "UserDepartment";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "department" "ITDepartment",
ADD COLUMN     "locations" "Location"[],
ADD COLUMN     "userLocation" "Location";
