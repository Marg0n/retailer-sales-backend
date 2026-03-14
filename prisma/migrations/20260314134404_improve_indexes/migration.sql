/*
  Warnings:

  - A unique constraint covering the columns `[name,regionId]` on the table `Area` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Distributor` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Region` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,areaId]` on the table `Territory` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Retailer" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "Area_name_regionId_key" ON "Area"("name", "regionId");

-- CreateIndex
CREATE UNIQUE INDEX "Distributor_name_key" ON "Distributor"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Region_name_key" ON "Region"("name");

-- CreateIndex
CREATE INDEX "Retailer_regionId_idx" ON "Retailer"("regionId");

-- CreateIndex
CREATE INDEX "Retailer_areaId_idx" ON "Retailer"("areaId");

-- CreateIndex
CREATE INDEX "Retailer_territoryId_idx" ON "Retailer"("territoryId");

-- CreateIndex
CREATE INDEX "Retailer_distributorId_idx" ON "Retailer"("distributorId");

-- CreateIndex
CREATE UNIQUE INDEX "Territory_name_areaId_key" ON "Territory"("name", "areaId");
