import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import {
    bulkAssignRetailers,
    importRetailers,
    createRegion,
    getRegions,
    updateRegion,
    deleteRegion,
    createArea,
    getAreas,
    updateArea,
    deleteArea,
    createDistributor,
    getDistributors,
    updateDistributor,
    deleteDistributor,
    createTerritory,
    getTerritories,
    updateTerritory,
    deleteTerritory,
} from "../controllers/adminController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(authorize("admin"));

// ----- Region -----
router.post("/regions", createRegion);
router.get("/regions", getRegions);
router.put("/regions/:id", updateRegion);
router.delete("/regions/:id", deleteRegion);

// ----- Area -----
router.post("/areas", createArea);
router.get("/areas", getAreas);
router.put("/areas/:id", updateArea);
router.delete("/areas/:id", deleteArea);

// ----- Distributor -----
router.post("/distributors", createDistributor);
router.get("/distributors", getDistributors);
router.put("/distributors/:id", updateDistributor);
router.delete("/distributors/:id", deleteDistributor);

// ----- Territory -----
router.post("/territories", createTerritory);
router.get("/territories", getTerritories);
router.put("/territories/:id", updateTerritory);
router.delete("/territories/:id", deleteTerritory);

router.post("/retailers/import", upload.single("file"), importRetailers);
router.post("/assignments/bulk", bulkAssignRetailers);

export default router;
