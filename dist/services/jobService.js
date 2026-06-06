"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJob = createJob;
exports.getJob = getJob;
exports.updateJob = updateJob;
const crypto_1 = __importDefault(require("crypto"));
const jobStore_1 = require("../storage/jobStore");
function createJob() {
    const jobId = crypto_1.default.randomUUID();
    const job = {
        jobId,
        status: "pending",
        progress: 0,
        rowsProcessed: 0,
        createdAt: new Date(),
    };
    jobStore_1.jobStore.set(jobId, job);
    return job;
}
function getJob(jobId) {
    return jobStore_1.jobStore.get(jobId);
}
function updateJob(jobId, updates) {
    const existingJob = jobStore_1.jobStore.get(jobId);
    if (!existingJob) {
        return;
    }
    // Preserve reference structure safely
    const updatedJob = {
        ...existingJob,
        ...updates,
        // Ensure nested objects don't accidentally wipe out elements if partially merged elsewhere
        result: updates.result ? { ...existingJob.result, ...updates.result } : existingJob.result,
    };
    // console.log("UPDATING JOB", jobId, updates);
    jobStore_1.jobStore.set(jobId, updatedJob);
}
