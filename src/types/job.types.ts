import { ReconciliationResult } from "./reconciliation.types";

export type JobStatus = "pending" | "processing" | "completed" | "failed";

export interface ReconciliationJob {
  jobId: string;
  status: JobStatus;
  progress: number;
  rowsProcessed: number;
  createdAt: Date;
  completedAt?: Date;
  error?: string;
  result?: ReconciliationResult;
}