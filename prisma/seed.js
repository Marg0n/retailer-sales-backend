import bcrypt from "bcrypt";
import prisma from "../src/config/prisma.js";

const seed = async () => {
    const passwordHash = await bcrypt.hash("pass123", 10);

    // await prisma.salesRep.deleteMany({ where: { username: "sr1" } });

    // await prisma.salesRep.upsert({
    //     where: { username: "sr1" },
    //     update: {}, 
    //     create: {
    //         username: "admin",
    //         name: "Admin Doe",
    //         phone: "01710000001",
    //         passwordHash,
    //     },
    // });
    await prisma.salesRep.create({
        data: {
            username: "admin",
            name: "Admin Doe",
            phone: "01710000002",
            passwordHash,
        }
    });


    console.log("Seeded sales rep");
};

seed()
    .catch(e => console.error(e))
    .finally(() => process.exit());
