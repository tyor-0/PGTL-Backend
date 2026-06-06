import logger from "../config/logger";
import { validateCSVHeaders } from "../validators/csvHeaderValidator";
import { buildTransactionMap } from "./buildTransactionMap";
import { reconcileTransactions } from "./reconcileTransactions";
import { ReconciliationResult } from "../types/reconciliation.types";

export async function runReconciliationPipeline(
  sourceAPath: string, 
  sourceBPath: string, 
  onProgress?: (rowsProcessed: number)=> void): Promise<ReconciliationResult> {

  // STEP 1 — Validate CSV headers
  const sourceAValidation = await validateCSVHeaders(sourceAPath);


  const sourceBValidation = await validateCSVHeaders(sourceBPath);


  if (!sourceAValidation.valid) {
    throw new Error(`SourceA validation failed: ${sourceAValidation.missing.join(", ")}`);
  }

  if (!sourceBValidation.valid) {
    throw new Error(`SourceB validation failed: ${sourceBValidation.missing.join(", ")}`);
  }

  logger.info("CSV files validated successfully");
  // STEP 2 — Build SourceA map
  // Note: Since buildTransactionMap now returns an object { transactionMap, duplicateIds, malformedRowCount }, we extract the map directly here.
  const result =
  await buildTransactionMap(sourceAPath);

  //  console.log("TRANSACTION MAP BUILT");

if (!result.transactionMap) {
  throw new Error(
    "Transaction map was not created"
  );
}

const { transactionMap } = result;

  logger.info("SourceA transaction map built", {
    sourceAMapSize: transactionMap.size,
  });

  // STEP 3 — Reconcile
  const reconciliationResult = await reconcileTransactions(transactionMap, sourceBPath, onProgress );

  logger.info("Reconciliation completed successfully");
  // console.log("RECONCILIATION FINISHED");

  return reconciliationResult;
}