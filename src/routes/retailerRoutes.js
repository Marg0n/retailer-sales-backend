import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getAssignedRetailers, getRetailerDetails, updateRetailer } from "../controllers/retailerController.js";

const router = express.Router();

router.use(protect);

router.get("/retailers", getAssignedRetailers);
router.get("/retailers/{uid}", getRetailerDetails);
router.patch("/retailers/{uid}", updateRetailer);

export default router;
