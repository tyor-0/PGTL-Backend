"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startReconciliationWorker = startReconciliationWorker;
const path_1 = __importDefault(require("path"));
const worker_threads_1 = require("worker_threads");
const logger_1 = __importDefault(require("../config/logger"));
const jobService_1 = require("../services/jobService");
function startReconciliationWorker(jobId, sourceAPath, sourceBPath) {
    const workerPath = process.env.NODE_ENV === "production"
        ? path_1.default.resolve(__dirname, "./reconciliationWorker.js")
        : path_1.default.resolve(__dirname, "./reconciliationWorker.ts");
    const worker = new worker_threads_1.Worker(workerPath, {
        workerData: {
            jobId,
            sourceAPath,
            sourceBPath,
        },
        execArgv: ["-r", "ts-node/register"],
    });
    worker.on("message", (message) => {
        if (message.type === "progress") {
            (0, jobService_1.updateJob)(jobId, {
                status: "processing",
                progress: message.progress,
                rowsProcessed: message.rowsProcessed,
            });
            return;
        }
        if (message.type === "completed") {
            (0, jobService_1.updateJob)(jobId, {
                status: "completed",
                progress: 100,
                completedAt: new Date(),
                result: message.result,
            });
            logger_1.default.info(`Job ${jobId} completed successfully`);
            return;
        }
        if (message.type === "failed") {
            (0, jobService_1.updateJob)(jobId, {
                status: "failed",
                error: message.error,
            });
            logger_1.default.error(`Job ${jobId} failed`);
            return;
        }
    });
    worker.on("error", (error) => {
        logger_1.default.error(`Worker crashed for job ${jobId}`, error);
        const errorMessage = error instanceof Error
            ? error.message
            : typeof error === "string"
                ? error
                : "An unknown error occurred.";
        (0, jobService_1.updateJob)(jobId, {
            status: "failed",
            error: errorMessage,
        });
    });
    worker.on("exit", (code) => {
        if (code !== 0) {
            logger_1.default.error(`Worker exited with code ${code}`);
            (0, jobService_1.updateJob)(jobId, {
                status: "failed",
                error: `Worker exited with code ${code}`,
            });
        }
    });
}
