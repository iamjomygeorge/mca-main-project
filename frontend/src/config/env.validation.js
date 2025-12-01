const requiredEnvs = ["NEXT_PUBLIC_API_URL"];

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
}
