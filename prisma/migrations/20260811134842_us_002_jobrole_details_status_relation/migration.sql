/*
  Warnings:

  - You are about to drop the column `status` on the `JobRole` table. All the data in the column will be lost.
  - Added the required column `description` to the `JobRole` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numberOfOpenPositions` to the `JobRole` table without a default value. This is not possible if the table is not empty.
  - Added the required column `responsibilities` to the `JobRole` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sharepointUrl` to the `JobRole` table without a default value. This is not possible if the table is not empty.
  - Added the required column `statusId` to the `JobRole` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "JobRole" DROP COLUMN "status",
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "numberOfOpenPositions" INTEGER NOT NULL,
ADD COLUMN     "responsibilities" TEXT NOT NULL,
ADD COLUMN     "sharepointUrl" TEXT NOT NULL,
ADD COLUMN     "statusId" INTEGER NOT NULL;

-- DropEnum
DROP TYPE "JobRoleStatus";

-- CreateTable
CREATE TABLE "Status" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Status_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "JobRole" ADD CONSTRAINT "JobRole_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "Status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
