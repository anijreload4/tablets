/**
 * Tablets & Trials: The Covenant Quest
 * Error Handler - Central error handling system
 */

// Error Handler Module
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
        const errorId = `${error.code}:${error.message}`;
        
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
                console.error(`[${severity.toUpperCase()}] ${error.message}`, error);
                break;
            case SEVERITY.WARNING:
                console.warn(`[WARNING] ${error.message}`, error);
                break;
            case SEVERITY.INFO:
                console.info(`[INFO] ${error.message}`, error);
                break;
        }
        
        // Send to analytics if needed
        if (severity === SEVERITY.FATAL || severity === SEVERITY.ERROR) {
            sendErrorToAnalytics(error, severity);
        }
    }
    
    // Send error data to analytics service
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
            // Don't let analytics cause more errors
            console.error('Error sending error to analytics', e);
        }
    }
    
    // Gracefully handle fatal errors
    function handleFatalError(error) {
        logError(error, SEVERITY.FATAL);
        
        // Show user-friendly error screen
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
    
    // Global error handler
    // In js/services/error-handler.js, around line 115
// Find code that looks something like this:
window.addEventListener('error', (event) => {
    const error = new GameError(
        event.message || 'Unknown error',
        'UNCAUGHT_ERROR',
        {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
        }
    );
    
    logError(error, SEVERITY.ERROR);
    event.preventDefault();
});

// And update it to something like this:
window.addEventListener('error', (event) => {
    // Check if event is valid before accessing properties
    if (!event) return;
    
    const error = new GameError(
        (event && event.message) || 'Unknown error',
        'UNCAUGHT_ERROR',
        {
            filename: event && event.filename,
            lineno: event && event.lineno,
            colno: event && event.colno
        }
    );
    
    logError(error, SEVERITY.ERROR);
    if (event) {
        event.preventDefault();
    }
});
    
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        const error = new GameError(
            event.reason?.message || 'Unhandled Promise Rejection',
            'UNHANDLED_PROMISE',
            { reason: event.reason }
        );
        
        logError(error, SEVERITY.ERROR);
        event.preventDefault();
    });
    
    // Helper methods for common errors
    function assetLoadError(assetId, assetType, details) {
        const error = new GameError(
            `Failed to load ${assetType}: ${assetId}`,
            'ASSET_LOAD_ERROR',
            { assetId, assetType, details }
        );
        logError(error, SEVERITY.WARNING);
        return error;
    }
    
    function gameplayError(action, details) {
        const error = new GameError(
            `Gameplay error during: ${action}`,
            'GAMEPLAY_ERROR',
            details
        );
        logError(error, SEVERITY.ERROR);
        return error;
    }
    
    function networkError(endpoint, status, details) {
        const error = new GameError(
            `Network request failed: ${endpoint} (${status})`,
            'NETWORK_ERROR',
            { endpoint, status, details }
        );
        logError(error, SEVERITY.WARNING);
        return error;
    }
    
    function getErrorLog() {
        return { ...errorLog };
    }
    
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