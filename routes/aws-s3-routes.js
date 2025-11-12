const express = require("express");
const router = express.Router();
const upload = require("../middlewares/multer");
const s3Handler = require("../utils/s3Handler");

/* ============================================================================
   ✅ Upload Files (multipart/form-data)
============================================================================ */
router.post("/upload", upload.array("files"), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "No files uploaded.",
      });
    }

    const folder = req.body.directoryPath || "uploads";
    const uploadedFiles = await s3Handler.uploadFiles(req.files, folder);

    return res.status(200).json({
      status: "success",
      message: "Files uploaded successfully.",
      data: uploadedFiles,
    });
  } catch (error) {
    console.error("❌ Upload error:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
});

/* ============================================================================
   ✅ List Files
============================================================================ */
router.get("/list", async (req, res) => {
  try {
    const { prefix, limit, continuationToken } = req.query;
    const result = await s3Handler.listFiles(prefix, limit, continuationToken);
    res.status(200).json({ status: "success", data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: error.message });
  }
});

/* ============================================================================
   ✅ List Root Objects
============================================================================ */
router.get("/list-root", async (req, res) => {
  try {
    const { prefix } = req.query;
    const result = await s3Handler.listRootObjects(prefix);
    res.status(200).json({ status: "success", data: result });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

/* ============================================================================
   ✅ Delete File
============================================================================ */
router.delete("/", async (req, res) => {
  try {
    const { key } = req.body;
    await s3Handler.deleteFile(key);
    res.status(200).json({ status: "success", message: "File deleted" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

/* ============================================================================
   ✅ Generate Download URL
============================================================================ */
router.get("/presigned-url", async (req, res) => {
  try {
    const { key } = req.query;
    const url = await s3Handler.generateDownloadUrl(key);
    res.status(200).json({ status: "success", url });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

module.exports = router;
