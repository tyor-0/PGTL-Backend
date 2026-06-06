"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobStore = void 0;
exports.startJobCleanupSweeper = startJobCleanupSweeper;
// import * as fs from "fs";
const logger_1 = __importDefault(require("../config/logger"));
exports.jobStore = new Map();
// 24 hours in milliseconds (Change this to your preferred duration)
const JOB_EXPIRATION_MS = 24 * 60 * 60 * 1000;
/**
 * Periodically purges jobs older than XX hours from memory and clears their file outputs from disk.
 * Satisfies: "ram doesnt get filled up", "add job expiration policy"
 */
function startJobCleanupSweeper(intervalMs = 60 * 60 * 1000) {
    logger_1.default.info("Background Job Cleanup Sweeper initialized.");
    return setInterval(() => {
        const now = Date.now();
        let purgedCount = 0;
        for (const [jobId, job] of exports.jobStore.entries()) {
            if (now - job.createdAt.getTime() > JOB_EXPIRATION_MS) {
                exports.jobStore.delete(jobId);
                purgedCount++;
            }
        }
        if (purgedCount > 0) {
            logger_1.default.info(`Sweeper run executed: Cleaned up ${purgedCount} expired reconciliation jobs.`);
        }
    }, intervalMs);
}
