/**
 * Tablets & Trials: The Covenant Quest
 * Performance Profiler - Track and analyze performance metrics
 */

import Debugging from './debugging.js';

// Performance Profiler Module
const PerformanceProfiler = (function() {
    // Performance markers
    const markers = {};
    
    // Metrics tracking
    const metrics = {
        fps: [],
        frameTime: [],
        memoryUsage: [],
        loadTimes: {},
        renderTimes: {}
    };
    
    // Maximum history size
    const MAX_HISTORY = 300; // 5 minutes at 1 sample per second
    
    // Active profiling session
    let isProfilingActive = false;
    let profilingInterval = null;
    
    // Start a performance marker
    function startMarker(name) {
        if (!name) return;
        
        markers[name] = {
            startTime: performance.now(),
            endTime: null,
            duration: null
        };
        
        // Also use browser Performance API if available
        if (window.performance && window.performance.mark) {
            window.performance.mark(`${name}_start`);
        }
    }
    
    // End a performance marker and get duration
    function endMarker(name) {
        if (!markers[name] || markers[name].endTime !== null) return null;
        
        markers[name].endTime = performance.now();
        markers[name].duration = markers[name].endTime - markers[name].startTime;
        
        // Also use browser Performance API if available
        if (window.performance && window.performance.mark && window.performance.measure) {
            window.performance.mark(`${name}_end`);
            window.performance.measure(name, `${name}_start`, `${name}_end`);
        }
        
        return markers[name].duration;
    }
    
    // Get marker duration
    function getMarkerDuration(name) {
        if (!markers[name] || markers[name].endTime === null) return null;
        return markers[name].duration;
    }
    
    // Track load time for resource
    function trackLoadTime(resourceType, resourceId, loadTime) {
        if (!metrics.loadTimes[resourceType]) {
            metrics.loadTimes[resourceType] = {};
        }
        
        metrics.loadTimes[resourceType][resourceId] = loadTime;
    }
    
    // Track render time for component
    function trackRenderTime(componentId, renderTime) {
        if (!metrics.renderTimes[componentId]) {
            metrics.renderTimes[componentId] = [];
        }
        
        metrics.renderTimes[componentId].push(renderTime);
        
        // Keep history limited
        if (metrics.renderTimes[componentId].length > 100) {
            metrics.renderTimes[componentId].shift();
        }
    }
    
    // Start active profiling session
    function startProfiling() {
        if (isProfilingActive) return;
        
        isProfilingActive = true;
        let lastFrameTime = performance.now();
        let frames = 0;
        
        // Clear previous metrics
        metrics.fps = [];
        metrics.frameTime = [];
        metrics.memoryUsage = [];
        
        // Set up requestAnimationFrame callback for FPS tracking
        function frameCallback(timestamp) {
            if (!isProfilingActive) return;
            
            // Track frame
            frames++;
            
            // Request next frame
            requestAnimationFrame(frameCallback);
        }
        
        // Start frame tracking
        requestAnimationFrame(frameCallback);
        
        // Set up interval for collecting metrics
        profilingInterval = setInterval(() => {
            // Calculate FPS
            const currentTime = performance.now();
            const elapsedTime = currentTime - lastFrameTime;
            const currentFps = Math.round((frames / elapsedTime) * 1000);
            
            // Store metrics
            metrics.fps.push({
                timestamp: new Date().toISOString(),
                value: currentFps
            });
            
            // Get frame time from RenderManager if available
            if (window.game && window.game.renderManager) {
                const avgFrameTime = window.game.renderManager.getAverageFrameTime();
                metrics.frameTime.push({
                    timestamp: new Date().toISOString(),
                    value: avgFrameTime
                });
            }
            
            // Track memory usage if available
            if (window.performance && window.performance.memory) {
                metrics.memoryUsage.push({
                    timestamp: new Date().toISOString(),
                    usedJSHeapSize: window.performance.memory.usedJSHeapSize,
                    totalJSHeapSize: window.performance.memory.totalJSHeapSize
                });
            }
            
            // Keep history limited
            if (metrics.fps.length > MAX_HISTORY) metrics.fps.shift();
            if (metrics.frameTime.length > MAX_HISTORY) metrics.frameTime.shift();
            if (metrics.memoryUsage.length > MAX_HISTORY) metrics.memoryUsage.shift();
            
            // Reset counters
            lastFrameTime = currentTime;
            frames = 0;
            
        }, 1000); // Collect metrics every second
        
        Debugging.info('Performance profiling started');
    }
    
    // Stop active profiling session
    function stopProfiling() {
        if (!isProfilingActive) return;
        
        isProfilingActive = false;
        
        // Clear interval
        if (profilingInterval) {
            clearInterval(profilingInterval);
            profilingInterval = null;
        }
        
        Debugging.info('Performance profiling stopped');
    }
    
    // Generate performance report
    function generateReport() {
        // Basic statistics
        const calculateStats = (values) => {
            if (!values || values.length === 0) return null;
            
            // Extract numeric values if objects
            const nums = values.map(v => typeof v === 'object' ? v.value : v);
            
            const sum = nums.reduce((a, b) => a + b, 0);
            const avg = sum / nums.length;
            const min = Math.min(...nums);
            const max = Math.max(...nums);
            
            // Calculate variance and standard deviation
            const variance = nums.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / nums.length;
            const stdDev = Math.sqrt(variance);
            
            return {
                count: nums.length,
                min: min,
                max: max,
                avg: avg,
                stdDev: stdDev
            };
        };
        
        // Generate report
        const report = {
            timestamp: new Date().toISOString(),
            fps: calculateStats(metrics.fps),
            frameTime: calculateStats(metrics.frameTime),
            memory: metrics.memoryUsage.length > 0 ? {
                latest: metrics.memoryUsage[metrics.memoryUsage.length - 1],
                trend: calculateStats(metrics.memoryUsage.map(m => m.usedJSHeapSize))
            } : null,
            slowestResources: getSlowestResources(5),
            slowestComponents: getSlowestComponents(5),
            markers: { ...markers }
        };
        
        return report;
    }
    
    // Get slowest loading resources
    function getSlowestResources(count = 5) {
        const allResources = [];
        
        // Flatten resource types
        for (const resourceType in metrics.loadTimes) {
            for (const resourceId in metrics.loadTimes[resourceType]) {
                allResources.push({
                    type: resourceType,
                    id: resourceId,
                    loadTime: metrics.loadTimes[resourceType][resourceId]
                });
            }
        }
        
        // Sort by load time (descending)
        allResources.sort((a, b) => b.loadTime - a.loadTime);
        
        // Return top N
        return allResources.slice(0, count);
    }
    
    // Get slowest rendering components
    function getSlowestComponents(count = 5) {
        const componentStats = [];
        
        // Calculate average render time for each component
        for (const componentId in metrics.renderTimes) {
            const times = metrics.renderTimes[componentId];
            const average = times.reduce((a, b) => a + b, 0) / times.length;
            
            componentStats.push({
                id: componentId,
                avgRenderTime: average,
                sampleCount: times.length
            });
        }
        
        // Sort by average render time (descending)
        componentStats.sort((a, b) => b.avgRenderTime - a.avgRenderTime);
        
        // Return top N
        return componentStats.slice(0, count);
    }
    
    // Reset all metrics
    function resetMetrics() {
        for (const key in metrics) {
            if (Array.isArray(metrics[key])) {
                metrics[key] = [];
            } else if (typeof metrics[key] === 'object') {
                metrics[key] = {};
            }
        }
        
        // Clear markers
        for (const key in markers) {
            delete markers[key];
        }
    }
    
    // Public API
    return {
        startMarker,
        endMarker,
        getMarkerDuration,
        trackLoadTime,
        trackRenderTime,
        startProfiling,
        stopProfiling,
        generateReport,
        resetMetrics,
        isProfilingActive: () => isProfilingActive,
        getMetrics: () => ({ ...metrics })
    };
})();

export default PerformanceProfiler;