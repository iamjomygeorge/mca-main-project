const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const crypto = require('crypto');

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

async function uploadFileToS3(fileBuffer, originalname, mimetype, folderName) {
  const uniqueFileName = `${crypto.randomBytes(16).toString('hex')}-${originalname}`;
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

module.exports = {
  upload,
  uploadFileToS3,
};