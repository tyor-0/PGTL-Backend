"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJobStatus = getJobStatus;
exports.getJobResults = getJobResults;
const jobService_1 = require("../services/jobService");
const reconciliation_types_1 = require("../types/reconciliation.types");
// WHAT THIS LOGIC DOES:
// Returns the current state of a reconciliation job.
// WHY IT EXISTS:
// Frontend polls every few seconds to update progress bars and status indicators.
// HOW IT WORKS:
// Reads the job from memory and returns status/progress information.
//status logic 
async function getJobStatus(req, res) {
    const jobId = Array.isArray(req.params.jobId)
        ? req.params.jobId[0]
        : req.params.jobId;
    const job = (0, jobService_1.getJob)(jobId);
    if (!job) {
        return res.status(404).json({
            success: false,
            message: "Job not found",
        });
    }
    return res.status(200).json({
        success: true,
        data: {
            jobId: job.jobId,
            status: job.status,
            progress: job.progress,
            rowsProcessed: job.rowsProcessed,
            createdAt: job.createdAt,
            completedAt: job.completedAt,
            error: job.error,
        },
    });
}
//pagination logic
async function getJobResults(req, res) {
    const jobId = Array.isArray(req.params.jobId)
        ? req.params.jobId[0]
        : req.params.jobId;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
    const type = String(req.query.type || "");
    //const type = req.query.type as ReconciliationResultType;
    const job = (0, jobService_1.getJob)(jobId);
    const resultType = type;
    if (!job) {
        return res.status(404).json({
            success: false,
            message: "Job not found",
        });
    }
    if (!job.result) {
        return res.status(400).json({
            success: false,
            message: "Results not available",
        });
    }
    if (!reconciliation_types_1.RECONCILIATION_RESULT_TYPES.includes(type)) {
        return res.status(400).json({
            success: false,
            message: "Invalid result type",
            allowedTypes: reconciliation_types_1.RECONCILIATION_RESULT_TYPES,
        });
    }
    const rows = job.result[resultType];
    const start = (page - 1) * limit;
    const paginatedData = Array.isArray(rows) ? rows.slice(start, start + limit) : [];
    return res.status(200).json({
        success: true,
        data: {
            jobId: job.jobId,
            status: job.status,
            progress: job.progress,
            rowsProcessed: job.rowsProcessed,
            summary: job.result.stats,
            rows: paginatedData,
            pagination: {
                page,
                limit,
                total: Array.isArray(rows) ? rows.length : 0,
                totalPages: Array.isArray(rows) ? Math.ceil(rows.length / limit) : 0,
            },
        },
    });
}
