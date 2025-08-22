\const express = require("express");
const multer = require("multer");
const authenticateToken = require("../middleware/auth");
const {
  getFiles,
  uploadFile,
  deleteFile,
  hardDeleteFile
} = require("../controllers/fileController");

const router = express.Router();

// Use memory storage to access file buffer
const upload = multer({ storage: multer.memoryStorage() });

// ===== Routes =====

// List all files
router.get("/", authenticateToken, getFiles);

// Upload a file
router.post("/upload", authenticateToken, upload.single("file"), uploadFile);

// Soft delete a file
router.delete("/:id", authenticateToken, deleteFile);

// Hard delete a file
router.delete("/hard-delete/:id", authenticateToken, hardDeleteFile);

module.exports = router;
