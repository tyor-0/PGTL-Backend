import dotenv from "dotenv";
// 1. CRITICAL: Initialize environmental configs FIRST before loading App logic!
dotenv.config();

import app from "./app";
import logger from "./config/logger";
import { startJobCleanupSweeper } from "./storage/jobStore";
// import { connectDB } from "./config/db"; // Uncomment this when your DB setup file is ready!

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // 2. Connect to Database (e.g., MongoDB Atlas) before opening network ports
    // await connectDB();
    // logger.info("Database connection established successfully.");

    // 3. Start background processes safely
    startJobCleanupSweeper(1 * 60 * 60 * 1000);

    // 4. Fire up the listener engine
    app.listen(PORT, () => {
      console.log(`API working successfully on port ${PORT}`);
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to boot up server infrastructure:", error);
    logger.error("Critical server boot failure", { error });
    process.exit(1); // Kill the process cleanly if the infrastructure fails
  }
}

startServer();