"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCSVHeaders = validateCSVHeaders;
const fs_1 = __importDefault(require("fs"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const REQUIRED_COLUMNS = [
    "transactionId",
    "timestamp",
    "amount",
    "currency",
    "status",
];
async function validateCSVHeaders(filePath) {
    // console.log("VALIDATING FILE:", filePath);
    return new Promise((resolve, reject) => {
        let validated = false;
        const stream = fs_1.default.createReadStream(filePath).pipe((0, csv_parser_1.default)());
        stream.on("headers", (headers) => {
            // console.log("HEADERS FOUND:", headers);
            // Validation start: normalize header names and verify required columns exist
            validated = true;
            const normalizedHeaders = headers.map((header) => header.trim().toLowerCase());
            const missing = REQUIRED_COLUMNS.filter((requiredColumn) => !normalizedHeaders.includes(requiredColumn.toLowerCase()));
            const validationResult = missing.length > 0
                ? { valid: false, missing }
                : { valid: true, missing: [] };
            // stream.destroy();
            resolve(validationResult);
            // Validation ends here for header check
        })
            .on("error", (error) => {
            //  console.log("VALIDATION ERROR", error);
            return reject(error);
        })
            .on("end", () => {
            //  console.log("VALIDATION END");
            if (!validated) {
                return resolve({
                    valid: false,
                    missing: REQUIRED_COLUMNS,
                });
            }
        });
    });
}
