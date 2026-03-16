import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

//* token check
export const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401);
            throw new Error("Not authorized");
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, JWT_SECRET);

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
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403);
            return next(new Error("Forbidden"));
        }

        next();
    };
};
