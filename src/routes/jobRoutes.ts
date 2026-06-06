import { Router } from "express";
import { getJobStatus, getJobResults } from "../controllers/jobsController";

const router = Router();

// Status endpoint
router.get("/:jobId", getJobStatus);

// Results endpoint
router.get("/:jobId/results", getJobResults);

export default router;