import fs from "fs";
import csv from "csv-parser";
import { TransactionRow } from "../types/transaction.types";

export interface ParsedTransactionResult {
  transactionMap: Map<string, TransactionRow>;
  duplicateIds: Set<string>;
  malformedRowCount: number; // Useful for logging/metrics
}

export async function buildTransactionMap(filePath: string): Promise<ParsedTransactionResult> {
  return new Promise((resolve, reject) => {
    const transactionMap = new Map<string, TransactionRow>();
    const duplicateIds = new Set<string>();
    let malformedRowCount = 0;

    // ... reading stream line-by-line ...
  // ... running validation ...
    if (!fs.existsSync(filePath)) {
      return reject(new Error(`File not found at path: ${filePath}`));
    }

    fs.createReadStream(filePath)
      .pipe(
        csv({
          mapHeaders: ({ header }) => header.trim(), // Keep casing consistent with your object properties
        })
      )
      .on("data", (row) => {
        // 1. Extract and sanitize
        const transactionId = row.transactionId?.trim();
        const timestamp = row.timestamp?.trim();
        const rawAmount = row.amount?.trim(); // Keep raw string briefly to check if it's empty
        const amountNum = Number(rawAmount);
        const currency = row.currency?.trim();
        const status = row.status?.trim().toLowerCase();

        // 2. Strict Validation: Catches completely empty rows AND missing individual fields
        if (
          !transactionId ||
          !timestamp ||
          !rawAmount ||       // Prevents an empty amount string from slipping through as 0
          isNaN(amountNum) ||
          !currency ||
          !status
        ) {
          malformedRowCount++;
          return; // Skip this bad or empty row entirely
        }

        const transaction: TransactionRow = {
          transactionId,
          timestamp,
          amount: amountNum,
          currency,
          status,
        };

        // 3. Duplicate Tracking: Check if it exists before setting
        if (transactionMap.has(transactionId)) {
          duplicateIds.add(transactionId);
          // We keep the *first* occurrence in the map for comparison, 
          // but we've permanently recorded that this ID is a duplicate.
          return;
        }

        // Fresh record, add to lookup map
        transactionMap.set(transactionId, transaction);
      })
      .on("end", () => {
        resolve({
          transactionMap,
          duplicateIds,
          malformedRowCount,
        });
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}