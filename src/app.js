import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import retailerRoutes from "./routes/retailerRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/retailers", retailerRoutes);

app.get("/", (req, res) => {
  res.send("Retailer Sales API running");
});

export default app;