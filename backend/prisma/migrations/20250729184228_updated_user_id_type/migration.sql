/*
  Warnings:

  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `createdById` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `adminId` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `itPersonId` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `superAdminId` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `systemOwnerId` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `createdById` on the `tickets` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "tickets" DROP CONSTRAINT "tickets_createdById_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_adminId_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_createdById_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_itPersonId_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_superAdminId_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_systemOwnerId_fkey";

-- AlterTable
ALTER TABLE "tickets" DROP COLUMN "createdById",
ADD COLUMN     "createdById" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "createdById",
ADD COLUMN     "createdById" INTEGER,
DROP COLUMN "adminId",
ADD COLUMN     "adminId" INTEGER,
DROP COLUMN "itPersonId",
ADD COLUMN     "itPersonId" INTEGER,
DROP COLUMN "superAdminId",
ADD COLUMN     "superAdminId" INTEGER,
DROP COLUMN "systemOwnerId",
ADD COLUMN     "systemOwnerId" INTEGER,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_systemOwnerId_fkey" FOREIGN KEY ("systemOwnerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_superAdminId_fkey" FOREIGN KEY ("superAdminId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_itPersonId_fkey" FOREIGN KEY ("itPersonId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
