/*
  Warnings:

  - You are about to drop the column `amountStaked` on the `Pool` table. All the data in the column will be lost.
  - You are about to drop the column `stakerId` on the `Pool` table. All the data in the column will be lost.
  - You are about to drop the column `aiBalance` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Pool" DROP CONSTRAINT "Pool_stakerId_fkey";

-- AlterTable
ALTER TABLE "Pool" DROP COLUMN "amountStaked",
DROP COLUMN "stakerId";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "aiBalance",
ADD COLUMN     "emailed" BOOLEAN NOT NULL DEFAULT false;
