import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { bulkAssignRetailers, importRetailers } from "../controllers/adminController.js";
import { authorize } from "../services/jwtService.js";

const router = express.Router();

router.post("/retailers/import", authorize("admin"), upload.single("file"), importRetailers);
router.post("/assignments/bulk", authorize("admin"), bulkAssignRetailers);

export default router;
