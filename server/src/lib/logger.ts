interface LogMeta {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV !== 'production';

  debug(message: string, meta?: LogMeta) {
    if (this.isDevelopment) {
      console.log(`[DEBUG] ${message}`, meta || '');
    }
  }

  info(message: string, meta?: LogMeta) {
    console.log(`[INFO] ${message}`, meta || '');
  }

  warn(message: string, meta?: LogMeta) {
    console.warn(`[WARN] ${message}`, meta || '');
  }

  error(message: string, meta?: LogMeta) {
    console.error(`[ERROR] ${message}`, meta || '');
  }

  child(_context: LogMeta) {
    return this;
  }
}

export const logger = new Logger();

export const createLogger = (context: Record<string, unknown>) => {
  return logger.child(context);
};
