require("dotenv").config();
const s3Handler = require("./utils/s3Handler");

module.exports = {
  // ✅ Basic Uploads
  uploadFile: s3Handler.uploadFile,
  uploadFiles: s3Handler.uploadFiles,

  // ✅ Listing
  listFiles: s3Handler.listFiles,
  listRootObjects: s3Handler.listRootObjects,

  // ✅ File Management
  deleteFile: s3Handler.deleteFile,

  // ✅ Presigned URLs
  generateUploadUrl: s3Handler.generateUploadUrl,
  generateDownloadUrl: s3Handler.generateDownloadUrl,

  // ✅ Multipart Upload
  initiateMultipartUpload: s3Handler.initiateMultipartUpload,
  generateUploadPresignedUrls: s3Handler.generateUploadPresignedUrls,
  completeMultipartUpload: s3Handler.completeMultipartUpload,
};
