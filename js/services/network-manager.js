/**
 * Tablets & Trials: The Covenant Quest
 * Network Manager - Handle network requests with robust fallbacks
 */

import ErrorHandler from './error-handler.js';
import Debugging from '../utils/debugging.js';
import PerformanceProfiler from '../utils/performance-profiler.js';

// Network Manager Module
const NetworkManager = (function() {
    // Network status
    let isOnline = window.navigator.onLine;
    
    // Track failed requests for retry
    const failedRequests = [];
    
    // Update online status
    window.addEventListener('online', () => {
        isOnline = true;
        Debugging.info('Network connection restored');
        
        // Retry failed requests
        retryFailedRequests();
    });
    
    window.addEventListener('offline', () => {
        isOnline = false;
        Debugging.warning('Network connection lost');
    });
    
    // Fetch data with timeout and fallbacks
    function fetchWithFallback(url, options = {}) {
        // Default options
        const defaultOptions = {
            timeout: 8000,
            retries: 2,
            retryDelay: 1000,
            fallbackUrl: null,
            localFallback: null,
            cacheResponse: true
        };
        
        const config = { ...defaultOptions, ...options };
        
        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), config.timeout);
        
        // Track performance
        const startTime = performance.now();
        
        // Start fetch request
        return new Promise((resolve, reject) => {
            // Skip network request if offline and go straight to fallback
            if (!isOnline) {
                clearTimeout(timeoutId);
                Debugging.info(`Skipping network request to ${url} (offline)`);
                return handleFallbacks(url, config, resolve, reject);
            }
            
            // Attempt fetch with timeout
            fetch(url, { 
                ...options.fetchOptions,
                signal: controller.signal 
            })
                .then(response => {
                    clearTimeout(timeoutId);
                    
                    // Track performance
                    const loadTime = performance.now() - startTime;
                    PerformanceProfiler.trackLoadTime('network', url, loadTime);
                    
                    // Check if response is OK
                    if (!response.ok) {
                        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
                    }
                    
                    // Cache response if needed
                    if (config.cacheResponse) {
                        cacheResponse(url, response.clone());
                    }
                    
                    return response;
                })
                .then(response => processResponse(response, options.responseType))
                .then(data => {
                    resolve(data);
                })
                .catch(error => {
                    clearTimeout(timeoutId);
                    
                    // Abort error from timeout
                    if (error.name === 'AbortError') {
                        Debugging.warning(`Request to ${url} timed out after ${config.timeout}ms`);
                    } else {
                        Debugging.error(`Fetch error for ${url}:`, error);
                    }
                    
                    // Retry logic
                    if (config.retries > 0) {
                        Debugging.info(`Retrying request to ${url} (${config.retries} retries left)`);
                        
                        setTimeout(() => {
                            fetchWithFallback(url, {
                                ...options,
                                retries: config.retries - 1,
                                retryDelay: config.retryDelay * 1.5 // Exponential backoff
                            })
                                .then(resolve)
                                .catch(reject);
                        }, config.retryDelay);
                    } else {
                        // Add to failed requests queue for later retry
                        if (isOnline) { // Only queue if we thought we were online
                            failedRequests.push({
                                url,
                                options,
                                timestamp: Date.now()
                            });
                        }
                        
                        // Try fallbacks
                        handleFallbacks(url, config, resolve, reject);
                    }
                });
        });
    }
    
    // Handle fallback strategies
    function handleFallbacks(url, config, resolve, reject) {
        // Try alternate CDN if provided
        if (config.fallbackUrl) {
            Debugging.info(`Trying fallback URL: ${config.fallbackUrl}`);
            
            fetch(config.fallbackUrl, config.fetchOptions)
                .then(response => {
                    if (!response.ok) throw new Error('Fallback URL failed');
                    return processResponse(response, config.responseType);
                })
                .then(data => {
                    Debugging.info(`Successfully loaded from fallback URL: ${config.fallbackUrl}`);
                    resolve(data);
                })
                .catch(error => {
                    Debugging.error(`Fallback URL failed: ${config.fallbackUrl}`, error);
                    tryNextFallback();
                });
        } else {
            tryNextFallback();
        }
        
        // Try cache or local fallback
        function tryNextFallback() {
            // Try to get from cache
            getCachedResponse(url, config.responseType)
                .then(cachedData => {
                    if (cachedData) {
                        Debugging.info(`Loaded from cache: ${url}`);
                        resolve(cachedData);
                    } else {
                        // No cached version, try local fallback
                        if (config.localFallback) {
                            Debugging.info(`Using local fallback for: ${url}`);
                            resolve(config.localFallback);
                        } else {
                            // No fallbacks available
                            reject(new Error(`Failed to load resource: ${url}`));
                        }
                    }
                })
                .catch(error => {
                    // Cache retrieval failed, try local fallback
                    Debugging.error(`Cache retrieval failed for ${url}:`, error);
                    
                    if (config.localFallback) {
                        Debugging.info(`Using local fallback for: ${url}`);
                        resolve(config.localFallback);
                    } else {
                        // No fallbacks available
                        reject(new Error(`Failed to load resource: ${url}`));
                    }
                });
        }
    }
    
    // Process response based on expected type
    function processResponse(response, responseType) {
        switch (responseType) {
            case 'json':
                return response.json();
            case 'text':
                return response.text();
            case 'blob':
                return response.blob();
            case 'arrayBuffer':
                return response.arrayBuffer();
            default:
                return response.json();
        }
    }
    
    // Cache response in IndexedDB or localStorage
    function cacheResponse(url, response) {
        // Use Cache API if available
        if ('caches' in window) {
            caches.open('tablets-trials-cache').then(cache => {
                cache.put(url, response);
            }).catch(error => {
                Debugging.error(`Failed to cache response for ${url}:`, error);
            });
        } else {
            // Fallback to localStorage for simple responses
            response.text().then(text => {
                try {
                    localStorage.setItem(`cache_${btoa(url)}`, text);
                    localStorage.setItem(`cache_${btoa(url)}_timestamp`, Date.now().toString());
                } catch (error) {
                    Debugging.error(`Failed to cache response in localStorage:`, error);
                }
            });
        }
    }
    
    // Get cached response
    function getCachedResponse(url, responseType) {
        return new Promise((resolve, reject) => {
            // Try Cache API first
            if ('caches' in window) {
                caches.open('tablets-trials-cache')
                    .then(cache => cache.match(url))
                    .then(cachedResponse => {
                        if (cachedResponse) {
                            return processResponse(cachedResponse, responseType);
                        }
                        
                        // No match in Cache API, try localStorage
                        return getLocalStorageCache(url, responseType);
                    })
                    .then(data => resolve(data))
                    .catch(error => {
                        // Cache API failed, try localStorage
                        getLocalStorageCache(url, responseType)
                            .then(data => resolve(data))
                            .catch(err => reject(err));
                    });
            } else {
                // Cache API not available, use localStorage
                getLocalStorageCache(url, responseType)
                    .then(data => resolve(data))
                    .catch(error => reject(error));
            }
        });
    }
    
    // Get cached response from localStorage
    function getLocalStorageCache(url, responseType) {
        return new Promise((resolve, reject) => {
            const cacheKey = `cache_${btoa(url)}`;
            const cachedData = localStorage.getItem(cacheKey);
            const timestamp = localStorage.getItem(`${cacheKey}_timestamp`);
            
            if (!cachedData) {
                return resolve(null);
            }
            
            // Check cache age (24 hours)
            const cacheAge = timestamp ? Date.now() - parseInt(timestamp) : 0;
            if (cacheAge > 86400000) {
                // Cache is old, but still usable in offline mode
                Debugging.info(`Using outdated cache for ${url} (${Math.round(cacheAge/3600000)}h old)`);
            }
            
            // Process the cached data based on expected type
            try {
                switch (responseType) {
                    case 'json':
                        resolve(JSON.parse(cachedData));
                        break;
                    case 'text':
                        resolve(cachedData);
                        break;
                    default:
                        resolve(cachedData);
                }
            } catch (error) {
                reject(error);
            }
        });
    }
    
   // Retry previously failed requests
   function retryFailedRequests() {
    if (failedRequests.length === 0) return;
    
    Debugging.info(`Retrying ${failedRequests.length} failed requests`);
    
    // Get requests that failed in the last hour
    const recentRequests = failedRequests.filter(req => 
        Date.now() - req.timestamp < 3600000
    );
    
    // Clear the queue
    failedRequests.length = 0;
    
    // Retry each request
    recentRequests.forEach(request => {
        setTimeout(() => {
            fetchWithFallback(request.url, {
                ...request.options,
                retries: 1 // Only retry once on reconnect
            }).catch(error => {
                Debugging.error(`Retry failed for ${request.url}:`, error);
            });
        }, 1000 + Math.random() * 2000); // Stagger retries
    });
}

// Check if user is online
function checkOnlineStatus() {
    // Don't just trust navigator.onLine, do an actual ping
    if (!navigator.onLine) {
        return Promise.resolve(false);
    }
    
    return fetch('/ping', { 
        method: 'HEAD',
        cache: 'no-store',
        timeout: 2000 
    })
        .then(() => true)
        .catch(() => false);
}

// Load JSON data with fallback
function loadJSON(url, options = {}) {
    return fetchWithFallback(url, { 
        ...options, 
        responseType: 'json',
        cacheResponse: true
    });
}

// Load text data with fallback
function loadText(url, options = {}) {
    return fetchWithFallback(url, { 
        ...options, 
        responseType: 'text',
        cacheResponse: true
    });
}

// Post data to server with fallback
function postData(url, data, options = {}) {
    const fetchOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        ...options.fetchOptions
    };
    
    return fetchWithFallback(url, {
        ...options,
        fetchOptions,
        cacheResponse: false // Don't cache POST responses by default
    });
}

// Clear cached responses
function clearCache() {
    if ('caches' in window) {
        caches.delete('tablets-trials-cache')
            .then(() => {
                Debugging.info('Network cache cleared');
            })
            .catch(error => {
                Debugging.error('Failed to clear network cache', error);
            });
    }
    
    // Clear localStorage cache
    try {
        const cacheKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('cache_')) {
                cacheKeys.push(key);
            }
        }
        
        cacheKeys.forEach(key => localStorage.removeItem(key));
        Debugging.info(`Cleared ${cacheKeys.length} cached responses from localStorage`);
    } catch (error) {
        Debugging.error('Failed to clear localStorage cache', error);
    }
}

// Public API
return {
    fetchWithFallback,
    loadJSON,
    loadText,
    postData,
    isOnline: () => isOnline,
    checkOnlineStatus,
    getPendingRequestCount: () => failedRequests.length,
    retryFailedRequests,
    clearCache
};
})();

export default NetworkManager;