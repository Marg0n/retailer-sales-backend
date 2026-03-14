import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getAssignedRetailers, getRetailerDetails, updateRetailer } from "../controllers/retailerController.js";

const router = express.Router();

router.use(protect);

router.get("/", getAssignedRetailers);
router.get("/{uid}", getRetailerDetails);
router.patch("/{uid}", updateRetailer);

export default router;
