"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runReconciliationPipeline = runReconciliationPipeline;
const logger_1 = __importDefault(require("../config/logger"));
const csvHeaderValidator_1 = require("../validators/csvHeaderValidator");
const buildTransactionMap_1 = require("./buildTransactionMap");
const reconcileTransactions_1 = require("./reconcileTransactions");
async function runReconciliationPipeline(sourceAPath, sourceBPath, onProgress) {
    // STEP 1 — Validate CSV headers
    const sourceAValidation = await (0, csvHeaderValidator_1.validateCSVHeaders)(sourceAPath);
    const sourceBValidation = await (0, csvHeaderValidator_1.validateCSVHeaders)(sourceBPath);
    if (!sourceAValidation.valid) {
        throw new Error(`SourceA validation failed: ${sourceAValidation.missing.join(", ")}`);
    }
    if (!sourceBValidation.valid) {
        throw new Error(`SourceB validation failed: ${sourceBValidation.missing.join(", ")}`);
    }
    logger_1.default.info("CSV files validated successfully");
    // STEP 2 — Build SourceA map
    // Note: Since buildTransactionMap now returns an object { transactionMap, duplicateIds, malformedRowCount }, we extract the map directly here.
    const result = await (0, buildTransactionMap_1.buildTransactionMap)(sourceAPath);
    //  console.log("TRANSACTION MAP BUILT");
    if (!result.transactionMap) {
        throw new Error("Transaction map was not created");
    }
    const { transactionMap } = result;
    logger_1.default.info("SourceA transaction map built", {
        sourceAMapSize: transactionMap.size,
    });
    // STEP 3 — Reconcile
    const reconciliationResult = await (0, reconcileTransactions_1.reconcileTransactions)(transactionMap, sourceBPath, onProgress);
    logger_1.default.info("Reconciliation completed successfully");
    // console.log("RECONCILIATION FINISHED");
    return reconciliationResult;
}
