const express = require("express");
const router = express.Router();
const multer = require("multer");
const authenticateToken = require("../middleware/auth");
const { uploadFile, getFiles, deleteFile, hardDeleteFile } = require("../controllers/fileController");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});

const upload = multer({ storage });

router.get("/", authenticateToken, getFiles);
router.post("/upload", authenticateToken, upload.single("file"), uploadFile);
router.delete("/delete/:id", authenticateToken, deleteFile);          // soft delete
router.delete("/hard-delete/:id", authenticateToken, hardDeleteFile); // hard delete

module.exports = router;
