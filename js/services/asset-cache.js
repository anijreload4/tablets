/**
 * Tablets & Trials: The Covenant Quest
 * Asset Cache - Manage game assets with efficient memory usage
 */

import ErrorHandler from './error-handler.js';
import Debugging from '../utils/debugging.js';
import PerformanceProfiler from '../utils/performance-profiler.js';
// At the top of js/services/asset-cache.js, add:
import FallbackAssets from './fallback-assets.js';

// Asset Cache Module
const AssetCache = (function() {
    // Asset storage
    const assets = {
        images: {},
        audio: {},
        data: {}
    };
    
    // Track asset usage for cache prioritization
    const assetUsage = {};
    
    // Cache size limits (in MB)
    const CACHE_LIMITS = {
        images: 10,
        audio: 5,
        data: 2
    };
    
    // Current cache sizes
    const cacheSize = {
        images: 0,
        audio: 0,
        data: 0
    };
    
    // Preload a batch of assets
    function preloadAssets(assetList, progressCallback) {
        return new Promise((resolve, reject) => {
            // Skip if no assets to load
            if (!assetList || assetList.length === 0) {
                resolve([]);
                return;
            }
            
            Debugging.info(`Preloading ${assetList.length} assets`);
            
            let loadedCount = 0;
            const loadedAssets = [];
            const failedAssets = [];
            
            // Create a promise for each asset
            const loadPromises = assetList.map(asset => {
                let loadPromise;
                
                switch (asset.type) {
                    case 'image':
                        loadPromise = loadImage(asset.id, asset.src, asset.priority);
                        break;
                    case 'audio':
                        loadPromise = loadAudio(asset.id, asset.src, asset.priority);
                        break;
                    case 'data':
                        loadPromise = loadData(asset.id, asset.src, asset.priority);
                        break;
                    default:
                        return Promise.reject(new Error(`Unknown asset type: ${asset.type}`));
                }
                
                // Track progress
                return loadPromise
                    .then(result => {
                        loadedCount++;
                        loadedAssets.push({
                            id: asset.id,
                            type: asset.type,
                            loaded: true
                        });
                        
                        // Report progress
                        if (progressCallback) {
                            progressCallback(loadedCount / assetList.length);
                        }
                        
                        return result;
                    })
                    .catch(error => {
                        failedAssets.push({
                            id: asset.id,
                            type: asset.type,
                            error: error.message,
                            loaded: false
                        });
                        
                        Debugging.warning(`Failed to load asset ${asset.id} (${asset.type})`, error);
                        
                        // Report progress even for failed assets
                        loadedCount++;
                        if (progressCallback) {
                            progressCallback(loadedCount / assetList.length);
                        }
                        
                        // Don't reject the whole batch for non-critical assets
                        if (asset.critical) {
                            throw error;
                        } else {
                            return null; // Return null for failed non-critical asset
                        }
                    });
            });
            
            // Wait for all assets to load
            Promise.all(loadPromises)
                .then(() => {
                    Debugging.info(`Preloaded ${loadedAssets.length} assets, ${failedAssets.length} failed`);
                    resolve({ loaded: loadedAssets, failed: failedAssets });
                })
                .catch(error => {
                    Debugging.error('Critical asset loading failure', error);
                    reject(error);
                });
        });
    }
    
    // Modify loadImage function in asset-cache.js

function loadImage(id, src, priority = 1) {
    return new Promise((resolve, reject) => {
        // Skip if already loaded
        if (assets.images[id]) {
            // Update usage counter
            updateAssetUsage(id, 'images', priority);
            resolve(assets.images[id]);
            return;
        }
        
        // Check if src exists - important for error handling
        if (!src) {
            const error = ErrorHandler.assetLoadError(id, 'image', { src: 'missing' });
            Debugging.warning(`Missing source for image: ${id}`);
            
            // Create a placeholder image instead of failing
            const fallbackSrc = FallbackAssets.getFallback('image', id);
            if (fallbackSrc) {
                Debugging.info(`Using fallback for ${id}`);
                // Try loading the fallback instead
                const fallbackImg = new Image();
                fallbackImg.onload = () => {
                    assets.images[id] = fallbackImg;
                    updateAssetUsage(id, 'images', priority);
                    resolve(fallbackImg);
                };
                fallbackImg.onerror = () => {
                    reject(error); // If even fallback fails, reject
                };
                fallbackImg.src = fallbackSrc;
                return;
            }
            
            reject(error);
            return;
        }
        
        // Start performance tracking
        PerformanceProfiler.startMarker(`load_image_${id}`);
        
        const img = new Image();
        
        img.onload = () => {
            // Store in cache
            assets.images[id] = img;
            
            // Track usage
            updateAssetUsage(id, 'images', priority);
            
            // Estimate size for cache management
            const estimatedSize = (img.width * img.height * 4) / (1024 * 1024); // Rough RGBA size in MB
            cacheSize.images += estimatedSize;
            
            // Check if we need to free up cache space
            if (cacheSize.images > CACHE_LIMITS.images) {
                cleanupCache('images');
            }
            
            // End performance tracking
            const loadTime = PerformanceProfiler.endMarker(`load_image_${id}`);
            PerformanceProfiler.trackLoadTime('image', id, loadTime);
            
            resolve(img);
        };
        
        img.onerror = () => {
            // End performance tracking
            PerformanceProfiler.endMarker(`load_image_${id}`);
            
            const error = ErrorHandler.assetLoadError(id, 'image', { src });
            
            // Try to load a fallback if available
            const fallbackSrc = FallbackAssets.getFallback('image', id);
            if (fallbackSrc && fallbackSrc !== src) {
                Debugging.info(`Using fallback for ${id}`);
                // Try loading the fallback instead
                const fallbackImg = new Image();
                fallbackImg.onload = () => {
                    assets.images[id] = fallbackImg;
                    updateAssetUsage(id, 'images', priority);
                    resolve(fallbackImg);
                };
                fallbackImg.onerror = () => {
                    reject(error); // If even fallback fails, reject
                };
                fallbackImg.src = fallbackSrc;
                return;
            }
            
            reject(error);
        };
        
        img.src = src;
    });
}

// Similar updates for loadAudio function
function loadAudio(id, src, priority = 1) {
    return new Promise((resolve, reject) => {
        // Skip if already loaded
        if (assets.audio[id]) {
            // Update usage counter
            updateAssetUsage(id, 'audio', priority);
            resolve(assets.audio[id]);
            return;
        }
        
        // Check if src exists
        if (!src) {
            const error = ErrorHandler.assetLoadError(id, 'audio', { src: 'missing' });
            Debugging.warning(`Missing source for audio: ${id}`);
            
            // Create a silent audio element instead of failing
            const fallbackSrc = FallbackAssets.getFallback('audio', 'silent');
            if (fallbackSrc) {
                Debugging.info(`Using silent fallback for ${id}`);
                const fallbackAudio = new Audio();
                fallbackAudio.oncanplaythrough = () => {
                    assets.audio[id] = fallbackAudio;
                    updateAssetUsage(id, 'audio', priority);
                    resolve(fallbackAudio);
                    fallbackAudio.oncanplaythrough = null;
                };
                fallbackAudio.onerror = () => {
                    reject(error);
                };
                fallbackAudio.src = fallbackSrc;
                fallbackAudio.load();
                return;
            }
            
            reject(error);
            return;
        }
        
        // Start performance tracking
        PerformanceProfiler.startMarker(`load_audio_${id}`);
        
        const audio = new Audio();
        
        // Add a timeout for audio loading (15 seconds max)
        let loadTimeout = setTimeout(() => {
            Debugging.warning(`Audio load timeout for ${id}`);
            audio.oncanplaythrough = null;
            
            // Use a silent fallback
            const fallbackSrc = FallbackAssets.getFallback('audio', 'silent');
            if (fallbackSrc) {
                Debugging.info(`Using silent fallback for ${id} after timeout`);
                const fallbackAudio = new Audio();
                fallbackAudio.src = fallbackSrc;
                assets.audio[id] = fallbackAudio;
                updateAssetUsage(id, 'audio', priority);
                PerformanceProfiler.endMarker(`load_audio_${id}`);
                resolve(fallbackAudio);
                return;
            }
            
            // If no fallback, create an empty audio element
            const emptyAudio = new Audio();
            assets.audio[id] = emptyAudio;
            updateAssetUsage(id, 'audio', priority);
            PerformanceProfiler.endMarker(`load_audio_${id}`);
            resolve(emptyAudio);
        }, 15000);
        
        audio.oncanplaythrough = () => {
            // Clear timeout
            clearTimeout(loadTimeout);
            
            // Store in cache
            assets.audio[id] = audio;
            
            // Track usage
            updateAssetUsage(id, 'audio', priority);
            
            // Estimate size for cache management (rough estimate based on duration)
            let estimatedSize = 0.5; // Default 0.5MB if duration unavailable
            if (audio.duration) {
                // Rough estimate: 1MB per minute of audio at medium quality
                estimatedSize = (audio.duration / 60) * 1;
            }
            cacheSize.audio += estimatedSize;
            
            // Check if we need to free up cache space
            if (cacheSize.audio > CACHE_LIMITS.audio) {
                cleanupCache('audio');
            }
            
            // End performance tracking
            const loadTime = PerformanceProfiler.endMarker(`load_audio_${id}`);
            PerformanceProfiler.trackLoadTime('audio', id, loadTime);
            
            // Remove the event listener to prevent memory leaks
            audio.oncanplaythrough = null;
            
            resolve(audio);
        };
        
        audio.onerror = () => {
            // Clear timeout
            clearTimeout(loadTimeout);
            
            // End performance tracking
            PerformanceProfiler.endMarker(`load_audio_${id}`);
            
            const error = ErrorHandler.assetLoadError(id, 'audio', { src });
            
            // Try to load a fallback
            const fallbackSrc = FallbackAssets.getFallback('audio', 'silent');
            if (fallbackSrc) {
                Debugging.info(`Using silent fallback for ${id} after error`);
                const fallbackAudio = new Audio();
                fallbackAudio.src = fallbackSrc;
                assets.audio[id] = fallbackAudio;
                updateAssetUsage(id, 'audio', priority);
                resolve(fallbackAudio);
                return;
            }
            
            reject(error);
        };
        
        audio.src = src;
        audio.load(); // Start loading the audio
    });
}
    
    // Load an audio asset
    function loadAudio(id, src, priority = 1) {
        return new Promise((resolve, reject) => {
            // Skip if already loaded
            if (assets.audio[id]) {
                // Update usage counter
                updateAssetUsage(id, 'audio', priority);
                resolve(assets.audio[id]);
                return;
            }
            
            // Start performance tracking
            PerformanceProfiler.startMarker(`load_audio_${id}`);
            
            const audio = new Audio();
            
            audio.oncanplaythrough = () => {
                // Store in cache
                assets.audio[id] = audio;
                
                // Track usage
                updateAssetUsage(id, 'audio', priority);
                
                // Estimate size for cache management (rough estimate based on duration)
                let estimatedSize = 0.5; // Default 0.5MB if duration unavailable
                if (audio.duration) {
                    // Rough estimate: 1MB per minute of audio at medium quality
                    estimatedSize = (audio.duration / 60) * 1;
                }
                cacheSize.audio += estimatedSize;
                
                // Check if we need to free up cache space
                if (cacheSize.audio > CACHE_LIMITS.audio) {
                    cleanupCache('audio');
                }
                
                // End performance tracking
                const loadTime = PerformanceProfiler.endMarker(`load_audio_${id}`);
                PerformanceProfiler.trackLoadTime('audio', id, loadTime);
                
                // Remove the event listener to prevent memory leaks
                audio.oncanplaythrough = null;
                
                resolve(audio);
            };
            
            audio.onerror = () => {
                // End performance tracking
                PerformanceProfiler.endMarker(`load_audio_${id}`);
                
                const error = ErrorHandler.assetLoadError(id, 'audio', { src });
                reject(error);
            };
            
            audio.src = src;
            audio.load(); // Start loading the audio
        });
    }
    
    // Load a data asset (JSON)
    function loadData(id, src, priority = 1) {
        return new Promise((resolve, reject) => {
            // Skip if already loaded
            if (assets.data[id]) {
                // Update usage counter
                updateAssetUsage(id, 'data', priority);
                resolve(assets.data[id]);
                return;
            }
            
            // Start performance tracking
            PerformanceProfiler.startMarker(`load_data_${id}`);
            
            fetch(src)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Failed to load data: ${response.status} ${response.statusText}`);
                    }
                    return response.json();
                })
                .then(data => {
                    // Store in cache
                    assets.data[id] = data;
                    
                    // Track usage
                    updateAssetUsage(id, 'data', priority);
                    
                    // Estimate size for cache management
                    const jsonString = JSON.stringify(data);
                    const estimatedSize = jsonString.length / (1024 * 1024); // Size in MB
                    cacheSize.data += estimatedSize;
                    
                    // Check if we need to free up cache space
                    if (cacheSize.data > CACHE_LIMITS.data) {
                        cleanupCache('data');
                    }
                    
                    // End performance tracking
                    const loadTime = PerformanceProfiler.endMarker(`load_data_${id}`);
                    PerformanceProfiler.trackLoadTime('data', id, loadTime);
                    
                    resolve(data);
                })
                .catch(error => {
                    // End performance tracking
                    PerformanceProfiler.endMarker(`load_data_${id}`);
                    
                    const assetError = ErrorHandler.assetLoadError(id, 'data', { src, error: error.message });
                    reject(assetError);
                });
        });
    }
    
    // Update asset usage tracking
    function updateAssetUsage(id, type, priority) {
        const key = `${type}_${id}`;
        
        if (!assetUsage[key]) {
            assetUsage[key] = {
                id,
                type,
                useCount: 0,
                lastUsed: Date.now(),
                priority: priority || 1
            };
        }
        
        assetUsage[key].useCount++;
        assetUsage[key].lastUsed = Date.now();
        assetUsage[key].priority = Math.max(assetUsage[key].priority, priority || 1);
    }
    
    // Cleanup cache to free memory
    function cleanupCache(assetType) {
        Debugging.info(`Cleaning up ${assetType} cache`);
        
        // Get all assets of this type
        const usageEntries = Object.values(assetUsage)
            .filter(entry => entry.type === assetType)
            .sort((a, b) => {
                // Sort by priority (high to low)
                if (a.priority !== b.priority) {
                    return b.priority - a.priority;
                }
                
                // Then by use count (high to low)
                if (a.useCount !== b.useCount) {
                    return b.useCount - a.useCount;
                }
                
                // Then by last used time (recent to old)
                return b.lastUsed - a.lastUsed;
            });
        
        // Keep track of how much we've freed
        let freedSize = 0;
        const targetFree = cacheSize[assetType] * 0.3; // Free 30% of the cache
        
        // Remove least important assets until we've freed enough space
        for (let i = usageEntries.length - 1; i >= 0; i--) {
            const entry = usageEntries[i];
            const assetId = entry.id;
            
            // Skip if it's being used very recently (last 2 seconds)
            if (Date.now() - entry.lastUsed < 2000) {
                continue;
            }
            
            // Remove the asset
            if (assets[assetType][assetId]) {
                // Estimate the size that will be freed
                let freedAssetSize = 0;
                
                if (assetType === 'images') {
                    const img = assets[assetType][assetId];
                    freedAssetSize = (img.width * img.height * 4) / (1024 * 1024);
                } else if (assetType === 'audio') {
                    const audio = assets[assetType][assetId];
                    freedAssetSize = audio.duration ? (audio.duration / 60) * 1 : 0.5;
                } else if (assetType === 'data') {
                    const data = assets[assetType][assetId];
                    freedAssetSize = JSON.stringify(data).length / (1024 * 1024);
                }
                
                // Remove from cache
                delete assets[assetType][assetId];
                freedSize += freedAssetSize;
                
                Debugging.info(`Removed ${assetId} from ${assetType} cache (${freedAssetSize.toFixed(2)}MB)`);
                
                // Stop if we've freed enough
                if (freedSize >= targetFree) {
                    break;
                }
            }
        }
        
        // Update cache size
        cacheSize[assetType] -= freedSize;
        
        Debugging.info(`Freed ${freedSize.toFixed(2)}MB from ${assetType} cache`);
    }
    
    // Get an asset from cache
    function getAsset(id, type) {
        if (!type) {
            // Try to find the asset in any category
            if (assets.images[id]) {
                updateAssetUsage(id, 'images');
                return assets.images[id];
            }
            if (assets.audio[id]) {
                updateAssetUsage(id, 'audio');
                return assets.audio[id];
            }
            if (assets.data[id]) {
                updateAssetUsage(id, 'data');
                return assets.data[id];
            }
            return null;
        }
        
        // Get from specific category
        if (assets[type] && assets[type][id]) {
            updateAssetUsage(id, type);
            return assets[type][id];
        }
        
        return null;
    }
    
    // Clear all assets from cache
    function clearCache() {
        // Clear images
        for (const id in assets.images) {
            delete assets.images[id];
        }
        
        // Clear audio
        for (const id in assets.audio) {
            delete assets.audio[id];
        }
        
        // Clear data
        for (const id in assets.data) {
            delete assets.data[id];
        }
        
        // Reset cache sizes
        cacheSize.images = 0;
        cacheSize.audio = 0;
        cacheSize.data = 0;
        
        Debugging.info('Asset cache cleared');
    }
    
    // Get cache usage statistics
    function getCacheStats() {
        return {
            assetCounts: {
                images: Object.keys(assets.images).length,
                audio: Object.keys(assets.audio).length,
                data: Object.keys(assets.data).length,
                total: Object.keys(assets.images).length + 
                       Object.keys(assets.audio).length + 
                       Object.keys(assets.data).length
            },
            cacheSize: { ...cacheSize },
            cacheLimits: { ...CACHE_LIMITS }
        };
    }
    
    // Public API
    return {
        preloadAssets,
        loadImage,
        loadAudio,
        loadData,
        getAsset,
        clearCache,
        getCacheStats
    };
})();

export default AssetCache;