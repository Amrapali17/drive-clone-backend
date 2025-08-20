const express = require("express");
const { 
  getFolders, 
  createFolder, 
  softDeleteFolder,   // added
  hardDeleteFolder 
} = require("../controllers/folderController");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

// ===== Routes =====
router.get("/", authenticateToken, getFolders);
router.post("/", authenticateToken, createFolder);

// Soft delete (mark as deleted)
router.delete("/:id", authenticateToken, softDeleteFolder);

// Hard delete (permanent)
router.delete("/hard-delete/:id", authenticateToken, hardDeleteFolder);

module.exports = router;
