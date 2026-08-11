/*
  Warnings:

  - Changed the type of `status` on the `JobRole` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "JobRoleStatus" AS ENUM ('OPEN', 'CLOSED');

-- AlterTable
ALTER TABLE "JobRole"
  ALTER COLUMN "status" TYPE "JobRoleStatus"
  USING ("status"::"JobRoleStatus");
