import fs from "fs";
import csv from "csv-parser";

const REQUIRED_COLUMNS = [
  "transactionId",
  "timestamp",
  "amount",
  "currency",
  "status",
];

interface ValidationResult {
  valid: boolean;

  missing: string[];
}

export async function validateCSVHeaders( filePath: string ): Promise<ValidationResult> {
  // console.log("VALIDATING FILE:", filePath);

  return new Promise((resolve, reject) => {
    let validated = false;

    const stream = fs.createReadStream(filePath).pipe(csv());

    stream.on("headers", (headers: string[]) => {

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