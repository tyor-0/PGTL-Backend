"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jobsController_1 = require("../controllers/jobsController");
const router = (0, express_1.Router)();
// Status endpoint
router.get("/:jobId", jobsController_1.getJobStatus);
// Results endpoint
router.get("/:jobId/results", jobsController_1.getJobResults);
exports.default = router;
