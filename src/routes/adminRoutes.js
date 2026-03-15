import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { bulkAssignRetailers, importRetailers } from "../controllers/adminController.js";

const router = express.Router();

router.post("/retailers/import", upload.single("file"), importRetailers);
router.post("/assignments/bulk", bulkAssignRetailers);

export default router;
