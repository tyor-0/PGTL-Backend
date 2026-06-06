"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildTransactionMap = buildTransactionMap;
const fs_1 = __importDefault(require("fs"));
const csv_parser_1 = __importDefault(require("csv-parser"));
async function buildTransactionMap(filePath) {
    return new Promise((resolve, reject) => {
        const transactionMap = new Map();
        const duplicateIds = new Set();
        let malformedRowCount = 0;
        // ... reading stream line-by-line ...
        // ... running validation ...
        if (!fs_1.default.existsSync(filePath)) {
            return reject(new Error(`File not found at path: ${filePath}`));
        }
        fs_1.default.createReadStream(filePath)
            .pipe((0, csv_parser_1.default)({
            mapHeaders: ({ header }) => header.trim(), // Keep casing consistent with your object properties
        }))
            .on("data", (row) => {
            // 1. Extract and sanitize
            const transactionId = row.transactionId?.trim();
            const timestamp = row.timestamp?.trim();
            const rawAmount = row.amount?.trim(); // Keep raw string briefly to check if it's empty
            const amountNum = Number(rawAmount);
            const currency = row.currency?.trim();
            const status = row.status?.trim().toLowerCase();
            // 2. Strict Validation: Catches completely empty rows AND missing individual fields
            if (!transactionId ||
                !timestamp ||
                !rawAmount || // Prevents an empty amount string from slipping through as 0
                isNaN(amountNum) ||
                !currency ||
                !status) {
                malformedRowCount++;
                return; // Skip this bad or empty row entirely
            }
            const transaction = {
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
