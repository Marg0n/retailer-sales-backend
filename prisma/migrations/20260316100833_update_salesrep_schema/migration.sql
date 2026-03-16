/*
  Warnings:

  - You are about to drop the column `username` on the `SalesRep` table. All the data in the column will be lost.
  - The `role` column on the `SalesRep` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[email]` on the table `SalesRep` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `SalesRep` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'sr');

-- DropIndex
DROP INDEX "SalesRep_username_key";

-- AlterTable
ALTER TABLE "SalesRep" DROP COLUMN "username",
ADD COLUMN     "email" TEXT NOT NULL,
DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'sr';

-- CreateIndex
CREATE INDEX "Retailer_name_idx" ON "Retailer"("name");

-- CreateIndex
CREATE INDEX "Retailer_phone_idx" ON "Retailer"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "SalesRep_email_key" ON "SalesRep"("email");

-- CreateIndex
CREATE INDEX "SalesRepRetailer_retailerId_idx" ON "SalesRepRetailer"("retailerId");
