"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Folder where uploaded CSV files will be saved.
const uploadPath = path_1.default.join(__dirname, "../../uploads");
// Create the uploads folder if it does not exist already.
if (!fs_1.default.existsSync(uploadPath)) {
    fs_1.default.mkdirSync(uploadPath, { recursive: true });
}
// Configure how multer stores files on disk.
const storage = multer_1.default.diskStorage({
    // destination() tells multer where to save the uploaded file.
    destination: (_req, _file, cb) => {
        cb(null, uploadPath);
    },
    // filename() builds a unique file name for each upload.
    filename: (_req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    },
});
// fileFilter() checks whether the uploaded file is allowed.
const fileFilter = (_req, file, cb) => {
    const isCSV = file.mimetype === "text/csv" || file.originalname.toLowerCase().endsWith(".csv");
    if (!isCSV) {
        // Reject non-CSV uploads.
        return cb(new Error("Only CSV files are allowed"));
    }
    // Accept the file if it passed the check.
    cb(null, true);
};
// Create the multer upload middleware with storage, filters, and size limits.
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        // Limit file uploads to 500 MB.
        fileSize: 1024 * 1024 * 500,
    },
});
exports.default = upload;
