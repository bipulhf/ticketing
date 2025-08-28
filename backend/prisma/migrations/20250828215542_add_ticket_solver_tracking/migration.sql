-- AlterTable
ALTER TABLE "archived_tickets" ADD COLUMN     "solvedAt" TIMESTAMP(3),
ADD COLUMN     "solvedById" INTEGER;

-- AlterTable
ALTER TABLE "tickets" ADD COLUMN     "solvedAt" TIMESTAMP(3),
ADD COLUMN     "solvedById" INTEGER;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_solvedById_fkey" FOREIGN KEY ("solvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
