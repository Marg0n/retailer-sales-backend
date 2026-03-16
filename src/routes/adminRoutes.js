import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { bulkAssignRetailers, importRetailers } from "../controllers/adminController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/retailers/import", authorize("admin"), upload.single("file"), importRetailers);
router.post("/assignments/bulk", authorize("admin"), bulkAssignRetailers);

export default router;
