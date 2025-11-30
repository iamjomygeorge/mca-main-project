if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const requiredVars = [
  // Core
  "DATABASE_URL",
  "JWT_SECRET",
  "FRONTEND_URL",

  // Payments (Stripe)
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "PLATFORM_COMMISSION_RATE",

  // Auth (Google)
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_OAUTH_REDIRECT_URI",

  // Storage (AWS S3)
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "AWS_S3_BUCKET_NAME",
  "AWS_REGION",

  // Email (Nodemailer)
  "EMAIL_HOST",
  "EMAIL_PORT",
  "EMAIL_USER",
  "EMAIL_PASS",
  "EMAIL_FROM_NAME",
  "EMAIL_FROM_ADDRESS",
];

const validateEnvironment = () => {
  const missing = requiredVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error("CRITICAL ERROR: Missing environment variables:");
    missing.forEach((key) => console.error(`   - ${key}`));
    process.exit(1);
  }
};

module.exports = validateEnvironment;
