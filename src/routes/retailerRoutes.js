import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getAssignedRetailers, getRetailerDetails } from "../controllers/retailerController.js";

const router = express.Router();

router.use(protect);

router.get("/retailers", getAssignedRetailers);
router.get("/retailers/{uid}", getRetailerDetails);

export default router;
