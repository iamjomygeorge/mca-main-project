const requiredEnvs = [
  "NEXT_PUBLIC_API_URL",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
];

export function validateEnv() {
  if (process.env.NODE_ENV === "test") return;

  const missing = requiredEnvs.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    const message = `CRITICAL ERROR: Missing environment variables: ${missing.join(
      ", "
    )}`;

    if (typeof window !== "undefined") {
      console.error(
        `%c ${message}`,
        "background: red; color: white; padding: 4px; font-weight: bold; font-size: 14px;"
      );
    } else {
      console.error(message);
    }
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl && apiUrl.endsWith("/")) {
    const message =
      "CONFIGURATION WARNING: NEXT_PUBLIC_API_URL ends with a slash '/'. This creates double-slash URLs (e.g. //api). Please remove it from your .env file.";

    if (typeof window !== "undefined") {
      console.warn(
        `%c ${message}`,
        "background: orange; color: black; padding: 4px; font-weight: bold; font-size: 12px;"
      );
    } else {
      console.warn(message);
    }
  }
}
