import prisma from "../config/prisma.js";

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
