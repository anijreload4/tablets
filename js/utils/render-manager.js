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
            
            // Store canvas references
            canvasLayers = { ...canvasElements };
            
            // Get rendering contexts
            for (const layer in canvasLayers) {
                if (canvasLayers[layer]) {
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
                }
            }
            
            // Initialize canvas sizes
            handleResize();
            
            // Add window resize handler
            window.addEventListener('resize', handleResize);
            
            isInitialized = true;
            Debugging.info('Render manager initialized');
            
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
        } catch (error) {
            Debugging.error('Failed to initialize render manager', error);
            throw error;
        }
    }
    
    // Handle window resize
    function handleResize() {
        for (const layer in canvasLayers) {
            if (canvasLayers[layer]) {
                const canvas = canvasLayers[layer];
                const container = canvas.parentElement;
                
                if (container) {
                    // Set canvas dimensions to match container
                    canvas.width = container.clientWidth;
                    canvas.height = container.clientHeight;
                    
                    // For WebGL contexts, update viewport
                    if (contexts[layer] instanceof WebGLRenderingContext) {
                        contexts[layer].viewport(0, 0, canvas.width, canvas.height);
                    }
                }
            }
        }
        
        // Notify renderables about resize
        renderables.forEach(renderable => {
            if (renderable.onResize) {
                renderable.onResize(getCanvasSize());
            }
        });
    }
    
    // Start the render loop
    function startRenderLoop() {
        if (isRendering) return;
        
        isRendering = true;
        lastRenderTime = performance.now();
        renderLoopId = requestAnimationFrame(renderFrame);
        
        Debugging.info('Render loop started');
    }
    
    // Stop the render loop
    function stopRenderLoop() {
        if (!isRendering) return;
        
        isRendering = false;
        if (renderLoopId) {
            cancelAnimationFrame(renderLoopId);
            renderLoopId = null;
        }
        
        Debugging.info('Render loop stopped');
    }
    
    // Main render function
    function renderFrame(timestamp) {
        if (!isRendering) return;
        
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
            clearLayer(layer);
        }
        
        // Update and render all renderables
        for (const renderable of renderables) {
            if (renderable.update) {
                renderable.update(deltaTime / 1000, timestamp); // Convert to seconds
            }
            
            if (renderable.render) {
                const context = contexts[renderable.layer || 'board'];
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
        }
        
        // End performance tracking
        const frameTime = PerformanceProfiler.endMarker('frame_render');
        
        // Queue next frame
        renderLoopId = requestAnimationFrame(renderFrame);
    }
    
    // Add an object to be rendered each frame
    function addRenderable(renderable) {
        if (!renderable) return;
        
        // Validate renderable object
        if (!renderable.render) {
            Debugging.warning('Attempted to add renderable without render method', renderable);
            return false;
        }
        
        // Add to renderables array
        renderables.push(renderable);
        
        // Sort renderables by zIndex (if provided)
        renderables.sort((a, b) => {
            const zIndexA = a.zIndex !== undefined ? a.zIndex : 0;
            const zIndexB = b.zIndex !== undefined ? b.zIndex : 0;
            return zIndexA - zIndexB;
        });
        
        return true;
    }
    
    // Remove a renderable object
    function removeRenderable(renderable) {
        if (!renderable) return;
        
        const index = renderables.indexOf(renderable);
        if (index !== -1) {
            renderables.splice(index, 1);
            return true;
        }
        
        return false;
    }
    
    // Clear a specific canvas layer
    function clearLayer(layer) {
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
    }
    
    // Get rendering context for a layer
    function getContext(layer) {
        return contexts[layer] || null;
    }
    
    // Get canvas size
    function getCanvasSize() {
        // Use the board layer as reference if available
        if (canvasLayers.board) {
            return {
                width: canvasLayers.board.width,
                height: canvasLayers.board.height
            };
        }
        
        // Otherwise use the first available layer
        for (const layer in canvasLayers) {
            if (canvasLayers[layer]) {
                return {
                    width: canvasLayers[layer].width,
                    height: canvasLayers[layer].height
                };
            }
        }
        
        return { width: 0, height: 0 };
    }
    
    // Get average frame time
    function getAverageFrameTime() {
        if (frameTimes.length === 0) return 0;
        
        const sum = frameTimes.reduce((total, time) => total + time, 0);
        return sum / frameTimes.length;
    }
    
    // Public API
    return {
        init
    };
})();

export default RenderManager;