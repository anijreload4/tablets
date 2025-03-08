/**
 * Tablets & Trials: The Covenant Quest
 * Error Handler - Central error handling system
 */

const ErrorHandler = (function() {
    // Error severity levels
    const SEVERITY = {
      FATAL: 'fatal',     // Application cannot continue
      ERROR: 'error',     // Feature is broken but app can continue
      WARNING: 'warning', // Something unexpected but handleable
      INFO: 'info'        // Informational message
    };
  
    // Track errors to prevent flooding
    const errorLog = {};
  
    
    // Custom error class with extra context
    class GameError extends Error {
      constructor(message, code, context = {}) {
        super(message);
        this.name = 'GameError';
        this.code = code;
        this.context = context;
        this.timestamp = new Date();
      }
    }
  
    // Log to appropriate output based on severity
    function logError(error, severity = SEVERITY.ERROR) {
      // Sanity check: if severity isn't a string, default to ERROR
      if (typeof severity !== 'string') {
        severity = SEVERITY.ERROR;
      }
  
      const errorId = `${error.code}:${error.message}`;
  
      // Prevent flooding with the same error
      if (errorLog[errorId]) {
        errorLog[errorId].count += 1;
        errorLog[errorId].lastSeen = new Date();
        // Only log repeat errors occasionally
        if (errorLog[errorId].count % 5 !== 0) return;
      } else {
        errorLog[errorId] = {
          count: 1,
          firstSeen: new Date(),
          lastSeen: new Date()
        };
      }
  // Add this near the top of the ErrorHandler module in error-handler.js:

// Make sure errorLog is initialized right at the start
const errorLog = {};

// Then modify the logError function to include additional checks:
function logError(error, severity = SEVERITY.ERROR) {
    // Safety check in case error is undefined or not an object
    if (!error) {
        console.error('[ERROR HANDLER] Received undefined error');
        return;
    }
    
    // Create a safe errorId that won't crash even if properties are missing
    const errorCode = error.code || 'UNKNOWN_CODE';
    const errorMessage = error.message || 'Unknown error';
    const errorId = `${errorCode}:${errorMessage}`;
    
    // Prevent flooding with same error
    if (errorLog[errorId]) {
        errorLog[errorId].count += 1;
        errorLog[errorId].lastSeen = new Date();
        // Only log repeat errors occasionally
        if (errorLog[errorId].count % 5 !== 0) return;
    } else {
        errorLog[errorId] = {
            count: 1,
            firstSeen: new Date(),
            lastSeen: new Date()
        };
    }
    
    // Log based on severity
    switch (severity) {
        case SEVERITY.FATAL:
        case SEVERITY.ERROR:
            console.error(`[${severity.toUpperCase()}] ${errorMessage}`, error);
            break;
        case SEVERITY.WARNING:
            console.warn(`[WARNING] ${errorMessage}`, error);
            break;
        case SEVERITY.INFO:
            console.info(`[INFO] ${errorMessage}`, error);
            break;
        default:
            console.log(`[LOG] ${errorMessage}`, error);
    }
    
    // Send to analytics if needed (with safety checks)
    if ((severity === SEVERITY.FATAL || severity === SEVERITY.ERROR) && 
        typeof sendErrorToAnalytics === 'function') {
        try {
            sendErrorToAnalytics(error, severity);
        } catch (e) {
            // Don't let analytics cause more errors
            console.error('Error sending error to analytics', e);
        }
    }
}
      // Log based on severity level
      switch (severity) {
        case SEVERITY.FATAL:
        case SEVERITY.ERROR:
          console.error(`[${severity.toUpperCase()}] ${error.message}`, error);
          break;
        case SEVERITY.WARNING:
          console.warn(`[WARNING] ${error.message}`, error);
          break;
        case SEVERITY.INFO:
          console.info(`[INFO] ${error.message}`, error);
          break;
        default:
          console.error(`[ERROR] ${error.message}`, error);
          break;
      }
  
      // Send error to analytics when necessary
      if (severity === SEVERITY.FATAL || severity === SEVERITY.ERROR) {
        sendErrorToAnalytics(error, severity);
      }
    }
  
    // Function to send error data to an analytics service
    function sendErrorToAnalytics(error, severity) {
      try {
        if (window.analytics) {
          window.analytics.logError({
            code: error.code,
            message: error.message,
            context: error.context,
            stack: error.stack,
            severity: severity,
            timestamp: error.timestamp,
            userAgent: navigator.userAgent,
            gameVersion: window.gameConfig?.version || '1.0.0'
          });
        }
      } catch (e) {
        // Prevent analytics errors from causing more issues
        console.error('Error sending error to analytics', e);
      }
    }
  
    // Gracefully handle fatal errors by displaying an error screen
    function handleFatalError(error) {
      logError(error, SEVERITY.FATAL);
  
      const errorScreen = document.createElement('div');
      errorScreen.className = 'fatal-error-screen';
      errorScreen.innerHTML = `
        <div class="error-container">
          <h2>Something went wrong</h2>
          <p>We're sorry, but something unexpected happened.</p>
          <p>Error code: ${error.code}</p>
          <button id="restart-game">Restart Game</button>
        </div>
      `;
  
      document.body.appendChild(errorScreen);
  
      // Add restart handler
      document.getElementById('restart-game').addEventListener('click', () => {
        window.location.reload();
      });
    }
  
    // Find this section in error-handler.js and completely replace it:

// Global error handler
window.addEventListener('error', function(event) {
    // Skip if no event
    if (!event) return;
    
    // Create error with available information
    const errorMessage = event.message || 'Unknown error';
    const error = new GameError(
        errorMessage,
        'UNCAUGHT_ERROR',
        {
            filename: event.filename || 'unknown',
            lineno: event.lineno || 0,
            colno: event.colno || 0
        }
    );
    
    // Log error safely
    try {
        logError(error, SEVERITY.ERROR);
    } catch (err) {
        // If our error handling fails, at least log to console
        console.error('[ERROR HANDLER FAILURE]', err);
        console.error('Original error:', errorMessage);
    }
    
    // Prevent default only if we can
    if (event && typeof event.preventDefault === 'function') {
        event.preventDefault();
    }
});
    // Global handler for unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const error = new GameError(
        event.reason?.message || 'Unhandled Promise Rejection',
        'UNHANDLED_PROMISE',
        { reason: event.reason }
      );
  
      logError(error, SEVERITY.ERROR);
      event.preventDefault();
    });
  
    // Helper method for asset loading errors
    function assetLoadError(assetId, assetType, details) {
      const error = new GameError(
        `Failed to load ${assetType}: ${assetId}`,
        'ASSET_LOAD_ERROR',
        { assetId, assetType, details }
      );
      logError(error, SEVERITY.WARNING);
      return error;
    }
  
    // Helper method for gameplay errors
    function gameplayError(action, details) {
      const error = new GameError(
        `Gameplay error during: ${action}`,
        'GAMEPLAY_ERROR',
        details
      );
      logError(error, SEVERITY.ERROR);
      return error;
    }
  
    // Helper method for network errors
    function networkError(endpoint, status, details) {
      const error = new GameError(
        `Network request failed: ${endpoint} (${status})`,
        'NETWORK_ERROR',
        { endpoint, status, details }
      );
      logError(error, SEVERITY.WARNING);
      return error;
    }
  
    // Method to retrieve the current error log
    function getErrorLog() {
      return { ...errorLog };
    }
  
    // Method to clear the error log
    function clearErrorLog() {
      Object.keys(errorLog).forEach(key => {
        delete errorLog[key];
      });
    }
  
    // Public API
    return {
      GameError,
      SEVERITY,
      logError,
      handleFatalError,
      assetLoadError,
      gameplayError,
      networkError,
      getErrorLog,
      clearErrorLog
    };
  })();
  
  export default ErrorHandler;