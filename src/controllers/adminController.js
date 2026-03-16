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

// -------------------- REGION --------------------
export const createRegion = async (req, res) => {
    try {
        const { name } = req.body;
        const region = await prisma.region.create({ data: { name } });
        res.status(201).json(region);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getRegions = async (req, res) => {
    try {
        const regions = await prisma.region.findMany();
        res.json(regions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateRegion = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const region = await prisma.region.update({
            where: { id: Number(id) },
            data: { name },
        });
        res.json(region);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteRegion = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.region.delete({ where: { id: Number(id) } });
        res.json({ message: "Region deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// -------------------- AREA --------------------
export const createArea = async (req, res) => {
    try {
        const { name, regionId } = req.body;
        const area = await prisma.area.create({ data: { name, regionId: Number(regionId) } });
        res.status(201).json(area);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAreas = async (req, res) => {
    try {
        const areas = await prisma.area.findMany({ include: { region: true } });
        res.json(areas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateArea = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, regionId } = req.body;
        const area = await prisma.area.update({
            where: { id: Number(id) },
            data: { name, regionId: Number(regionId) },
        });
        res.json(area);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteArea = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.area.delete({ where: { id: Number(id) } });
        res.json({ message: "Area deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// -------------------- DISTRIBUTOR --------------------
export const createDistributor = async (req, res) => {
    try {
        const { name } = req.body;
        const distributor = await prisma.distributor.create({ data: { name } });
        res.status(201).json(distributor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getDistributors = async (req, res) => {
    try {
        const distributors = await prisma.distributor.findMany();
        res.json(distributors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateDistributor = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const distributor = await prisma.distributor.update({
            where: { id: Number(id) },
            data: { name },
        });
        res.json(distributor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteDistributor = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.distributor.delete({ where: { id: Number(id) } });
        res.json({ message: "Distributor deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// -------------------- TERRITORY --------------------
export const createTerritory = async (req, res) => {
    try {
        const { name, areaId } = req.body;
        const territory = await prisma.territory.create({ data: { name, areaId: Number(areaId) } });
        res.status(201).json(territory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getTerritories = async (req, res) => {
    try {
        const territories = await prisma.territory.findMany({ include: { area: true } });
        res.json(territories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateTerritory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, areaId } = req.body;
        const territory = await prisma.territory.update({
            where: { id: Number(id) },
            data: { name, areaId: Number(areaId) },
        });
        res.json(territory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteTerritory = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.territory.delete({ where: { id: Number(id) } });
        res.json({ message: "Territory deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
