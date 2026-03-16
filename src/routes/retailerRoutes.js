import express from "express";
import { authorize, protect } from "../middleware/authMiddleware.js";
import { getAssignedRetailers, getRetailerDetails, updateRetailer } from "../controllers/retailerController.js";

const router = express.Router();

router.use(protect);

router.get("/", authorize("admin", "sr"), getAssignedRetailers);
router.get("/{uid}", authorize("admin", "sr"), getRetailerDetails);
router.patch("/{uid}", authorize("admin", "sr"), updateRetailer);

export default router;
