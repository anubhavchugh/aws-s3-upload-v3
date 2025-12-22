const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

let s3Client;
let bucketName;
let region;

// ✅ Called once from initS3
exports.setup = ({
  region: awsRegion,
  accessKeyId,
  secretAccessKey,
  bucketName: awsBucket,
}) => {
  region = awsRegion;
  bucketName = awsBucket;

  s3Client = new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    forcePathStyle: false,
  });
};

/* ============================================================================
   ✅ Upload file
============================================================================ */
exports.uploadFile = async (file, folder = "uploads") => {
  const fileKey = `${folder}/${Date.now()}-${file.originalname}`;

  const params = {
    Bucket: bucketName,
    Key: fileKey,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  await s3Client.send(new PutObjectCommand(params));

  const fileUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${fileKey}`;

  return {
    Key: fileKey,
    Location: fileUrl,
  };
};

/* ============================================================================
   ✅ Upload multiple files (loop)
============================================================================ */
exports.uploadFiles = async (files, folder = "uploads") => {
  const results = [];
  for (const file of files) {
    const uploaded = await exports.uploadFile(file, folder);
    results.push(uploaded);
  }
  return results;
};

/* ============================================================================
   ✅ List files
============================================================================ */
exports.listFiles = async (
  prefix = "",
  limit = 50,
  continuationToken = null
) => {
  const params = {
    Bucket: bucketName,
    Prefix: prefix,
    MaxKeys: Number(limit),
    ContinuationToken: continuationToken || undefined,
  };

  const result = await s3Client.send(new ListObjectsV2Command(params));

  return {
    data: result.Contents || [],
    isTruncated: result.IsTruncated,
    nextContinuationToken: result.NextContinuationToken,
  };
};

/* ============================================================================
   ✅ List root directories
============================================================================ */
exports.listRootObjects = async (prefix = "") => {
  const params = {
    Bucket: bucketName,
    Prefix: prefix,
    Delimiter: "/",
  };

  const result = await s3Client.send(new ListObjectsV2Command(params));

  return {
    folders: result.CommonPrefixes || [],
    files: result.Contents || [],
  };
};

/* ============================================================================
   ✅ Delete file
============================================================================ */
exports.deleteFile = async (fileKey) => {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
    })
  );
};

/* ============================================================================
   ✅ Generate presigned upload URL
============================================================================ */
exports.generateUploadUrl = async (fileName, folder = "uploads") => {
  const key = `${folder}/${Date.now()}-${fileName}`;
  const params = {
    Bucket: bucketName,
    Key: key,
    ContentType: "application/octet-stream",
  };
  const url = await getSignedUrl(s3Client, new PutObjectCommand(params), {
    expiresIn: 300,
  });
  return { uploadUrl: url, fileKey: key };
};

/* ============================================================================
   ✅ Generate download presigned URL
============================================================================ */
exports.generateDownloadUrl = async (fileKey) => {
  const params = {
    Bucket: bucketName,
    Key: fileKey,
  };
  return await getSignedUrl(s3Client, new GetObjectCommand(params), {
    expiresIn: 300,
  });
};

/* ============================================================================
   ✅ Multipart upload helpers
============================================================================ */
exports.initiateMultipartUpload = async ({ fileName, folder }) => {
  const key = `${folder}/${Date.now()}-${fileName}`;
  const response = await s3Client.send(
    new CreateMultipartUploadCommand({
      Bucket: bucketName,
      Key: key,
    })
  );
  return response;
};

exports.generateUploadPresignedUrls = async ({ uploadId, key, parts }) => {
  return Promise.all(
    Array.from({ length: parts }, async (_, index) => {
      const command = new UploadPartCommand({
        Bucket: bucketName,
        Key: key,
        UploadId: uploadId,
        PartNumber: index + 1,
      });
      const signedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 3600,
      });
      return { partNumber: index + 1, uploadUrl: signedUrl };
    })
  );
};

exports.completeMultipartUpload = async ({ uploadId, key, parts }) => {
  const response = await s3Client.send(
    new CompleteMultipartUploadCommand({
      Bucket: bucketName,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: { Parts: parts },
    })
  );
  return response.Location;
};

exports.uploadPart = async ({ uploadId, key, partNumber, buffer }) => {
  const response = await s3Client.send(
    new UploadPartCommand({
      Bucket: bucketName,
      Key: key,
      UploadId: uploadId,
      PartNumber: Number(partNumber),
      Body: buffer,
    })
  );

  return {
    ETag: response.ETag,
    partNumber: Number(partNumber),
  };
};
