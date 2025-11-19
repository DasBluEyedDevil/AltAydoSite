// Structured logging system for production monitoring
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  environment: string;
  context?: Record<string, any>;
  userId?: string;
  error?: {
    message: string;
    stack?: string;
    name?: string;
  };
}

export class Logger {
  private environment: string;
  private appName: string;

  constructor() {
    this.environment = process.env.NODE_ENV || 'development';
    this.appName = 'AydoCorp-Platform';
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      environment: this.environment,
      context: {
        ...context,
        appName: this.appName,
      },
    };

    if (error) {
      entry.error = {
        message: error.message,
        stack: error.stack,
        name: error.name,
      };
    }

    // In production, send to logging service if configured
    if (this.environment === 'production' && process.env.LOG_ENDPOINT) {
      this.sendToLogService(entry).catch(err =>
        console.error('[Logger] Failed to send log to service:', err)
      );
    }

    // Always console log for immediate visibility (structured JSON in production)
    if (this.environment === 'production') {
      const consoleMethod = level === 'error' ? console.error :
                           level === 'warn' ? console.warn : console.log;
      consoleMethod(JSON.stringify(entry));
    } else {
      // Human-readable logs in development
      const consoleMethod = level === 'error' ? console.error :
                           level === 'warn' ? console.warn : console.log;
      const prefix = `[${level.toUpperCase()}] ${new Date().toLocaleTimeString()}`;
      consoleMethod(prefix, message, context || '', error || '');
    }
  }

  private async sendToLogService(entry: LogEntry): Promise<void> {
    try {
      const response = await fetch(process.env.LOG_ENDPOINT!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': process.env.LOG_API_KEY ? `Bearer ${process.env.LOG_API_KEY}` : '',
        },
        body: JSON.stringify(entry),
      });

      if (!response.ok) {
        console.error('[Logger] Log service returned error:', response.status);
      }
    } catch (error) {
      // Fail silently to prevent logging errors from breaking the app
      console.error('[Logger] Exception sending logs:', error);
    }
  }

  debug(message: string, context?: Record<string, any>) {
    if (this.environment !== 'production') {
      this.log('debug', message, context);
    }
  }

  info(message: string, context?: Record<string, any>) {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    this.log('error', message, context, error);
  }

  // Convenience method for API route logging
  apiLog(
    method: string,
    path: string,
    statusCode: number,
    duration?: number,
    userId?: string,
    error?: Error
  ) {
    const level: LogLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
    this.log(level, `API ${method} ${path}`, {
      method,
      path,
      statusCode,
      duration,
      userId,
    }, error);
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience functions
export const logDebug = (message: string, context?: Record<string, any>) => logger.debug(message, context);
export const logInfo = (message: string, context?: Record<string, any>) => logger.info(message, context);
export const logWarn = (message: string, context?: Record<string, any>) => logger.warn(message, context);
export const logError = (error: Error, message?: string, context?: Record<string, any>) => logger.error(message || error.message, error, context);
