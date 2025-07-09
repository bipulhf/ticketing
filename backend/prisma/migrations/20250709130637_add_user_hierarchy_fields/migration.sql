-- AlterTable
ALTER TABLE "users" ADD COLUMN     "adminId" TEXT,
ADD COLUMN     "itPersonId" TEXT,
ADD COLUMN     "superAdminId" TEXT,
ADD COLUMN     "systemOwnerId" TEXT;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_systemOwnerId_fkey" FOREIGN KEY ("systemOwnerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_superAdminId_fkey" FOREIGN KEY ("superAdminId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_itPersonId_fkey" FOREIGN KEY ("itPersonId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
