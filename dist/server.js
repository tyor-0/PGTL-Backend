"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
// 1. CRITICAL: Initialize environmental configs FIRST before loading App logic!
dotenv_1.default.config();
const app_1 = __importDefault(require("./app"));
const logger_1 = __importDefault(require("./config/logger"));
const jobStore_1 = require("./storage/jobStore");
// import { connectDB } from "./config/db"; // Uncomment this when your DB setup file is ready!
const PORT = process.env.PORT || 5000;
async function startServer() {
    try {
        // 2. Connect to Database (e.g., MongoDB Atlas) before opening network ports
        // await connectDB();
        // logger.info("Database connection established successfully.");
        // 3. Start background processes safely
        (0, jobStore_1.startJobCleanupSweeper)(1 * 60 * 60 * 1000);
        // 4. Fire up the listener engine
        app_1.default.listen(PORT, () => {
            console.log(`API working successfully on port ${PORT}`);
            logger_1.default.info(`Server running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error("Failed to boot up server infrastructure:", error);
        logger_1.default.error("Critical server boot failure", { error });
        process.exit(1); // Kill the process cleanly if the infrastructure fails
    }
}
startServer();
