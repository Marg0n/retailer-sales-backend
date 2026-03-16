import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {

    const adminPassword = await bcrypt.hash("admin123", 10);
    const srPassword = await bcrypt.hash("sr123", 10);

    const admin = await prisma.salesRep.upsert({
        where: { email: "admin@example.com" },
        update: {},
        create: {
            name: "Admin User",
            email: "admin@example.com",
            phone: "01712345678",
            passwordHash: adminPassword,
            role: Role.admin,
        },
    });

    const salesRep = await prisma.salesRep.upsert({
        where: { email: "sr1@example.com" },
        update: {},
        create: {
            name: "Sales User",
            email: "sr1@example.com",
            phone: "01723456789",
            passwordHash: srPassword,
            role: Role.sr,
        },
    });

    const region = await prisma.region.upsert({
        where: { name: "Dhaka" },
        update: {},
        create: { name: "Dhaka" },
    });

    const area = await prisma.area.upsert({
        where: {
            name_regionId: {
                name: "Gulshan",
                regionId: region.id,
            },
        },
        update: {},
        create: {
            name: "Gulshan",
            regionId: region.id,
        },
    });

    const territory = await prisma.territory.upsert({
        where: {
            name_areaId: {
                name: "Gulshan-1",
                areaId: area.id,
            },
        },
        update: {},
        create: {
            name: "Gulshan-1",
            areaId: area.id,
        },
    });

    const distributor = await prisma.distributor.upsert({
        where: { name: "ABC Distributor" },
        update: {},
        create: { name: "ABC Distributor" },
    });

    const retailer = await prisma.retailer.upsert({
        where: { uid: "RTL-001" },
        update: {},
        create: {
            uid: "RTL-001",
            name: "Retailer One",
            phone: "01700000000",
            points: 100,
            routes: "Route A",
            regionId: region.id,
            areaId: area.id,
            territoryId: territory.id,
            distributorId: distributor.id,
        },
    });

    const salesRepRetailer = await prisma.salesRepRetailer.upsert({
        where: {
            salesRepId_retailerId: {
                salesRepId: salesRep.id,
                retailerId: retailer.id,
            },
        },
        update: {},
        create: {
            salesRepId: salesRep.id,
            retailerId: retailer.id,
        },
    });

    console.log("Seed completed");
    console.log({ admin, salesRep, region, area, territory, distributor, retailer, salesRepRetailer });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });