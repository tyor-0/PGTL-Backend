import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import reconcileRoutes from "./routes/reconcileRoutes";
import jobRoutes from "./routes/jobRoutes";
import logger from "./config/logger";

const app = express();
const FRONTEND_URL = process.env.FRONTEND_URL;

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL
        : "http://localhost:5173",
  })
);
app.use(express.json());

// 1. ABSOLUTE ROOT HEALTH CHECK (http://localhost:5000/)
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Transaction Ledger Reconciliation Engine Gateway is online.",
    timestamp: new Date().toISOString()
  });
});

// 2. API VERSION 1 ROOT HEALTH CHECK (http://localhost:5000/api/v1)
app.get("/api/v1", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    version: "v1.0.0",
    status: "healthy",
    documentation: "Access endpoints via /reconcile or /jobs"
  });
});

// Your core feature routes
app.use("/api/v1/reconcile", reconcileRoutes);
app.use("/api/v1/jobs", jobRoutes);

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({ success: false, message: err.message });
});

export default app;