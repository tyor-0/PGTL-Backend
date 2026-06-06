"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uploadMiddleware_1 = __importDefault(require("../middlewares/uploadMiddleware"));
const reconcileController_1 = require("../controllers/reconcileController");
const router = (0, express_1.Router)();
router.post("/", uploadMiddleware_1.default.fields([{ name: "sourceA", maxCount: 1 }, { name: "sourceB", maxCount: 1 },]), reconcileController_1.reconcileFiles);
exports.default = router;
