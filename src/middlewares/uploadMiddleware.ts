import multer from "multer";
import path from "path";
import fs from "fs";

// Folder where uploaded CSV files will be saved.
const uploadPath = path.join(__dirname, "../../uploads");

// Create the uploads folder if it does not exist already.
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Configure how multer stores files on disk.
const storage = multer.diskStorage({
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
const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  const isCSV =
    file.mimetype === "text/csv" || file.originalname.toLowerCase().endsWith(".csv");

  if (!isCSV) {
    // Reject non-CSV uploads.
    return cb(new Error("Only CSV files are allowed"));
  }

  // Accept the file if it passed the check.
  cb(null, true);
};

// Create the multer upload middleware with storage, filters, and size limits.
const upload = multer({
  storage,
  fileFilter,
  limits: {
    // Limit file uploads to 500 MB.
    fileSize: 1024 * 1024 * 500,
  },
});

export default upload;
