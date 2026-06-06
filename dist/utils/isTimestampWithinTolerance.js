"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTimestampWithinTolerance = isTimestampWithinTolerance;
function isTimestampWithinTolerance(sourceATimestamp, sourceBTimestamp, toleranceInMinutes = 5) {
    const sourceADate = new Date(sourceATimestamp);
    const sourceBDate = new Date(sourceBTimestamp);
    const differenceInMs = Math.abs(sourceADate.getTime() -
        sourceBDate.getTime());
    const toleranceInMs = toleranceInMinutes *
        60 *
        1000;
    return differenceInMs <= toleranceInMs;
}
