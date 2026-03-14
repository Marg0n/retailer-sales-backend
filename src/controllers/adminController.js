import fs from "fs";
import csv from "csv-parser";
import prisma from "../config/prisma.js";

//* import retailer data (Bulk import CSV)
export const importRetailers = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "CSV file is required" });
    }

    const filePath = req.file.path;

    const retailers = [];
    const errors = [];

    fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row) => {
            retailers.push(row);
        })
        .on("end", async () => {
            try {

                if (retailers.length === 0) {
                    return res.status(400).json({ message: "CSV file is empty" });
                }

                //? Extract unique values
                const regions = new Set();
                const areas = new Set();
                const territories = new Set();
                const distributors = new Set();

                for (const row of retailers) {
                    if (row.region) regions.add(row.region.trim());

                    if (row.area && row.region)
                        areas.add(`${row.area.trim()}|${row.region.trim()}`);

                    if (row.territory && row.area)
                        territories.add(`${row.territory.trim()}|${row.area.trim()}`);

                    if (row.distributor)
                        distributors.add(row.distributor.trim());
                }

                //? Insert Regions
                await prisma.region.createMany({
                    data: [...regions].map((name) => ({ name })),
                    skipDuplicates: true,
                });

                const regionRecords = await prisma.region.findMany();

                const regionMap = new Map();
                regionRecords.forEach((r) => regionMap.set(r.name, r.id));

                //? INsert areas
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

                const areaRecords = await prisma.area.findMany();

                const areaMap = new Map();
                areaRecords.forEach((a) =>
                    areaMap.set(`${a.name}|${a.regionId}`, a.id)
                );

                //? Insert Territories
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

                const territoryRecords = await prisma.territory.findMany();

                const territoryMap = new Map();
                territoryRecords.forEach((t) =>
                    territoryMap.set(`${t.name}|${t.areaId}`, t.id)
                );

                //? Insert Distributors
                await prisma.distributor.createMany({
                    data: [...distributors].map((name) => ({ name })),
                    skipDuplicates: true,
                });

                const distributorRecords = await prisma.distributor.findMany();

                const distributorMap = new Map();
                distributorRecords.forEach((d) =>
                    distributorMap.set(d.name, d.id)
                );

                //? Prepare Retailers

                const retailersToInsert = [];

                for (const row of retailers) {

                    //? Basic missing validation
                    if (!row.uid || !row.name || !row.phone) {
                        errors.push({
                            row,
                            error: "Missing required fields",
                        });
                        continue;
                    }

                    const regionId = regionMap.get(row.region?.trim());

                    const areaId = areaMap.get(
                        `${row.area?.trim()}|${regionId}`
                    );

                    const territoryId = territoryRecords.find(
                        (t) => t.name === row.territory && t.areaId === areaId
                    )?.id;

                    const distributorId = distributorMap.get(
                        row.distributor?.trim()
                    );

                    retailersToInsert.push({
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
                }

                //? Bulk insert the retailers
                const result = await prisma.retailer.createMany({
                    data: retailersToInsert,
                    skipDuplicates: true,
                });

                //? Delete uploaded CSV
                await fs.promises.unlink(filePath);

                res.json({
                    inserted: result.count,
                    failed: errors.length,
                    totalRows: retailers.length,
                    errors,
                });
            } catch (error) {

                console.error("CSV Import Error:", error);

                await fs.promises.unlink(filePath);

                res.status(500).json({
                    message: "Retailer import failed",
                });
            }
        });
};
