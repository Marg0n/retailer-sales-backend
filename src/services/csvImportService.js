import fs from "fs";
import csv from "csv-parser";
import prisma from "../config/prisma.js";

const csvImportService = async (filePath) => {
    const errors = [];

    try {
        const regions = new Set();
        const areas = new Set();
        const territories = new Set();
        const distributors = new Set();

        //* collect unique entities
        await new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csv())
                .on("data", (row) => {
                    if (row.region) regions.add(row.region.trim());

                    if (row.area && row.region) {
                        areas.add(`${row.area.trim()}|${row.region.trim()}`);
                    }

                    if (row.territory && row.area && row.region) {
                        territories.add(
                            `${row.territory.trim()}|${row.area.trim()}|${row.region.trim()}`
                        );
                    }

                    if (row.distributor) {
                        distributors.add(row.distributor.trim());
                    }
                })
                .on("end", resolve)
                .on("error", reject);
        });

        //? Regions
        await prisma.region.createMany({
            data: [...regions].map((name) => ({ name })),
            skipDuplicates: true,
        });

        const regionRecords = await prisma.region.findMany({
            where: {
                name: { in: [...regions] },
            },
        });

        const regionMap = new Map();
        regionRecords.forEach((r) => {
            regionMap.set(r.name, r.id);
        });

        //? Areas
        const areaData = [...areas].map((entry) => {
            const [name, regionName] = entry.split("|");

            return {
                name,
                regionId: regionMap.get(regionName),
            };
        });

        await prisma.area.createMany({
            data: areaData.filter((a) => a.regionId),
            skipDuplicates: true,
        });

        const areaRecords = await prisma.area.findMany({
            where: {
                OR: areaData
                    .filter((a) => a.regionId)
                    .map((a) => ({
                        name: a.name,
                        regionId: a.regionId,
                    })),
            },
        });

        const areaMap = new Map();
        areaRecords.forEach((a) => {
            areaMap.set(`${a.name}|${a.regionId}`, a.id);
        });

        //? Territories
        const territoryData = [...territories].map((entry) => {
            const [territoryName, areaName, regionName] = entry.split("|");
            const regionId = regionMap.get(regionName);
            const areaId = areaMap.get(`${areaName}|${regionId}`);

            return {
                name: territoryName,
                areaId,
            };
        });

        await prisma.territory.createMany({
            data: territoryData.filter((t) => t.areaId),
            skipDuplicates: true,
        });

        const territoryRecords = await prisma.territory.findMany({
            where: {
                OR: territoryData
                    .filter((t) => t.areaId)
                    .map((t) => ({
                        name: t.name,
                        areaId: t.areaId,
                    })),
            },
        });

        const territoryMap = new Map();
        territoryRecords.forEach((t) => {
            territoryMap.set(`${t.name}|${t.areaId}`, t.id);
        });

        //? Distributors
        await prisma.distributor.createMany({
            data: [...distributors].map((name) => ({ name })),
            skipDuplicates: true,
        });

        const distributorRecords = await prisma.distributor.findMany({
            where: {
                name: { in: [...distributors] },
            },
        });

        const distributorMap = new Map();
        distributorRecords.forEach((d) => {
            distributorMap.set(d.name, d.id);
        });

        //? retailer insert in batches by streaming
        const BATCH_SIZE = 1000;
        const MAX_PARALLEL = 5;

        let batch = [];
        const insertPromises = [];

        await new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csv())
                .on("data", async (row) => {
                    try {
                        if (!row.uid || !row.name) {
                            errors.push({
                                row,
                                error: "Missing required fields",
                            });
                            return;
                        }

                        const regionName = row.region?.trim();
                        const areaName = row.area?.trim();
                        const territoryName = row.territory?.trim();
                        const distributorName = row.distributor?.trim();

                        const regionId = regionMap.get(regionName);
                        const areaId = areaMap.get(`${areaName}|${regionId}`);
                        const territoryId = territoryMap.get(`${territoryName}|${areaId}`);
                        const distributorId = distributorMap.get(distributorName);

                        if (!regionId || !areaId || !territoryId || !distributorId) {
                            errors.push({
                                row,
                                error: "Invalid region/area/territory/distributor mapping",
                            });
                            return;
                        }

                        batch.push({
                            uid: row.uid.trim(),
                            name: row.name.trim(),
                            phone: row.phone?.trim() || null,
                            regionId,
                            areaId,
                            territoryId,
                            distributorId,
                            points: row.points ? Number(row.points) : null,
                            routes: row.routes?.trim() || null,
                            notes: row.notes?.trim() || null,
                        });

                        //? When Batch 
                        if (batch.length >= BATCH_SIZE) {
                            const insertBatch = [...batch];
                            batch = [];

                            insertPromises.push(
                                prisma.retailer.createMany({
                                    data: insertBatch,
                                    skipDuplicates: true,
                                })
                            );

                            //? Limiting parallel inserts
                            if (insertPromises.length >= MAX_PARALLEL) {
                                await Promise.all(insertPromises);
                                insertPromises.length = 0;
                            }
                        }
                    } catch (err) {
                        errors.push({
                            row,
                            error: err.message,
                        });
                    }
                })
                .on("end", async () => {
                    try {

                        //? Inserting rows
                        if (batch.length > 0) {
                            insertPromises.push(
                                prisma.retailer.createMany({
                                    data: batch,
                                    skipDuplicates: true,
                                })
                            );
                        }

                        //? Waiting for remaining inserts
                        await Promise.all(insertPromises);
                        resolve();
                    } catch (err) {
                        reject(err);
                    }
                })
                .on("error", reject);
        });

        //? unlink / remove file
        await fs.promises.unlink(filePath);

        return {
            message: "Retailers imported successfully",
            failed: errors.length,
            errors,
        };
    } catch (error) {
        await fs.promises.unlink(filePath);

        throw error;
    }
};

export default csvImportService;