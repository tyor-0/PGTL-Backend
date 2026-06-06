"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const reconciliationPipelineService_1 = require("../services/reconciliationPipelineService");
const worker_threads_1 = require("worker_threads");
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
if (!worker_threads_1.workerData?.sourceAPath || !worker_threads_1.workerData?.sourceBPath || !worker_threads_1.workerData?.jobId) {
    throw new Error("Worker initialized with missing or invalid parameters.");
}
// console.log("AFTER VALIDATION");
const workerInput = worker_threads_1.workerData;
async function runWorker() {
    // console.log("RUN WORKER STARTED");
    try {
        // console.log("BEFORE PIPELINE");
        // console.log("SENDING PROGRESS");
        // Initial progress update
        worker_threads_1.parentPort?.postMessage({
            type: "progress",
            progress: 10,
        });
        // console.log("BEFORE PIPELINE");
        // Trigger reconciliation
        const result = await (0, reconciliationPipelineService_1.runReconciliationPipeline)(workerInput.sourceAPath, workerInput.sourceBPath, (rowsProcessed) => {
            worker_threads_1.parentPort?.postMessage({
                type: "progress",
                rowsProcessed,
                progress: 50,
            });
            // console.log("AFTER PIPELINE");
            return;
        });
        // Final completion message
        worker_threads_1.parentPort?.postMessage({
            type: "completed",
            result,
        });
        return;
    }
    catch (error) {
        worker_threads_1.parentPort?.postMessage({
            type: "failed",
            error: error instanceof Error ? error.message : "Unknown worker error",
        });
        return;
    }
}
// console.log("BEFORE runWorker()");
runWorker();
// console.log("AFTER runWorker()");
