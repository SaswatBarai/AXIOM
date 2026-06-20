const isDev = process.env.NODE_ENV === "development";

export const logger = {
  info: (...args: unknown[]) => isDev && console.warn("[INFO]", ...args),
  error: (...args: unknown[]) => console.error("[ERROR]", ...args),
  warn: (...args: unknown[]) => console.warn("[WARN]", ...args),
};
