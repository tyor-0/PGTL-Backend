
import { runReconciliationPipeline, } from "../services/reconciliationPipelineService";
import { parentPort, workerData, } from "worker_threads";
import { ReconciliationResult } from "../types/reconciliation.types";
import { ReconciliationWorkerData, } from "../types/worker.types";

// console.log("WORKER FILE EXECUTED");

// WHAT THIS LOGIC DOES:
// Runs reconciliation completely outside the main Express thread.

// WHY IT EXISTS:
// Large reconciliation jobs are CPU-heavy and can freeze the main server.

// HOW IT WORKS:
// Worker thread receives:
// - sourceA path
// - sourceB path
// - jobId

// Then processes independently and sends progress/results back to the main thread.

// Safety Check: Crash early if the master thread failed to supply correct paths

// console.log("BEFORE VALIDATION");

if (!workerData?.sourceAPath || !workerData?.sourceBPath || !workerData?.jobId) {
  throw new Error("Worker initialized with missing or invalid parameters.");
}

// console.log("AFTER VALIDATION");

const workerInput = workerData as ReconciliationWorkerData;



async function runWorker(): Promise<void> {
  // console.log("RUN WORKER STARTED");

  try {
    // console.log("BEFORE PIPELINE");
    // console.log("SENDING PROGRESS");

    // Initial progress update
    parentPort?.postMessage({
      type: "progress",
      progress: 10,
    });

    // console.log("BEFORE PIPELINE");

    // Trigger reconciliation
    const result: ReconciliationResult = await runReconciliationPipeline(workerInput.sourceAPath, workerInput.sourceBPath,
      (rowsProcessed) => {
        parentPort?.postMessage({
          type: "progress",
          rowsProcessed,
          progress: 50,
        });

        // console.log("AFTER PIPELINE");

        return;
      }
    );

    // Final completion message
    parentPort?.postMessage({
      type: "completed",
      result,
    });

    return;

  } catch (error) {
    parentPort?.postMessage({
      type: "failed",
      error: error instanceof Error ? error.message : "Unknown worker error",
    });

    return;
  }
}

// console.log("BEFORE runWorker()");

runWorker();

// console.log("AFTER runWorker()");