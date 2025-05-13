'use client';

// Client-side error reporting utility
// This helps track and identify errors in the production environment

let errorQueue: Array<{
  type: string;
  message: string;
  digest?: string;
  timestamp: number;
  userAgent?: string;
  url?: string;
}> = [];

const MAX_QUEUE_SIZE = 10;

// Initialize error monitoring
export function initErrorMonitoring() {
  if (typeof window === 'undefined') return;

  // Capture uncaught errors
  window.addEventListener('error', (event) => {
    captureError('uncaught', event.error?.message || event.message, event.error?.digest);
  });

  // Capture unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const message = typeof event.reason === 'string' 
      ? event.reason 
      : event.reason?.message || 'Unknown promise rejection';
      
    captureError('promise', message, event.reason?.digest);
  });

  // Periodically check for Server Component errors in console logs
  const originalConsoleError = console.error;
  console.error = function(...args) {
    // Call the original console.error first
    originalConsoleError.apply(console, args);
    
    // Check for server component errors
    const errorString = args.join(' ');
    if (
      errorString.includes('Server Components render') || 
      errorString.includes('digest')
    ) {
      let digest: string | undefined = undefined;
      // Extract digest if possible
      const digestMatch = errorString.match(/digest[:'"\s]+([a-z0-9]+)/i);
      if (digestMatch && digestMatch[1]) {
        digest = digestMatch[1];
      }
      
      captureError('server-component', errorString, digest);
    }
  };
}

// Capture an error
export function captureError(
  type: string, 
  message: string, 
  digest?: string
) {
  // Create error entry
  const error = {
    type,
    message,
    digest,
    timestamp: Date.now(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined
  };
  
  // Add to queue
  errorQueue.push(error);
  
  // Keep queue size manageable
  if (errorQueue.length > MAX_QUEUE_SIZE) {
    errorQueue = errorQueue.slice(-MAX_QUEUE_SIZE);
  }
  
  // Store in localStorage for persistence across page refreshes
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem('aydo_error_log', JSON.stringify(errorQueue));
    } catch (e) {
      // Ignore storage errors
    }
  }
  
  return error;
}

// Get all captured errors
export function getErrorLog() {
  // Try to load from localStorage first
  if (typeof localStorage !== 'undefined') {
    try {
      const storedErrors = localStorage.getItem('aydo_error_log');
      if (storedErrors) {
        errorQueue = JSON.parse(storedErrors);
      }
    } catch (e) {
      // Ignore storage errors
    }
  }
  
  return errorQueue;
}

// Clear error log
export function clearErrorLog() {
  errorQueue = [];
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem('aydo_error_log');
    } catch (e) {
      // Ignore storage errors
    }
  }
}

// Debug helper component 
export function ErrorMonitor() {
  if (process.env.NODE_ENV === 'production') {
    return null; // Only show in non-production
  }
  
  return null; // Implement UI if needed for development
} 