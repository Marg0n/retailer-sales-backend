import prisma from "../config/prisma.js";

//* Paginated assigned retailers
export const getAssignedRetailers = async (req, res) => {
    const userId = req.user.id;
    const { page = 1, limit = 10, search, region, area, distributor, territory } = req.query;

    const skip = (page - 1) * limit;

    const where = {
        salesRepRetailers: { some: { salesRepId: userId } },
        ...(search ? { OR: [{ name: { contains: search } }, { uid: { contains: search } }, { phone: { contains: search } }] } : {}),
        ...(region ? { regionId: parseInt(region) } : {}),
        ...(area ? { areaId: parseInt(area) } : {}),
        ...(distributor ? { distributorId: parseInt(distributor) } : {}),
        ...(territory ? { territoryId: parseInt(territory) } : {}),
    };

    const retailers = await prisma.retailer.findMany({
        where,
        skip: Number(skip),
        take: Number(limit),
    });

    res.json({ page, limit, data: retailers });
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
                salesRepRetailers: {
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
                salesRepRetailers: {
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
