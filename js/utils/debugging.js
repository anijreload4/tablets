/**
 * Tablets & Trials: The Covenant Quest
 * Debugging Tools - Custom debugging utilities
 */

// Debugging Module
const Debugging = (function() {
    let isDebugMode = false;
    let debugPanel = null;
    const logHistory = [];
    const maxLogHistory = 100;
    
    // Initialize debug panel
    function initDebugPanel() {
        if (debugPanel) return;
        
        debugPanel = document.createElement('div');
        debugPanel.className = 'debug-panel';
        debugPanel.innerHTML = `
            <div class="debug-header">
                <h3>Debug Panel</h3>
                <button id="debug-close">×</button>
            </div>
            <div class="debug-tabs">
                <button data-tab="general" class="active">General</button>
                <button data-tab="board">Board</button>
                <button data-tab="performance">Performance</button>
                <button data-tab="logs">Logs</button>
            </div>
            <div class="debug-content">
                <div data-content="general" class="active">
                    <div id="debug-game-state"></div>
                    <div id="debug-controls">
                        <button id="debug-win-level">Win Level</button>
                        <button id="debug-unlock-all">Unlock All Levels</button>
                        <button id="debug-fill-faith">Fill Faith Meter</button>
                    </div>
                </div>
                <div data-content="board">
                    <div id="debug-board-info"></div>
                    <div id="debug-tile-controls">
                        <select id="debug-tile-type">
                            <option value="water">Water</option>
                            <option value="manna">Manna</option>
                            <option value="fire">Fire</option>
                            <option value="stone">Stone</option>
                            <option value="quail">Quail</option>
                            <option value="staff">Staff of Moses</option>
                        </select>
                        <button id="debug-place-tile">Place Selected Tile</button>
                        <button id="debug-clear-matches">Clear All Matches</button>
                    </div>
                </div>
                <div data-content="performance">
                    <div id="debug-fps"></div>
                    <div id="debug-memory"></div>
                    <div id="debug-render-time"></div>
                </div>
                <div data-content="logs">
                    <select id="debug-log-level">
                        <option value="all">All</option>
                        <option value="error">Errors Only</option>
                        <option value="warning">Warnings+</option>
                        <option value="info">Info+</option>
                    </select>
                    <div id="debug-log-content"></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(debugPanel);
        
        // Set up event handlers
        document.getElementById('debug-close').addEventListener('click', hideDebugPanel);
        
        // Tab switching
        document.querySelectorAll('.debug-tabs button').forEach(tab => {
            tab.addEventListener('click', () => {
                // Deactivate all tabs and content
                document.querySelectorAll('.debug-tabs button').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.debug-content > div').forEach(c => c.classList.remove('active'));
                
                // Activate selected tab and content
                tab.classList.add('active');
                document.querySelector(`.debug-content > div[data-content="${tab.dataset.tab}"]`).classList.add('active');
            });
        });
        
        // Debug actions
        document.getElementById('debug-win-level').addEventListener('click', () => {
            if (window.game && window.game.currentLevel) {
                window.game.completeLevel(3); // Complete with 3 stars
            }
        });
        
        document.getElementById('debug-unlock-all').addEventListener('click', () => {
            if (window.game) {
                // Check if SaveManager is available
                const SaveManager = window.game.SaveManager || 
                                   (window.requirejs && window.requirejs('services/save-manager'));
                
                if (SaveManager && SaveManager.unlockAllLevels) {
                    SaveManager.unlockAllLevels();
                    info('All levels unlocked');
                }
            }
        });
        
        document.getElementById('debug-fill-faith').addEventListener('click', () => {
            if (window.game) {
                window.game.updateFaithMeter(100);
                info('Faith meter filled');
            }
        });
        
        // Place tile action
        document.getElementById('debug-place-tile').addEventListener('click', () => {
            const tileType = document.getElementById('debug-tile-type').value;
            if (window.game && window.game.board) {
                window.game.board.debugPlaceTile(tileType);
            }
        });
        
        // Log level filter
        document.getElementById('debug-log-level').addEventListener('change', updateLogDisplay);
        
        // Start performance monitoring
        startPerformanceMonitoring();
    }
    
    // Show/hide debug panel
    function showDebugPanel() {
        initDebugPanel();
        debugPanel.style.display = 'block';
        updateDebugInfo();
    }
    
    function hideDebugPanel() {
        if (debugPanel) {
            debugPanel.style.display = 'none';
        }
    }
    
    // Update debug info
    function updateDebugInfo() {
        if (!debugPanel || debugPanel.style.display === 'none') return;
        
        // Update game state info
        if (window.game) {
            const gameStateEl = document.getElementById('debug-game-state');
            gameStateEl.innerHTML = `
                <div><strong>Game Version:</strong> ${window.gameConfig?.version || '1.0.0'}</div>
                <div><strong>Current Level:</strong> ${window.game.currentLevel?.id || 'None'}</div>
                <div><strong>Score:</strong> ${document.getElementById('score')?.textContent || 0}</div>
                <div><strong>Moves Left:</strong> ${document.getElementById('moves-left')?.textContent || 0}</div>
                <div><strong>Faith Meter:</strong> ${document.getElementById('faith-meter-value')?.textContent || '0%'}</div>
            `;
            
            // Update board info
            const boardInfoEl = document.getElementById('debug-board-info');
            if (window.game.board) {
                const tileStats = window.game.board.getTileStats();
                const statsList = [];
                
                for (const type in tileStats) {
                    statsList.push(`<li>${type}: ${tileStats[type]} (${Math.round(tileStats[type]/window.game.board.getTileCount()*100)}%)</li>`);
                }
                
                boardInfoEl.innerHTML = `
                    <div><strong>Board Size:</strong> ${window.game.board.width}x${window.game.board.height}</div>
                    <div><strong>Total Tiles:</strong> ${window.game.board.getTileCount()}</div>
                    <div><strong>Tile Types:</strong></div>
                    <ul>
                        ${statsList.join('')}
                    </ul>
                    <div><strong>Possible Matches:</strong> ${window.game.board.getPossibleMatchCount()}</div>
                `;
            } else {
                boardInfoEl.innerHTML = '<div>No active board</div>';
            }
        }
        
        // Schedule next update
        setTimeout(updateDebugInfo, 500);
    }
    
    // Performance monitoring
    let lastFrameTime = 0;
    let frameCount = 0;
    let frameTimes = [];
    const maxFrameTimes = 60;
    
    function startPerformanceMonitoring() {
        // Frame counter
        function countFrame(timestamp) {
            if (lastFrameTime === 0) {
                lastFrameTime = timestamp;
            }
            
            // Calculate frame time
            const frameTime = timestamp - lastFrameTime;
            lastFrameTime = timestamp;
            
            // Store frame time
            frameTimes.push(frameTime);
            if (frameTimes.length > maxFrameTimes) {
                frameTimes.shift();
            }
            
            // Count frame
            frameCount++;
            
            // Update every second
            if (timestamp - lastUpdateTime > 1000) {
                updatePerformanceInfo();
                frameCount = 0;
                lastUpdateTime = timestamp;
            }
            
            // Continue monitoring
            requestAnimationFrame(countFrame);
        }
        
        let lastUpdateTime = performance.now();
        requestAnimationFrame(countFrame);
        
        // Memory monitoring where supported
        if (performance.memory) {
            setInterval(() => {
                const memoryEl = document.getElementById('debug-memory');
                if (memoryEl) {
                    const usedHeap = Math.round(performance.memory.usedJSHeapSize / (1024 * 1024));
                    const totalHeap = Math.round(performance.memory.totalJSHeapSize / (1024 * 1024));
                    memoryEl.innerHTML = `
                        <div><strong>Memory Usage:</strong> ${usedHeap}MB / ${totalHeap}MB</div>
                        <div class="memory-bar">
                            <div class="memory-used" style="width: ${(usedHeap/totalHeap)*100}%"></div>
                        </div>
                    `;
                }
            }, 2000);
        }
    }
    
    function updatePerformanceInfo() {
        const fpsEl = document.getElementById('debug-fps');
        if (fpsEl) {
            // Calculate average FPS
            const fps = frameCount;
            
            // Calculate average frame time
            const avgFrameTime = frameTimes.reduce((sum, time) => sum + time, 0) / frameTimes.length;
            
            // Calculate FPS stability (standard deviation)
            const sumSquareDiff = frameTimes.reduce((sum, time) => {
                const diff = time - avgFrameTime;
                return sum + (diff * diff);
            }, 0);
            const stdDev = Math.sqrt(sumSquareDiff / frameTimes.length);
            
            // Update display
            fpsEl.innerHTML = `
                <div><strong>FPS:</strong> ${fps}</div>
                <div><strong>Frame Time:</strong> ${avgFrameTime.toFixed(2)}ms (±${stdDev.toFixed(2)}ms)</div>
                <div class="fps-bar ${fps < 30 ? 'fps-low' : fps < 55 ? 'fps-medium' : 'fps-good'}">
                    <div class="fps-value" style="width: ${Math.min(fps/60, 1)*100}%"></div>
                </div>
            `;
        }
    }
    
    // Debug logging
    function log(level, message, data) {
        // Add to log history
        logHistory.push({
            level,
            message,
            data,
            timestamp: new Date()
        });
        
        // Keep history limited
        if (logHistory.length > maxLogHistory) {
            logHistory.shift();
        }
        
        // Update log display if visible
        updateLogDisplay();
        
        // Also log to console
        switch (level) {
            case 'error':
                console.error(message, data);
                break;
            case 'warning':
                console.warn(message, data);
                break;
            case 'info':
                console.info(message, data);
                break;
            default:
                console.log(message, data);
        }
    }
    
    function updateLogDisplay() {
        const logContentEl = document.getElementById('debug-log-content');
        if (!logContentEl) return;
        
        const logLevel = document.getElementById('debug-log-level')?.value || 'all';
        
        // Filter logs based on selected level
        const filteredLogs = logHistory.filter(entry => {
            if (logLevel === 'all') return true;
            if (logLevel === 'error' && entry.level === 'error') return true;
            if (logLevel === 'warning' && (entry.level === 'error' || entry.level === 'warning')) return true;
            if (logLevel === 'info' && entry.level !== 'debug') return true;
            return false;
        });
        
        // Generate HTML
        logContentEl.innerHTML = filteredLogs.reverse().map(entry => {
            const time = entry.timestamp.toTimeString().split(' ')[0];
            const dataString = entry.data ? JSON.stringify(entry.data, null, 2) : '';
            
            return `
                <div class="log-entry log-${entry.level}">
                    <div class="log-time">${time}</div>
                    <div class="log-level">${entry.level.toUpperCase()}</div>
                    <div class="log-message">${entry.message}</div>
                    ${dataString ? `<div class="log-data">${dataString}</div>` : ''}
                </div>
            `;
        }).join('');
    }
    
    // Toggle debug mode
    function toggleDebugMode() {
        isDebugMode = !isDebugMode;
        
        if (isDebugMode) {
            showDebugPanel();
            document.body.classList.add('debug-mode');
            log('info', 'Debug mode enabled');
        } else {
            hideDebugPanel();
            document.body.classList.remove('debug-mode');
            log('info', 'Debug mode disabled');
        }
        
        return isDebugMode;
    }
    
    // Check if URL has debug parameter
    if (window.location.search.includes('debug=true')) {
        isDebugMode = true;
        // Wait for DOM to be ready
        document.addEventListener('DOMContentLoaded', () => {
            showDebugPanel();
            document.body.classList.add('debug-mode');
        });
    }
    
    // Add keyboard shortcut (Ctrl+Shift+D)
    document.addEventListener('keydown', (event) => {
        if (event.ctrlKey && event.shiftKey && event.key === 'D') {
            toggleDebugMode();
            event.preventDefault();
        }
    });
    
    // Public API
    return {
        toggleDebugMode,
        showDebugPanel,
        hideDebugPanel,
        log,
        error: (message, data) => log('error', message, data),
        warning: (message, data) => log('warning', message, data),
        info: (message, data) => log('info', message, data),
        debug: (message, data) => log('debug', message, data),
        isDebugMode: () => isDebugMode
    };
})();

export default Debugging;