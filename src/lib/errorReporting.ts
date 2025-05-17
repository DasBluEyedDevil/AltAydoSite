// Simple error reporting utility for client-side error handling

// Type for error log entries
type ErrorLogEntry = {
  type: string;
  message: string;
  timestamp: number;
  digest?: string;
  stack?: string;
};

// Store errors in localStorage
const ERROR_LOG_KEY = 'app_error_log';
const MAX_ERROR_LOG = 20; // Maximum number of errors to store

/**
 * Initialize error monitoring
 */
export function initErrorMonitoring(): void {
  // This could be extended with external error monitoring services
  if (typeof window !== 'undefined') {
    console.log('Error monitoring initialized');
  }
}

/**
 * Log an error to the error store
 */
export function logError(error: Error | unknown, type: string = 'unknown'): void {
  if (typeof window === 'undefined') return;
  
  try {
    const errorLog = getErrorLog();
    
    // Create error entry
    const errorEntry: ErrorLogEntry = {
      type,
      message: error instanceof Error ? error.message : String(error),
      timestamp: Date.now(),
    };
    
    // Add digest if available (for Next.js server errors)
    if (error && typeof error === 'object' && 'digest' in error) {
      errorEntry.digest = String(error.digest);
    }
    
    // Add stack trace if available
    if (error instanceof Error && error.stack) {
      errorEntry.stack = error.stack;
    }
    
    // Add to log and trim if needed
    errorLog.unshift(errorEntry);
    if (errorLog.length > MAX_ERROR_LOG) {
      errorLog.pop();
    }
    
    // Save to localStorage
    localStorage.setItem(ERROR_LOG_KEY, JSON.stringify(errorLog));
  } catch (e) {
    // Fail silently if localStorage is not available
    console.error('Failed to log error:', e);
  }
}

/**
 * Get the current error log
 */
export function getErrorLog(): ErrorLogEntry[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const storedLog = localStorage.getItem(ERROR_LOG_KEY);
    return storedLog ? JSON.parse(storedLog) : [];
  } catch (e) {
    console.error('Failed to retrieve error log:', e);
    return [];
  }
}

/**
 * Clear the error log
 */
export function clearErrorLog(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(ERROR_LOG_KEY);
  } catch (e) {
    console.error('Failed to clear error log:', e);
  }
} 