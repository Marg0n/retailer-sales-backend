import prisma from "../config/prisma.js";

//* Paginated assigned retailers
export const getAssignedRetailers = async (req, res) => {

    try {
        const userId = req.user.id;

        let {
            page = 1,
            limit = 10,
            search,
            region,
            area,
            distributor,
            territory,
        } = req.query;

        //? Convert safely to numbers
        page = Math.max(parseInt(page) || 1, 1);
        limit = Math.min(parseInt(limit) || 10, 50);

        const skip = (page - 1) * limit;

        //? Build dynamic filter
        const where = {
            assignments: {
                some: {
                    salesRepId: userId,
                },
            },

            ...(search && {
                OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    { uid: { contains: search, mode: "insensitive" } },
                    { phone: { contains: search } },
                ],
            }),

            ...(region && { regionId: parseInt(region) }),
            ...(area && { areaId: parseInt(area) }),
            ...(distributor && { distributorId: parseInt(distributor) }),
            ...(territory && { territoryId: parseInt(territory) }),
        };

        //? Fetching data + total count in parallel
        const [retailers, total] = await Promise.all([
            prisma.retailer.findMany({
                where,
                skip,
                take: limit,

                include: {
                    region: true,
                    area: true,
                    territory: true,
                    distributor: true,
                },

                orderBy: {
                    name: "asc",
                },
            }),

            prisma.retailer.count({ where }),
        ]);

        res.json({
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            data: retailers,
        });
    }
    catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Error fetching retailers",
        });
    }
};

//* Get Retailer detail by id
export const getRetailerDetails = async (req, res) => {
    const { uid } = req.params;

    //? SR id
    const userId = req.user.id;

    try {
        const retailer = await prisma.retailer.findFirst({
            where: {
                uid,
                assignments: {
                    some: {
                        salesRepId: userId,
                    },
                },
            },
            include: {
                region: true,
                area: true,
                territory: true,
                distributor: true,
            },
        });

        if (!retailer) {
            return res.status(404).json({ message: "Retailer not found or not assigned to you" });
        }

        res.json(retailer);
    } catch (error) {
        res.status(500).json({ message: "Error fetching retailer details" });
    }
};

//* Update allowed fields
export const updateRetailer = async (req, res) => {
    const { uid } = req.params;

    //? SR id
    const userId = req.user.id;

    const { points, routes, notes } = req.body;

    try {
        const retailer = await prisma.retailer.findFirst({
            where: {
                uid,
                assignments: {
                    some: {
                        salesRepId: userId,
                    },
                },
            },
        });

        if (!retailer) {
            return res.status(404).json({
                message: "Retailer not found or not assigned to you",
            });
        }

        const updatedRetailer = await prisma.retailer.update({
            where: {
                id: retailer.id,
            },
            data: {
                points,
                routes,
                notes,
            },
        });

        res.json(updatedRetailer);
    } catch (error) {
        res.status(500).json({
            message: "Error updating retailer",
        });
    }
};
