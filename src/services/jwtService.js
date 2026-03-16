import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

const JWT_SECRET = process.env.JWT_SECRET;

export const generateToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });
};

// export const verifyToken = (token) => {
//     return jwt.verify(token, JWT_SECRET);
// };

