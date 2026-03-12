import bcrypt from "bcrypt";
import prisma from "../config/prisma.js";
import { generateToken } from "../services/jwtService.js";


export const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  try {
    //? Find the Sales Rep by username
    const user = await prisma.salesRep.findUnique({
      where: { username }
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
    const token = generateToken({ id: user.id, username: user.username });

    //? Respond
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        phone: user.phone
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
