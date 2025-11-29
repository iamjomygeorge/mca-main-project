const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const multer = require("multer");
const crypto = require("crypto");

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
});

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 80 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "application/epub+zip",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only EPUB and images (JPEG, PNG, WEBP) are allowed."
        )
      );
    }
  },
});

async function uploadFileToS3(fileBuffer, originalname, mimetype, folderName) {
  const uniqueFileName = `${crypto
    .randomBytes(16)
    .toString("hex")}-${originalname}`;
  const bucketName = process.env.AWS_S3_BUCKET_NAME;

  const s3Key = `${folderName}/${uniqueFileName}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: s3Key,
    Body: fileBuffer,
    ContentType: mimetype,
  });

  await s3Client.send(command);

  const fileUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
  return fileUrl;
}

async function deleteFileFromS3(fileUrl) {
  if (!fileUrl) return;

  try {
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    const region = process.env.AWS_REGION;

    const baseUrl = `https://${bucketName}.s3.${region}.amazonaws.com/`;

    if (!fileUrl.startsWith(baseUrl)) {
      console.warn(
        `Skipping S3 delete: URL does not match expected bucket pattern. URL: ${fileUrl}`
      );
      return;
    }

    const key = fileUrl.replace(baseUrl, "");

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    await s3Client.send(command);
    console.log(`Successfully rolled back (deleted) S3 file: ${key}`);
  } catch (err) {
    console.error(
      `Failed to delete file from S3 during rollback: ${fileUrl}`,
      err
    );
  }
}

async function getFileStream(fileUrl) {
  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  const region = process.env.AWS_REGION;
  const baseUrl = `https://${bucketName}.s3.${region}.amazonaws.com/`;

  if (!fileUrl || !fileUrl.startsWith(baseUrl)) {
    throw new Error("Invalid file URL configuration.");
  }

  const key = fileUrl.replace(baseUrl, "");

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  const response = await s3Client.send(command);
  return response.Body;
}

module.exports = {
  upload,
  uploadFileToS3,
  deleteFileFromS3,
  getFileStream,
};
