const express = require("express");
const multer = require("multer");
const { uploadHouse } = require("../controllers/upload-general-house-controller");
const authMiddleware = require("../middleware/auth-middleware");

const router = express.Router();

// Multer setup (store files in memory to send directly to Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit per file
});

router.post(
  "/upload",
  authMiddleware(['user', 'admin', 'superadmin']), // Protect this route
  upload.array("photos", 10),
  uploadHouse
);

module.exports = router;
