const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const {
  getFolders,
  createFolder,
  hardDeleteFolder
} = require("../controllers/folderController");

// Folder routes
router.get("/", authenticateToken, getFolders);        // GET /api/folders
router.post("/", authenticateToken, createFolder);     // POST /api/folders
router.delete("/hard-delete/:id", authenticateToken, hardDeleteFolder);

module.exports = router;
