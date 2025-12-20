const getBaseUrl = (req) => {
  const protocol = req.headers["x-forwarded-proto"] || req.protocol;
  const host = req.headers["x-forwarded-host"] || req.get("host");
  return `${protocol}://${host}`;
};

const generateProxyUrl = (path, req) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;

  if (path.startsWith("covers/") || path.startsWith("books/")) {
    return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${path}`;
  }

  if (req) {
    const baseUrl = getBaseUrl(req);
    return `${baseUrl}/${path}`;
  }

  return path;
};

module.exports = { getBaseUrl, generateProxyUrl };
