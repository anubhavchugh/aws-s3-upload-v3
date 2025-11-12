const s3Handler = require("./utils/s3Handler");

let isInitialized = false;

/**
 * Initialize AWS S3 credentials
 */
function initS3(config) {
  if (
    !config ||
    !config.accessKeyId ||
    !config.secretAccessKey ||
    !config.bucketName ||
    !config.region
  ) {
    throw new Error(
      "Missing AWS configuration values! Required: region, accessKeyId, secretAccessKey, bucketName"
    );
  }

  s3Handler.setup(config);
  isInitialized = true;
}

module.exports = {
  initS3,

  // ✅ Basic Uploads
  uploadFile: (...args) =>
    isInitialized ? s3Handler.uploadFile(...args) : throwInitError(),
  uploadFiles: (...args) =>
    isInitialized ? s3Handler.uploadFiles(...args) : throwInitError(),

  // ✅ Listing
  listFiles: (...args) =>
    isInitialized ? s3Handler.listFiles(...args) : throwInitError(),
  listRootObjects: (...args) =>
    isInitialized ? s3Handler.listRootObjects(...args) : throwInitError(),

  // ✅ File Management
  deleteFile: (...args) =>
    isInitialized ? s3Handler.deleteFile(...args) : throwInitError(),

  // ✅ Presigned URLs
  generateUploadUrl: (...args) =>
    isInitialized ? s3Handler.generateUploadUrl(...args) : throwInitError(),
  generateDownloadUrl: (...args) =>
    isInitialized ? s3Handler.generateDownloadUrl(...args) : throwInitError(),

  // ✅ Multipart Upload
  initiateMultipartUpload: (...args) =>
    isInitialized
      ? s3Handler.initiateMultipartUpload(...args)
      : throwInitError(),
  generateUploadPresignedUrls: (...args) =>
    isInitialized
      ? s3Handler.generateUploadPresignedUrls(...args)
      : throwInitError(),
  completeMultipartUpload: (...args) =>
    isInitialized
      ? s3Handler.completeMultipartUpload(...args)
      : throwInitError(),
};

function throwInitError() {
  throw new Error("S3 not initialized. Call initS3(config) first!");
}
