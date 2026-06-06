import { ReconciliationJob } from "../types/job.types";
import * as fs from "fs";
import logger from "../config/logger";

export const jobStore = new Map<string, ReconciliationJob>();

// 24 hours in milliseconds (Change this to your preferred duration)
const JOB_EXPIRATION_MS = 24 * 60 * 60 * 1000; 

/**
 * Periodically purges jobs older than XX hours from memory and clears their file outputs from disk.
 * Satisfies: "ram doesnt get filled up", "add job expiration policy"
 */
export function startJobCleanupSweeper(intervalMs: number = 60 * 60 * 1000): NodeJS.Timeout {
  logger.info("Background Job Cleanup Sweeper initialized.");

  return setInterval(() => {
    const now = Date.now();
    let purgedCount = 0;

    for (const [jobId, job] of jobStore.entries()) {
      if (now - job.createdAt.getTime() > JOB_EXPIRATION_MS) {
        
        // 1. Delete associated discrepancies file from disk if it exists
        if (job.result?.detailsFilePath && fs.existsSync(job.result.detailsFilePath)) {
          try {
            fs.unlinkSync(job.result.detailsFilePath);
          } catch (err) {
            logger.error(`Failed to delete details file for expired job ${jobId}`, err);
          }
        }

        // 2. Clear from memory map
        jobStore.delete(jobId);
        purgedCount++;
      }
    }

    if (purgedCount > 0) {
      logger.info(`Sweeper run executed: Cleaned up ${purgedCount} expired reconciliation jobs.`);
    }
  }, intervalMs);
}