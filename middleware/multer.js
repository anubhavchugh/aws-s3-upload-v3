const multer = require("multer");

// ✅ store files in memory for direct S3 upload
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB limit
});

module.exports = upload;
