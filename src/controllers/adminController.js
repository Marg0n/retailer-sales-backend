import fs from "fs";
import csv from "csv-parser";
import prisma from "../config/prisma.js";
import redisClient from "../config/redis.js";
import csvImportService from "../services/csvImportService.js";

//* import retailer data (Bulk import CSV)
export const importRetailers = async (req, res) => {

    if (!req.file) {
        return res.status(400).json({ message: "CSV file is required" });
    }

    try {

        const result = await csvImportService(req.file.path);

        res.json(result);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Retailer import failed"
        });

    }

};

//* Bulk assign retailers  to SalesRep 
export const bulkAssignRetailers = async (req, res) => {
    const { salesRepId, retailerUids } = req.body;

    if (!salesRepId || !Array.isArray(retailerUids) || retailerUids.length === 0) {
        return res.status(400).json({
            message: "salesRepId and retailerUids are required",
        });
    }

    try {

        const srId = Number(salesRepId);

        //? Removing duplicate UIDs
        const uniqueUids = [...new Set(retailerUids)];

        //? Validate Sales Rep exists
        const salesRep = await prisma.salesRep.findUnique({
            where: { id: srId },
        });

        if (!salesRep) {
            return res.status(404).json({
                message: "Sales Rep not found",
            });
        }

        //? Fetch retailer IDs by UID
        const retailers = await prisma.retailer.findMany({
            where: {
                uid: {
                    in: uniqueUids,
                },
            },
            select: {
                id: true,
                uid: true,
            },
        });

        if (retailers.length === 0) {
            return res.status(404).json({
                message: "No retailers found",
            });
        }

        //? Prepare assignments
        const assignments = retailers.map((r) => ({
            salesRepId: srId,
            retailerId: r.id,
        }));

        //? Bulk insert assignments
        const result = await prisma.salesRepRetailer.createMany({
            data: assignments,
            skipDuplicates: true,
        });

        //! assignments changed, cached retailer lists needs to clear 
        const keys = await redisClient.keys(`retailers:${salesRepId}:*`);

        if (keys.length) {
            await redisClient.del(...keys);
        }


        res.json({
            message: "Retailers assigned successfully",
            assigned: result.count,
            requested: uniqueUids.length,
        });

    }
    catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Assignment failed",
        });
    }
};


