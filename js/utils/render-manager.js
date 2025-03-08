/**
 * Tablets & Trials: The Covenant Quest
 * Render Manager - Handles rendering and canvas management
 */

import Debugging from './debugging.js';
import PerformanceProfiler from './performance-profiler.js';

// Render Manager Module
const RenderManager = (function() {
    // Private variables
    let canvasLayers = {};
    let contexts = {};
    let isInitialized = false;
    let isRendering = false;
    let renderLoopId = null;
    let lastRenderTime = 0;
    let frameTimes = [];
    const maxFrameTimes = 60; // Track up to 60 frames for average
    let renderables = []; // Objects to render each frame
    
    // Initialize the render manager
    function init(canvasElements) {
        try {
            if (isInitialized) {
                return getPublicAPI();
            }
            
            // Safety check for canvas elements
            if (!canvasElements || typeof canvasElements !== 'object') {
                Debugging.warning('Invalid canvas elements provided to RenderManager');
                canvasLayers = {};
            } else {
                // Store canvas references
                canvasLayers = { ...canvasElements };
            }
            
            // Get rendering contexts
            for (const layer in canvasLayers) {
                if (canvasLayers[layer]) {
                    try {
                        contexts[layer] = canvasLayers[layer].getContext('2d');
                        
                        // Try to enable alpha support for WebGL contexts
                        if (contexts[layer] && window.WebGL2RenderingContext) {
                            try {
                                const gl = canvasLayers[layer].getContext('webgl', { alpha: true });
                                if (gl) {
                                    Debugging.info(`WebGL context obtained for ${layer} layer`);
                                    contexts[layer] = gl;
                                }
                            } catch (e) {
                                // Fallback to 2D context is already done
                            }
                        }
                    } catch (contextError) {
                        Debugging.warning(`Failed to get rendering context for ${layer}`, contextError);
                        contexts[layer] = null;
                    }
                }
            }
            
            // Initialize canvas sizes
            handleResize();
            
            // Add window resize handler
            window.addEventListener('resize', handleResize);
            
            isInitialized = true;
            Debugging.info('Render manager initialized');
            
            return getPublicAPI();
        } catch (error) {
            Debugging.error('Failed to initialize render manager', error);
            // Return limited functionality instead of throwing
            return createDummyRenderManager();
        }
    }
    
    // Create a public API object
    function getPublicAPI() {
        return {
            startRenderLoop,
            stopRenderLoop,
            addRenderable,
            removeRenderable,
            clearLayer,
            handleResize,
            getContext,
            getCanvasSize,
            getAverageFrameTime
        };
    }
    
    // Create a limited functionality render manager
    function createDummyRenderManager() {
        Debugging.warning('Using dummy render manager due to initialization failure');
        return {
            startRenderLoop: function() {},
            stopRenderLoop: function() {},
            addRenderable: function() { return false; },
            removeRenderable: function() { return false; },
            clearLayer: function() {},
            handleResize: function() {},
            getContext: function() { return null; },
            getCanvasSize: function() { return { width: 0, height: 0 }; },
            getAverageFrameTime: function() { return 0; }
        };
    }
    
    // Handle window resize
    function handleResize() {
        try {
            for (const layer in canvasLayers) {
                if (canvasLayers[layer]) {
                    const canvas = canvasLayers[layer];
                    const container = canvas.parentElement;
                    
                    if (container) {
                        // Set canvas dimensions to match container
                        canvas.width = container.clientWidth || 300;  // Fallback size
                        canvas.height = container.clientHeight || 300; // Fallback size
                        
                        // For WebGL contexts, update viewport
                        if (contexts[layer] instanceof WebGLRenderingContext) {
                            contexts[layer].viewport(0, 0, canvas.width, canvas.height);
                        }
                    }
                }
            }
            
            // Notify renderables about resize
            renderables.forEach(renderable => {
                if (renderable && typeof renderable.onResize === 'function') {
                    try {
                        renderable.onResize(getCanvasSize());
                    } catch (error) {
                        Debugging.warning(`Error in renderable onResize: ${renderable.id || 'unknown'}`, error);
                    }
                }
            });
        } catch (error) {
            Debugging.error('Error handling resize in RenderManager', error);
        }
    }
    
    // Start the render loop
    function startRenderLoop() {
        if (isRendering) return;
        
        try {
            isRendering = true;
            lastRenderTime = performance.now();
            renderLoopId = requestAnimationFrame(renderFrame);
            
            Debugging.info('Render loop started');
        } catch (error) {
            Debugging.error('Failed to start render loop', error);
            isRendering = false;
        }
    }
    
    // Stop the render loop
    function stopRenderLoop() {
        if (!isRendering) return;
        
        try {
            isRendering = false;
            if (renderLoopId) {
                cancelAnimationFrame(renderLoopId);
                renderLoopId = null;
            }
            
            Debugging.info('Render loop stopped');
        } catch (error) {
            Debugging.error('Failed to stop render loop', error);
        }
    }
    
    // Main render function
    function renderFrame(timestamp) {
        if (!isRendering) return;
        
        try {
            // Calculate delta time
            const deltaTime = timestamp - lastRenderTime;
            lastRenderTime = timestamp;
            
            // Track frame time for performance monitoring
            frameTimes.push(deltaTime);
            if (frameTimes.length > maxFrameTimes) {
                frameTimes.shift();
            }
            
            // Start performance tracking
            PerformanceProfiler.startMarker('frame_render');
            
            // Clear all layers
            for (const layer in contexts) {
                if (contexts[layer]) {
                    clearLayer(layer);
                }
            }
            
            // Update and render all renderables
            for (const renderable of renderables) {
                if (!renderable) continue;
                
                try {
                    if (typeof renderable.update === 'function') {
                        renderable.update(deltaTime / 1000, timestamp); // Convert to seconds
                    }
                    
                    if (typeof renderable.render === 'function') {
                        const layer = renderable.layer || 'board';
                        const context = contexts[layer];
                        
                        if (context) {
                            // Start tracking this specific renderable
                            const trackId = `render_${renderable.id || 'unknown'}`;
                            PerformanceProfiler.startMarker(trackId);
                            
                            // Perform the rendering
                            renderable.render(context, deltaTime / 1000);
                            
                            // End tracking
                            const renderTime = PerformanceProfiler.endMarker(trackId);
                            if (renderable.id) {
                                PerformanceProfiler.trackRenderTime(renderable.id, renderTime);
                            }
                        }
                    }
                } catch (renderableError) {
                    Debugging.warning(`Error rendering: ${renderable.id || 'unknown'}`, renderableError);
                }
            }
            
            // End performance tracking
            const frameTime = PerformanceProfiler.endMarker('frame_render');
            
            // Queue next frame
            renderLoopId = requestAnimationFrame(renderFrame);
        } catch (error) {
            Debugging.error('Error in render frame', error);
            // Try to recover by requesting next frame anyway
            renderLoopId = requestAnimationFrame(renderFrame);
        }
    }
    
    // Add an object to be rendered each frame
    function addRenderable(renderable) {
        if (!renderable) return false;
        
        try {
            // Validate renderable object
            if (typeof renderable.render !== 'function') {
                Debugging.warning('Attempted to add renderable without render method', renderable);
                return false;
            }
            
            // Add to renderables array
            renderables.push(renderable);
            
            // Sort renderables by zIndex (if provided)
            renderables.sort((a, b) => {
                if (!a || !b) return 0;
                const zIndexA = a.zIndex !== undefined ? a.zIndex : 0;
                const zIndexB = b.zIndex !== undefined ? b.zIndex : 0;
                return zIndexA - zIndexB;
            });
            
            return true;
        } catch (error) {
            Debugging.error('Failed to add renderable', error);
            return false;
        }
    }
    
    // Remove a renderable object
    function removeRenderable(renderable) {
        if (!renderable) return false;
        
        try {
            const index = renderables.indexOf(renderable);
            if (index !== -1) {
                renderables.splice(index, 1);
                return true;
            }
            
            return false;
        } catch (error) {
            Debugging.error('Failed to remove renderable', error);
            return false;
        }
    }
    
    // Clear a specific canvas layer
    function clearLayer(layer) {
        try {
            const context = contexts[layer];
            const canvas = canvasLayers[layer];
            
            if (!context || !canvas) return;
            
            if (context instanceof WebGLRenderingContext) {
                // Clear WebGL context
                context.clearColor(0, 0, 0, 0);
                context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);
            } else {
                // Clear 2D context
                context.clearRect(0, 0, canvas.width, canvas.height);
            }
        } catch (error) {
            Debugging.warning(`Failed to clear layer: ${layer}`, error);
        }
    }
    
    // Get rendering context for a layer
    function getContext(layer) {
        return contexts[layer] || null;
    }
    
    // Get canvas size
    function getCanvasSize() {
        try {
            // Use the board layer as reference if available
            if (canvasLayers.board) {
                return {
                    width: canvasLayers.board.width || 0,
                    height: canvasLayers.board.height || 0
                };
            }
            
            // Otherwise use the first available layer
            for (const layer in canvasLayers) {
                if (canvasLayers[layer]) {
                    return {
                        width: canvasLayers[layer].width || 0,
                        height: canvasLayers[layer].height || 0
                    };
                }
            }
        } catch (error) {
            Debugging.warning('Error getting canvas size', error);
        }
        
        return { width: 0, height: 0 };
    }
    
    // Get average frame time
    function getAverageFrameTime() {
        if (frameTimes.length === 0) return 0;
        
        try {
            const sum = frameTimes.reduce((total, time) => total + time, 0);
            return sum / frameTimes.length;
        } catch (error) {
            Debugging.warning('Error calculating average frame time', error);
            return 0;
        }
    }
    
    // Public API
    return {
        init
    };
})();

export default RenderManager;