import crypto from "crypto";
import { jobStore } from "../storage/jobStore";
import { ReconciliationJob, JobStatus } from "../types/job.types";

export function createJob(): ReconciliationJob {
  const jobId = crypto.randomUUID();

  const job: ReconciliationJob = {
    jobId,
    status: "pending",
    progress: 0,
    rowsProcessed: 0,
    createdAt: new Date(),
  };

  jobStore.set(jobId, job);
  return job;
}

export function getJob(jobId: string): ReconciliationJob | undefined {
  return jobStore.get(jobId);
}

export function updateJob(jobId: string, updates: Partial<ReconciliationJob>): void {

  const existingJob = jobStore.get(jobId);

  if (!existingJob) {
    return;
  }

  // Preserve reference structure safely
  const updatedJob: ReconciliationJob = {
    ...existingJob,
    ...updates,
    // Ensure nested objects don't accidentally wipe out elements if partially merged elsewhere
    result: updates.result ? { ...existingJob.result, ...updates.result } : existingJob.result,
  };

  // console.log("UPDATING JOB", jobId, updates);

  jobStore.set(jobId, updatedJob);
}