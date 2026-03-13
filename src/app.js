import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import retailerRoutes from "./routes/retailerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/retailers", retailerRoutes);
app.use("/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("Retailer Sales API running");
});

export default app;