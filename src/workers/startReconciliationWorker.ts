import path from "path";
import { Worker } from "worker_threads";
import logger from "../config/logger";
import { updateJob } from "../services/jobService";
import { WorkerMessage } from "../types/worker.types";

export function startReconciliationWorker(
  jobId: string,
  sourceAPath: string,
  sourceBPath: string
): void {

  const workerPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "./reconciliationWorker.js")
      : path.resolve(__dirname, "./reconciliationWorker.ts");

  const worker = new Worker(workerPath, {
    workerData: {
      jobId,
      sourceAPath,
      sourceBPath,
    },
    execArgv: ["-r", "ts-node/register"],
  });

  worker.on("message", (message: WorkerMessage) => {

    if (message.type === "progress") {
      updateJob(jobId, {
        status: "processing",
        progress: message.progress,
        rowsProcessed: message.rowsProcessed,
      });

      return;
    }

    if (message.type === "completed") {
      updateJob(jobId, {
        status: "completed",
        progress: 100,
        completedAt: new Date(),
        result: message.result,
      });

      logger.info(`Job ${jobId} completed successfully`);

      return;
    }

    if (message.type === "failed") {
      updateJob(jobId, {
        status: "failed",
        error: message.error,
      });

      logger.error(`Job ${jobId} failed`);

      return;
    }
  });

  worker.on("error", (error) => {
    logger.error(`Worker crashed for job ${jobId}`, error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : typeof error === "string"
          ? error
          : "An unknown error occurred.";

    updateJob(jobId, {
      status: "failed",
      error: errorMessage,
    });
  });

  worker.on("exit", (code) => {
    if (code !== 0) {
      logger.error(`Worker exited with code ${code}`);

      updateJob(jobId, {
        status: "failed",
        error: `Worker exited with code ${code}`,
      });
    }
  });
}