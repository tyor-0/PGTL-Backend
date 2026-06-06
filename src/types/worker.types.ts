import { ReconciliationResult } from "./reconciliation.types";

export interface ReconciliationWorkerData {
  jobId: string;
  sourceAPath: string;
  sourceBPath: string;
}

export type WorkerMessage =
  | {
      type: "progress";
      progress: number;
      rowsProcessed: number;
    }
  | {
      type: "completed";
      result: ReconciliationResult;
    }
  | {
      type: "failed";
      error: string;
    };