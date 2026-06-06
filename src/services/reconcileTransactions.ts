import fs from "fs";
import csv from "csv-parser";
import { TransactionRow } from "../types/transaction.types";
import { ReconciliationResult } from "../types/reconciliation.types";
import { isTimestampWithinTolerance } from "../utils/isTimestampWithinTolerance";

// WHAT THIS LOGIC DOES:
// Streams SourceB and compares it against the SourceA lookup map.

// WHY IT EXISTS:
// Enables O(1) lookups while keeping memory usage flat for very large files.

// HOW IT WORKS:
// 1. Stream SourceB row by row
// 2. Compare each row against SourceA map
// 3. Track discrepancies
// 4. Build reconciliation summary
// 5. Return results

export async function reconcileTransactions(sourceAMap: Map<string, TransactionRow>, sourceBPath: string, onProgress?: (rowProcessed: number) => void): Promise<ReconciliationResult> {
  return new Promise((resolve, reject) => {
    const matchedTransactionIds =
      new Set<string>();

    let rowsProcessed = 0;
    const seenTransactionIds = new Set<string>();

    const result: ReconciliationResult = {
      missingInB: [],
      missingInA: [],
      amountMismatches: [],
      statusMismatches: [],
      currencyMismatches: [],
      timestampMismatches: [],
      duplicateTransactions: [],
      malformedRows: [],

      stats: {
        totalSourceA: sourceAMap.size,
        totalSourceB: 0,
        matchedTransactions: 0,
        missingInA: 0,
        missingInB: 0,
        amountMismatches: 0,
        statusMismatches: 0,
        currencyMismatches: 0,
        timestampMismatches: 0,
        duplicateTransactions: 0,
        malformedRows: 0,
      },
    };

    fs.createReadStream(sourceBPath)
      .pipe(csv())
      .on("data", (row) => {
        rowsProcessed++;

        if (
          rowsProcessed % 10000 === 0 &&
          onProgress
        ) {
          onProgress(rowsProcessed);
        }

        result.stats.totalSourceB++;

        // Defensive parsing
        const transactionId = row.transactionId?.trim();
        const amount = Number(row.amount);

        if (!transactionId || Number.isNaN(amount)) {
          result.malformedRows.push(row);
          result.stats.malformedRows++;
          return;
        }

        const sourceBTransaction:
          TransactionRow = {
          transactionId,
          timestamp: row.timestamp?.trim(),
          amount,
          currency:
            row.currency?.trim(),
          status:
            row.status?.trim(),
        };

        // Duplicate detection
        if (seenTransactionIds.has(transactionId)) {
          result.duplicateTransactions.push(sourceBTransaction);
          result.stats.duplicateTransactions++;
          return;
        }

        seenTransactionIds.add(transactionId);

        const sourceATransaction = sourceAMap.get(transactionId);

        // Missing in A
        if (!sourceATransaction) {
          result.missingInA.push(sourceBTransaction);
          result.stats.missingInA++;
          return;
        }

        matchedTransactionIds.add(transactionId);
        result.stats.matchedTransactions++;

        // Amount mismatch
        if (sourceATransaction.amount !== sourceBTransaction.amount) {
          result.amountMismatches.push({
            sourceA: sourceATransaction,
            sourceB: sourceBTransaction,
          });
          result.stats.amountMismatches++;
        }

        // Status mismatch
        if (sourceATransaction.status.toLowerCase() !== sourceBTransaction.status.toLowerCase()) {
          result.statusMismatches.push({
            sourceA: sourceATransaction,
            sourceB: sourceBTransaction,
          });

          result.stats.statusMismatches++;
        }

        // Currency mismatch
        if (sourceATransaction.currency.toUpperCase() !== sourceBTransaction.currency.toUpperCase()) {
          result.currencyMismatches.push({
            sourceA: sourceATransaction,
            sourceB: sourceBTransaction,
          });
          result.stats.currencyMismatches++;
        }

        // Timestamp mismatch
        if (!isTimestampWithinTolerance(sourceATransaction.timestamp, sourceBTransaction.timestamp)) {
          result.timestampMismatches.push({
            sourceA: sourceATransaction,
            sourceB: sourceBTransaction,
          });
          result.stats.timestampMismatches++;
        }
      })
      .on("end", () => {
        for (const [transactionId, transaction,] of sourceAMap.entries()) {
          if (!matchedTransactionIds.has(transactionId)) {
            result.missingInB.push(transaction);
            result.stats.missingInB++;
          }
        }
        if (onProgress) {
          onProgress(rowsProcessed);
        }
        return resolve(result);
      })
      .on("error", (error) => {
        return reject(error);
      });
  });
}



// duplicate detection
// currency mismatches
// timestamp tolerances
// malformed row protection
// summary statistics
// defensive parsing