import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const prisma = new PrismaClient();

//* token check
export const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401);
            throw new Error("Not authorized");
        }

        const token = authHeader.split(" ")[1];

        const decoded = await jwt.verify(token, JWT_SECRET);

        const salesRep = await prisma.salesRep.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            },
        });

        if (!salesRep) {
            res.status(401);
            throw new Error("Not authorized");
        }

        req.user = salesRep;
        next();
    } catch (error) {
        next(error);
    }
};


//* role check
export const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                res.status(401);
                throw new Error("User not authenticated");
            }

            if (!allowedRoles.includes(req.user.role)) {
                res.status(403);
                throw new Error(
                    `Forbidden access: your role '${req.user.role}' is not allowed`
                );
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};