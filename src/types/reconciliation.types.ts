import { TransactionRow } from "./transaction.types";

// WHAT THIS LOGIC DOES:
// Defines every discrepancy category
// supported by the reconciliation engine.
//
// WHY IT EXISTS:
// Prevents typo bugs caused by
// repeating string literals throughout
// controllers, services, workers, and frontend.
//
// HOW IT WORKS:
// Any code that needs a reconciliation
// result type imports this constant.

export interface MismatchPair {
  sourceA: TransactionRow;
  sourceB: TransactionRow;
}

export interface MalformedRow {
  rawRow: Record<string, unknown>;
  reason: string;
}

export interface ReconciliationStats {
  totalSourceA: number;
  totalSourceB: number;
  matchedTransactions: number;
  missingInA: number;
  missingInB: number;
  amountMismatches: number;
  statusMismatches: number;
  currencyMismatches: number;
  timestampMismatches: number;
  duplicateTransactions: number;
  malformedRows: number;
}


export const RECONCILIATION_RESULT_TYPES = [
  "missingInA",
  "missingInB",
  "amountMismatches",
  "statusMismatches",
  "currencyMismatches",
  "timestampMismatches",
  "duplicateTransactions",
  "malformedRows",
] as const;

export type ReconciliationResultType = typeof RECONCILIATION_RESULT_TYPES[number];

export interface ReconciliationResult {
  missingInB: TransactionRow[];
  missingInA: TransactionRow[];
  amountMismatches: MismatchPair[];
  statusMismatches: MismatchPair[];
  currencyMismatches: MismatchPair[];
  timestampMismatches: MismatchPair[];
  duplicateTransactions: TransactionRow[];
  malformedRows: MalformedRow[];
  stats: ReconciliationStats; //start is not a discrepancy list
}