import fs from "fs";
import csv from "csv-parser";
import prisma from "../config/prisma.js";

//* import retailer data (Bulk import CSV)
export const importRetailers = async (req, res) => {
    const filePath = req.file.path;

    const retailers = [];

    fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row) => {
            retailers.push(row);
        })
        .on("end", async () => {
            try {
                const inserted = [];

                for (const r of retailers) {
                    const retailer = await prisma.retailer.create({
                        data: {
                            uid: r.uid,
                            name: r.name,
                            phone: r.phone,
                            points: Number(r.points),
                            routes: r.routes,
                        },
                    });

                    inserted.push(retailer);
                }

                res.json({
                    message: "Retailers imported",
                    count: inserted.length,
                });
            } catch (error) {
                res.status(500).json({
                    message: "Import failed",
                });
            }
        });
};
