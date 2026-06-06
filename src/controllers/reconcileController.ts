import { Request, Response } from "express";
import logger from "../config/logger";
import { createJob } from "../services/jobService";
import { startReconciliationWorker } from "../workers/startReconciliationWorker";

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

export async function reconcileFiles(req: Request, res: Response): Promise<Response> {

  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[]; };

    // Defensive upload validation
    if ( !files?.sourceA || !files?.sourceB ) {

      logger.error( "Both files are required" );
      return res.status(400).json({
        success: false,
        message: "Both sourceA and sourceB files are required",
      });
    }

    const sourceAPath = files.sourceA[0].path;

    const sourceBPath = files.sourceB[0].path;

    // Create job record
    const job = createJob();

    logger.info( `Job ${job.jobId} created` );

    // logger.info("BEFORE WORKER");

    // Start background worker thread
    startReconciliationWorker(job.jobId, sourceAPath, sourceBPath);

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

  } catch (error) {
    logger.error( "Failed to create reconciliation job", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}