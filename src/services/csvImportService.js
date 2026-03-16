import fs from "fs";
import csv from "csv-parser";

const csvImportService = async () => {
    const filePath = req.file.path;
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

                    if (row.territory && row.area) {
                        territories.add(`${row.territory.trim()}|${row.area.trim()}`);
                    }

                    if (row.distributor) {
                        distributors.add(row.distributor.trim());
                    }

                })
                .on("end", resolve)
                .on("error", reject);

        });

        //? Inserting Regions
        await prisma.region.createMany({
            data: [...regions].map((name) => ({ name })),
            skipDuplicates: true,
        });

        const regionRecords = await prisma.region.findMany({
            where: {
                name: {
                    in: [...regions],
                },
            },
        });

        const regionMap = new Map();
        regionRecords.forEach((r) => regionMap.set(r.name, r.id));

        //? Inserting Areas
        const areaData = [...areas].map((entry) => {

            const [name, regionName] = entry.split("|");

            return {
                name,
                regionId: regionMap.get(regionName),
            };

        });

        await prisma.area.createMany({
            data: areaData,
            skipDuplicates: true,
        });

        const areaRecords = await prisma.area.findMany({
            where: {
                OR: [...areas].map((entry) => {
                    const [name, regionName] = entry.split("|");

                    return {
                        name,
                        region: {
                            name: regionName,
                        },
                    };
                }),
            },
            include: {
                region: true,
            },
        });

        const areaMap = new Map();
        areaRecords.forEach((a) =>
            areaMap.set(`${a.name}|${a.regionId}`, a.id)
        );

        //? Inserting Territories
        const territoryData = [...territories].map((entry) => {

            const [name, areaName] = entry.split("|");

            const area = areaRecords.find((a) => a.name === areaName);

            return {
                name,
                areaId: area?.id,
            };

        });

        await prisma.territory.createMany({
            data: territoryData,
            skipDuplicates: true,
        });

        const territoryRecords = await prisma.territory.findMany({
            where: {
                name: {
                    in: [...territories].map((t) => t.split("|")[0]),
                },
            },
        });

        const territoryMap = new Map();
        territoryRecords.forEach((t) =>
            territoryMap.set(`${t.name}|${t.areaId}`, t.id)
        );

        //? Inserting Distributors
        await prisma.distributor.createMany({
            data: [...distributors].map((name) => ({ name })),
            skipDuplicates: true,
        });

        const distributorRecords = await prisma.distributor.findMany({
            where: {
                name: {
                    in: [...distributors],
                },
            },
        });

        const distributorMap = new Map();
        distributorRecords.forEach((d) =>
            distributorMap.set(d.name, d.id)
        );

        //* Stream again for retailer inserts

        const BATCH_SIZE = 1000;
        const MAX_PARALLEL = 5;

        let batch = [];
        const insertPromises = [];

        await new Promise((resolve, reject) => {

            fs.createReadStream(filePath)
                .pipe(csv())

                .on("data", async (row) => {

                    try {

                        if (!row.uid || !row.name || !row.phone) {

                            errors.push({
                                row,
                                error: "Missing required fields",
                            });

                            return;
                        }

                        const regionId = regionMap.get(row.region?.trim());

                        const areaId = areaMap.get(
                            `${row.area?.trim()}|${regionId}`
                        );

                        const territoryId = territoryMap.get(
                            `${row.territory?.trim()}|${areaId}`
                        );

                        const distributorId = distributorMap.get(
                            row.distributor?.trim()
                        );

                        batch.push({
                            uid: row.uid.trim(),
                            name: row.name.trim(),
                            phone: row.phone.trim(),
                            regionId,
                            areaId,
                            territoryId,
                            distributorId,
                            points: Number(row.points || 0),
                            routes: row.routes || null,
                        });

                        //? When Batch ready
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

                        //? Inserting remaining rows
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

        //? Removing uploaded CSV
        await fs.promises.unlink(filePath);

        return res.json({
            message: "Retailers imported successfully",
            failed: errors.length,
            errors,
        });

    } catch (error) {

        console.error("CSV Import Error:", error);

        await fs.promises.unlink(filePath);

        return res.status(500).json({
            message: "Retailer import failed",
        });

    }
}

export default csvImportService;