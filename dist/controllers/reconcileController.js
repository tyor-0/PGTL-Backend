"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reconcileFiles = reconcileFiles;
const logger_1 = __importDefault(require("../config/logger"));
const jobService_1 = require("../services/jobService");
const startReconciliationWorker_1 = require("../workers/startReconciliationWorker");
//processReconciliation job
// WHAT THIS LOGIC DOES:
// Handles upload requests and starts reconciliation asynchronously.
// WHY IT EXISTS:
// The request should return immediately instead of waiting for reconciliation.
// HOW IT WORKS:
// 1. Accept upload
// 2. Create job
// 3. Spawn worker thread
// 4. Return jobId immediately
async function reconcileFiles(req, res) {
    try {
        const files = req.files;
        // Defensive upload validation
        if (!files?.sourceA || !files?.sourceB) {
            logger_1.default.error("Both files are required");
            return res.status(400).json({
                success: false,
                message: "Both sourceA and sourceB files are required",
            });
        }
        const sourceAPath = files.sourceA[0].path;
        const sourceBPath = files.sourceB[0].path;
        // Create job record
        const job = (0, jobService_1.createJob)();
        logger_1.default.info(`Job ${job.jobId} created`);
        // logger.info("BEFORE WORKER");
        // Start background worker thread
        (0, startReconciliationWorker_1.startReconciliationWorker)(job.jobId, sourceAPath, sourceBPath);
        // logger.info("AFTER WORKER");
        // Immediate response
        return res.status(202).json({
            success: true,
            message: "Reconciliation job started successfully",
            data: {
                jobId: job.jobId,
                status: job.status,
                progress: job.progress,
            },
        });
    }
    catch (error) {
        logger_1.default.error("Failed to create reconciliation job", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
