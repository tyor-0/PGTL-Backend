"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const reconcileRoutes_1 = __importDefault(require("./routes/reconcileRoutes"));
const jobRoutes_1 = __importDefault(require("./routes/jobRoutes"));
const app = (0, express_1.default)();

app.use((0, cors_1.default)({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express_1.default.json());
// 1. ABSOLUTE ROOT HEALTH CHECK (http://localhost:5000/)
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Transaction Ledger Reconciliation Engine Gateway is online.",
        timestamp: new Date().toISOString()
    });
});
// 2. API VERSION 1 ROOT HEALTH CHECK (http://localhost:5000/api/v1)
app.get("/api/v1", (req, res) => {
    res.status(200).json({
        success: true,
        version: "v1.0.0",
        status: "healthy",
        documentation: "Access endpoints via /reconcile or /jobs"
    });
});
// Your core feature routes
app.use("/api/v1/reconcile", reconcileRoutes_1.default);
app.use("/api/v1/jobs", jobRoutes_1.default);
// Global Error Handler
app.use((err, req, res, next) => {
    res.status(500).json({ success: false, message: err.message });
});
exports.default = app;
