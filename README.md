🧰 aws-s3-upload-v3

A lightweight and production-ready AWS S3 upload utility built using AWS SDK v3.
Supports single/multiple file uploads, listing, deletion, pre-signed URLs, and multipart uploads — all in a simple, reusable package.

🚀 Installation
npm install aws-s3-upload-v3

Or, if you’re using it locally (before publishing to NPM):
npm install ../aws-s3-upload-v3

🧩 Features

✅ Upload single or multiple files
✅ Generate pre-signed upload/download URLs
✅ List files or root folders in a bucket
✅ Delete files
✅ Multipart uploads for large files
✅ Fully independent — no .env dependency

⚙️ Initialization
Initialize once at app startup or before using any function:
const s3 = require("aws-s3-upload-v3");

s3.initS3({
region: process.env.AWS_REGION,
accessKeyId: process.env.AWS_ACCESS_KEY,
secretAccessKey: process.env.AWS_SECRET_KEY,
bucketName: process.env.AWS_BUCKET_NAME,
});

🪣 Basic Usage
✅ Upload a Single File
const result = await s3.uploadFile(file, "uploads");
console.log(result);
/_
{
Key: "uploads/1731408900000-sample.png",
Location: "https://your-bucket.s3.ap-south-1.amazonaws.com/uploads/1731408900000-sample.png"
}
_/

✅ Upload Multiple Files
const result = await s3.uploadFiles(files, "uploads");
console.log(result);

📜 List Files
const files = await s3.listFiles("uploads/");
console.log(files);

🧭 List Root Folders
const roots = await s3.listRootObjects();
console.log(roots);
/_
{
folders: [...],
files: [...]
}
_/

🧾 Delete File
await s3.deleteFile("uploads/1731408900000-sample.png");
console.log("File deleted successfully");

🔐 Generate Pre-Signed URLs
Upload URL (PUT method)

const { uploadUrl, fileKey } = await s3.generateUploadUrl("test.png", "uploads");
console.log({ uploadUrl, fileKey });

Download URL
const url = await s3.generateDownloadUrl("uploads/1731408900000-sample.png");
console.log(url);

🧩 Multipart Uploads
Step 1: Initiate Upload
const response = await s3.initiateMultipartUpload({
fileName: "big-file.zip",
folder: "large-uploads",
});

Step 2: Generate Part Upload URLs
const parts = await s3.generateUploadPresignedUrls({
uploadId: response.UploadId,
key: response.Key,
parts: 5,
});

Step 3: Complete Upload
const completed = await s3.completeMultipartUpload({
uploadId: response.UploadId,
key: response.Key,
parts: [
{ ETag: "...", PartNumber: 1 },
{ ETag: "...", PartNumber: 2 },
],
});
console.log(completed);

⚠️ Error Handling
If you forget to initialize the SDK:
Error: S3 not initialized. Call initS3(config) first!
This ensures your app won’t crash silently.

🧱 Folder Structure

aws-s3-upload-v3/
│
├── index.js
├── package.json
├── utils/
│ └── s3Handler.js
└── README.md

📦 Example Integration (Express API)
const express = require("express");
const multer = require("multer");
const s3 = require("aws-s3-upload-v3");

s3.initS3({
region: process.env.AWS_REGION,
accessKeyId: process.env.AWS_ACCESS_KEY,
secretAccessKey: process.env.AWS_SECRET_KEY,
bucketName: process.env.AWS_BUCKET_NAME,
});

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.post("/upload", upload.array("file"), async (req, res) => {
try {
const results = await s3.uploadFiles(req.files, "uploads");
res.json({ success: true, data: results });
} catch (error) {
res.status(500).json({ error: error.message });
}
});

app.listen(3000, () => console.log("Server running on port 3000"));
