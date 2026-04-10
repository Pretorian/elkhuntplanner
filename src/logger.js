/**
 * Centralized logging infrastructure
 * Provides consistent logging with environment-aware behavior
 */

const isDev = import.meta.env.DEV;
const isProd = import.meta.env.PROD;

class Logger {
  constructor(namespace = 'App') {
    this.namespace = namespace;
  }

  /**
   * Format log message with namespace
   */
  format(level, message, ...args) {
    const timestamp = new Date().toISOString();
    return [`[${timestamp}] [${this.namespace}] ${level}:`, message, ...args];
  }

  /**
   * Log info message (shown in dev only)
   */
  info(message, ...args) {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.log(...this.format('INFO', message, ...args));
    }
  }

  /**
   * Log warning message
   */
  warn(message, ...args) {
    console.warn(...this.format('WARN', message, ...args));
  }

  /**
   * Log error message
   */
  error(message, error, ...args) {
    console.error(...this.format('ERROR', message, error, ...args));

    // In production, you might want to send errors to a service like Sentry
    if (isProd) {
      // Example: Sentry.captureException(error);
    }
  }

  /**
   * Log debug message (dev only)
   */
  debug(message, ...args) {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.debug(...this.format('DEBUG', message, ...args));
    }
  }

  /**
   * Create a child logger with a sub-namespace
   */
  child(subNamespace) {
    return new Logger(`${this.namespace}:${subNamespace}`);
  }
}

// Export default logger instance
export const logger = new Logger();

// Export factory for creating namespaced loggers
export function createLogger(namespace) {
  return new Logger(namespace);
}

// Export Logger class for custom instances
export default Logger;
