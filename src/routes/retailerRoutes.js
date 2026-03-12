import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getAssignedRetailers } from "../controllers/retailerController.js";

const router = express.Router();

router.use(protect);

router.get("/", getAssignedRetailers);

export default router;
