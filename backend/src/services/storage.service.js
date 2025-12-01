const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const multer = require("multer");
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const logger = require("../config/logger");

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, os.tmpdir());
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString("hex");
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

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

async function uploadFileToS3(filePath, originalname, mimetype, folderName) {
  const uniqueFileName = `${crypto
    .randomBytes(16)
    .toString("hex")}-${originalname}`;
  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  const s3Key = `${folderName}/${uniqueFileName}`;

  const fileStream = fs.createReadStream(filePath);

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: s3Key,
    Body: fileStream,
    ContentType: mimetype,
  });

  await s3Client.send(command);

  return s3Key;
}

async function deleteFileFromS3(fileKey) {
  if (!fileKey) return;

  try {
    const bucketName = process.env.AWS_S3_BUCKET_NAME;

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
    });

    await s3Client.send(command);
    logger.info({ fileKey }, "Successfully rolled back (deleted) S3 file.");
  } catch (err) {
    logger.error(
      err,
      `Failed to delete file from S3 during rollback: ${fileKey}`
    );
  }
}

async function getFileStream(fileKey) {
  const bucketName = process.env.AWS_S3_BUCKET_NAME;

  if (!fileKey) {
    throw new Error("Invalid file key configuration.");
  }

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: fileKey,
  });

  const response = await s3Client.send(command);
  return response.Body;
}

async function cleanupLocalFile(filePath) {
  try {
    if (filePath) {
      await fs.promises.unlink(filePath);
    }
  } catch (err) {
    logger.error(err, `Failed to cleanup local file ${filePath}`);
  }
}

module.exports = {
  upload,
  uploadFileToS3,
  deleteFileFromS3,
  getFileStream,
  cleanupLocalFile,
};
