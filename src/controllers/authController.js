import bcrypt from "bcrypt";
import prisma from "../config/prisma.js";
import { generateToken } from "../services/jwtService.js";


export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "email and password are required" });
  }

  try {
    //? Find the Sales Rep by email
    const user = await prisma.salesRep.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    //? Compare passwords
    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    //? Create JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
    });

    //? Respond
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
