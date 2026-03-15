import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { importRetailers } from "../controllers/adminController.js";

const router = express.Router();

router.post("/retailers/import", upload.single("file"), importRetailers);

export default router;
