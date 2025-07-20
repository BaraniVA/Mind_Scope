// src/lib/logger.ts
const isDevelopment = process.env.NODE_ENV === 'development';
const enableLogging = process.env.NEXT_PUBLIC_ENABLE_LOGGING === 'true';

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment && enableLogging) {
      console.log(...args);
    }
  },
  warn: (...args: any[]) => {
    if (isDevelopment && enableLogging) {
      console.warn(...args);
    }
  },
  error: (...args: any[]) => {
    // Always show errors, but prefix them to distinguish from external logs
    console.error('[App Error]', ...args);
  },
  info: (...args: any[]) => {
    if (isDevelopment && enableLogging) {
      console.info(...args);
    }
  }
};
