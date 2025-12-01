const isProduction = process.env.NODE_ENV === "production";

const logger = {
  info: (...args) => {
    if (!isProduction) {
      console.log(...args);
    }
  },
  warn: (...args) => {
    console.warn(...args);
  },
  error: (...args) => {
    console.error(...args);
  },
  debug: (...args) => {
    if (!isProduction) {
      console.debug(...args);
    }
  },
};

export default logger;
