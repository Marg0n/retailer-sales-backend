import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import retailerRoutes from "./routes/retailerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Retailer Sales API running");
});

//? routes
app.use("/auth", authRoutes);
app.use("/retailers", retailerRoutes);
app.use("/admin", adminRoutes);


//? 404 handler
app.use(notFound);

//? global error handler
app.use(errorHandler);

export default app;