/**
 * Tablets & Trials: The Covenant Quest
 * UI Manager - Handles user interface screens and transitions
 */

import ErrorHandler from '../services/error-handler.js';
import Debugging from '../utils/debugging.js';
import AudioManager from '../audio/audio-manager.js';
import SaveManager from '../services/save-manager.js';
import LevelManager from '../game/level-manager.js';

// UI Manager Module
const UIManager = (function() {
    // Private variables
    let elements = {
        gameContainer: null,
        menuContainer: null,
        dialogueContainer: null,
        loadingContainer: null,
        loadingBar: null,
        currentScreen: null
    };
    
    let isInitialized = false;
    let activeScreen = null;
    let pauseOverlay = null;
    let errorOverlay = null;
    
    // Initialize the UI manager
    function init(elementRefs) {
        try {
            if (isInitialized) {
                return {
                    showScreen,
                    hideScreen,
                    showPauseScreen,
                    hidePauseScreen,
                    showErrorScreen,
                    showLoadingScreen,
                    hideLoadingScreen,
                    updateLoadingProgress,
                    populateJourneyMap
                };
            }
            
            // Store element references
            elements = { ...elements, ...elementRefs };
            
            // Validate required elements
            if (!elements.gameContainer || 
                !elements.menuContainer || 
                !elements.loadingContainer) {
                throw new ErrorHandler.GameError(
                    'Required UI elements are missing',
                    'UI_INIT_ERROR'
                );
            }
            
            // Create pause overlay
            createPauseOverlay();
            
            // Create error overlay
            createErrorOverlay();
            
            isInitialized = true;
            Debugging.info('UI manager initialized');
            
            return {
                showScreen,
                hideScreen,
                showPauseScreen,
                hidePauseScreen,
                showErrorScreen,
                showLoadingScreen,
                hideLoadingScreen,
                updateLoadingProgress,
                populateJourneyMap
            };
        } catch (error) {
            Debugging.error('Failed to initialize UI manager', error);
            throw error;
        }
    }
    
    // Create pause overlay
    function createPauseOverlay() {
        pauseOverlay = document.createElement('div');
        pauseOverlay.className = 'overlay-screen';
        pauseOverlay.id = 'pause-screen';
        pauseOverlay.innerHTML = `
            <div class="overlay-content">
                <h2>Game Paused</h2>
                <div class="pause-buttons">
                    <button id="resume-button" class="button button--primary">Resume</button>
                    <button id="restart-button" class="button">Restart Level</button>
                    <button id="settings-button" class="button">Settings</button>
                    <button id="quit-button" class="button">Quit to Menu</button>
                </div>
            </div>
        `;
        
        elements.gameContainer.appendChild(pauseOverlay);
        
        // Add event listeners
        document.getElementById('resume-button').addEventListener('click', () => {
            AudioManager.playSfx('button-click');
            hidePauseScreen();
            if (window.game) {
                window.game.resumeGame();
            }
        });
        
        document.getElementById('restart-button').addEventListener('click', () => {
            AudioManager.playSfx('button-click');
            hidePauseScreen();
            if (window.game && window.game.currentLevel) {
                window.game.loadLevel(window.game.currentLevel.id);
            }
        });
        
        document.getElementById('settings-button').addEventListener('click', () => {
            AudioManager.playSfx('button-click');
            // Toggle settings panel within pause screen
            togglePauseSettings();
        });
        
        document.getElementById('quit-button').addEventListener('click', () => {
            AudioManager.playSfx('button-click');
            hidePauseScreen();
            showScreen('main-menu');
        });
    }
    
    // Create error overlay
    function createErrorOverlay() {
        errorOverlay = document.createElement('div');
        errorOverlay.className = 'overlay-screen';
        errorOverlay.id = 'error-screen';
        errorOverlay.innerHTML = `
            <div class="overlay-content error-content">
                <h2>Oops! Something Went Wrong</h2>
                <p id="error-message">An unexpected error occurred.</p>
                <div class="error-buttons">
                    <button id="error-retry" class="button button--primary">Retry</button>
                    <button id="error-menu" class="button">Return to Menu</button>
                </div>
            </div>
        `;
        
        elements.gameContainer.appendChild(errorOverlay);
        
        // Add event listeners
        document.getElementById('error-retry').addEventListener('click', () => {
            AudioManager.playSfx('button-click');
            hideErrorScreen();
            
            // Reload current screen or level
            if (window.game && window.game.currentLevel) {
                window.game.loadLevel(window.game.currentLevel.id);
            } else {
                // Fallback to main menu
                showScreen('main-menu');
            }
        });
        
        document.getElementById('error-menu').addEventListener('click', () => {
            AudioManager.playSfx('button-click');
            hideErrorScreen();
            showScreen('main-menu');
        });
    }
    
    // Toggle settings panel within pause screen
    function togglePauseSettings() {
        const pauseContent = document.querySelector('#pause-screen .overlay-content');
        const hasSettings = pauseContent.classList.contains('show-settings');
        
        if (hasSettings) {
            // Hide settings and show main pause menu
            pauseContent.classList.remove('show-settings');
            pauseContent.innerHTML = `
                <h2>Game Paused</h2>
                <div class="pause-buttons">
                    <button id="resume-button" class="button button--primary">Resume</button>
                    <button id="restart-button" class="button">Restart Level</button>
                    <button id="settings-button" class="button">Settings</button>
                    <button id="quit-button" class="button">Quit to Menu</button>
                </div>
            `;
            
            // Reattach event listeners
            document.getElementById('resume-button').addEventListener('click', () => {
                AudioManager.playSfx('button-click');
                hidePauseScreen();
                if (window.game) {
                    window.game.resumeGame();
                }
            });
            
            document.getElementById('restart-button').addEventListener('click', () => {
                AudioManager.playSfx('button-click');
                hidePauseScreen();
                if (window.game && window.game.currentLevel) {
                    window.game.loadLevel(window.game.currentLevel.id);
                }
            });
            
            document.getElementById('settings-button').addEventListener('click', () => {
                AudioManager.playSfx('button-click');
                togglePauseSettings();
            });
            
            document.getElementById('quit-button').addEventListener('click', () => {
                AudioManager.playSfx('button-click');
                hidePauseScreen();
                showScreen('main-menu');
            });
        } else {
            // Show settings
            pauseContent.classList.add('show-settings');
            
            // Get current settings
            const settings = SaveManager.getSettings();
            
            pauseContent.innerHTML = `
                <h2>Settings</h2>
                <div class="settings-container">
                    <div class="setting-item">
                        <label for="music-volume">Music Volume</label>
                        <input type="range" id="music-volume" min="0" max="100" value="${settings.musicVolume}">
                    </div>
                    <div class="setting-item">
                        <label for="sfx-volume">Sound Effects</label>
                        <input type="range" id="sfx-volume" min="0" max="100" value="${settings.sfxVolume}">
                    </div>
                    <div class="setting-item">
                        <label for="dialogue-speed">Dialogue Speed</label>
                        <select id="dialogue-speed">
                            <option value="slow" ${settings.dialogueSpeed === 'slow' ? 'selected' : ''}>Slow</option>
                            <option value="normal" ${settings.dialogueSpeed === 'normal' ? 'selected' : ''}>Normal</option>
                            <option value="fast" ${settings.dialogueSpeed === 'fast' ? 'selected' : ''}>Fast</option>
                        </select>
                    </div>
                    <div class="setting-item">
                        <label for="show-hints">Show Hints</label>
                        <input type="checkbox" id="show-hints" ${settings.showHints ? 'checked' : ''}>
                    </div>
                </div>
                <div class="pause-buttons">
                    <button id="settings-back" class="button button--primary">Back</button>
                    <button id="settings-reset" class="button">Reset Progress</button>
                </div>
            `;
            
            // Add event listeners for settings
            document.getElementById('music-volume').addEventListener('input', (e) => {
                AudioManager.setMusicVolume(e.target.value / 100);
            });
            
            document.getElementById('sfx-volume').addEventListener('input', (e) => {
                AudioManager.setSfxVolume(e.target.value / 100);
            });
            
            document.getElementById('dialogue-speed').addEventListener('change', (e) => {
                // Update dialogue speed setting
                SaveManager.updateSettings({ dialogueSpeed: e.target.value });
            });
            
            document.getElementById('show-hints').addEventListener('change', (e) => {
                // Update hints setting
                SaveManager.updateSettings({ showHints: e.target.checked });
            });
            
            document.getElementById('settings-back').addEventListener('click', () => {
                AudioManager.playSfx('button-click');
                
                // Save settings
                SaveManager.updateSettings({
                    musicVolume: document.getElementById('music-volume').value,
                    sfxVolume: document.getElementById('sfx-volume').value,
                    dialogueSpeed: document.getElementById('dialogue-speed').value,
                    showHints: document.getElementById('show-hints').checked
                });
                
                togglePauseSettings();
            });
            
            document.getElementById('settings-reset').addEventListener('click', () => {
                AudioManager.playSfx('button-click');
                
                // Show confirmation dialog
                if (confirm('Are you sure you want to reset all game progress? This cannot be undone.')) {
                    SaveManager.resetProgress();
                    hidePauseScreen();
                    showScreen('main-menu');
                }
            });
        }
    }
    
    // Show a specific screen
    function showScreen(screenId) {
        // Hide current screen
        if (activeScreen) {
            hideScreen(activeScreen);
        }
        
        // Show new screen
        let screenElement;
        
        if (screenId === 'main-menu' || screenId === 'settings-menu') {
            // Menu screens
            elements.menuContainer.classList.add('active');
            screenElement = document.getElementById(screenId);
            
            // Play menu music
            if (window.audioManager && window.audioManager.playMusic) {
                window.audioManager.playMusic('menu-theme');
        } else if (screenId === 'game-board') {
            // Game board screen
            screenElement = document.getElementById('game-board-container');
            
            // Music is handled by the level manager
        } else if (screenId === 'journey-map') {
            // Journey map screen
            screenElement = document.getElementById('journey-map-screen');
            
            // Populate journey map
            populateJourneyMap();
            
            // Play map music
            AudioManager.playMusic('journey-map-theme');
        } else if (screenId === 'level-complete') {
            // Level complete screen
            screenElement = document.getElementById('level-complete');
        } else {
            // Fallback to menu
            elements.menuContainer.classList.add('active');
            screenElement = document.getElementById('main-menu');
            
            Debugging.warning(`Unknown screen ID: ${screenId}, showing main menu`);
        }
        
        if (screenElement) {
            screenElement.classList.add('active');
            activeScreen = screenId;
        }
    }
    
    // Hide a specific screen
    function hideScreen(screenId) {
        let screenElement;
        
        if (screenId === 'main-menu' || screenId === 'settings-menu') {
            elements.menuContainer.classList.remove('active');
            screenElement = document.getElementById(screenId);
        } else if (screenId === 'game-board') {
            screenElement = document.getElementById('game-board-container');
        } else if (screenId === 'journey-map') {
            screenElement = document.getElementById('journey-map-screen');
        } else if (screenId === 'level-complete') {
            screenElement = document.getElementById('level-complete');
        }
        
        if (screenElement) {
            screenElement.classList.remove('active');
        }
    }
    
    // Show pause screen
    function showPauseScreen() {
        pauseOverlay.classList.add('active');
        AudioManager.pauseMusic();
        AudioManager.playSfx('pause');
    }
    
    // Hide pause screen
    function hidePauseScreen() {
        pauseOverlay.classList.remove('active');
        
        // Reset to main pause menu view
        const pauseContent = document.querySelector('#pause-screen .overlay-content');
        if (pauseContent.classList.contains('show-settings')) {
            togglePauseSettings();
        }
        
        AudioManager.resumeMusic();
        AudioManager.playSfx('unpause');
    }
    
    // Show error screen with message
    function showErrorScreen(title, message) {
        const errorTitle = document.querySelector('#error-screen h2');
        const errorMessage = document.getElementById('error-message');
        
        errorTitle.textContent = title || 'Oops! Something Went Wrong';
        errorMessage.textContent = message || 'An unexpected error occurred.';
        
        errorOverlay.classList.add('active');
        AudioManager.pauseMusic();
        AudioManager.playSfx('error');
    }
    
    // Hide error screen
    function hideErrorScreen() {
        errorOverlay.classList.remove('active');
        AudioManager.resumeMusic();
    }
    
    // Show loading screen
    function showLoadingScreen() {
        elements.loadingContainer.classList.add('active');
    }
    
    // Hide loading screen
    function hideLoadingScreen() {
        elements.loadingContainer.classList.remove('active');
    }
    
    // Update loading progress
    function updateLoadingProgress(percent, message) {
        const loadingBar = elements.loadingBar;
        const loadingMessage = document.getElementById('loading-message');
        
        if (loadingBar) {
            loadingBar.style.width = `${percent}%`;
        }
        
        if (loadingMessage && message) {
            loadingMessage.textContent = message;
        }
    }
    
    // Populate the journey map with level data
    function populateJourneyMap() {
        const journeyMap = document.getElementById('journey-map');
        if (!journeyMap) return;
        
        // Get all levels data
        const allLevels = LevelManager.getAllLevels();
        const gameState = SaveManager.getGameState();
        
        // Clear previous content
        journeyMap.innerHTML = '';
        
        // Create path SVG
        const pathSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        pathSvg.classList.add('journey-path');
        pathSvg.setAttribute('width', '100%');
        pathSvg.setAttribute('height', '100%');
        
        const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pathElement.classList.add('journey-path-line');
        pathSvg.appendChild(pathElement);
        
        journeyMap.appendChild(pathSvg);
        
        // Add epoch dividers
        const exodusDivider = document.createElement('div');
        exodusDivider.classList.add('epoch-divider');
        exodusDivider.textContent = 'EXODUS';
        exodusDivider.style.top = '10%';
        journeyMap.appendChild(exodusDivider);
        
        const wildernessDivider = document.createElement('div');
        wildernessDivider.classList.add('epoch-divider');
        wildernessDivider.textContent = 'WILDERNESS';
        wildernessDivider.style.top = '55%';
        journeyMap.appendChild(wildernessDivider);
        
        // Add landmarks
        const landmarks = [
            { id: 'egypt', x: 10, y: 20, className: 'landmark-egypt' },
            { id: 'red-sea', x: 40, y: 30, className: 'landmark-red-sea' },
            { id: 'sinai', x: 70, y: 45, className: 'landmark-sinai' },
            { id: 'wilderness', x: 30, y: 70, className: 'landmark-wilderness' },
            { id: 'promised-land', x: 80, y: 85, className: 'landmark-promised-land' }
        ];
        
        landmarks.forEach(landmark => {
            const landmarkElement = document.createElement('div');
            landmarkElement.classList.add('map-landmark', landmark.className);
            landmarkElement.style.left = `${landmark.x}%`;
            landmarkElement.style.top = `${landmark.y}%`;
            journeyMap.appendChild(landmarkElement);
        });
        
        // Add level nodes for Exodus
        let pathCoordinates = '';
        
        allLevels.exodus.forEach((level, index) => {
            // Calculate position on zigzag path
            const xPercent = 15 + (index % 2 === 0 ? 15 : 55) + (Math.floor(index / 2) * 10);
            const yPercent = 15 + Math.floor(index / 2) * 8;
            
            // Add to path coordinates
            if (index === 0) {
                pathCoordinates = `M ${xPercent} ${yPercent}`;
            } else {
                pathCoordinates += ` L ${xPercent} ${yPercent}`;
            }
            
            createLevelNode(level, xPercent, yPercent, journeyMap, gameState);
        });
        
        // Continue path to Wilderness levels
        allLevels.wilderness.forEach((level, index) => {
            // Calculate position on zigzag path
            const xPercent = 15 + (index % 2 === 0 ? 20 : 60) + (Math.floor(index / 2) * 5);
            const yPercent = 60 + Math.floor(index / 2) * 7;
            
            // Add to path coordinates
            pathCoordinates += ` L ${xPercent} ${yPercent}`;
            
            createLevelNode(level, xPercent, yPercent, journeyMap, gameState);
        });
        
        // Set path coordinates
        pathElement.setAttribute('d', pathCoordinates);
        
        // Update path segments based on completed levels
        updatePathSegments();
        
        // Add scripture collection indicator
        const scriptureCount = document.createElement('div');
        scriptureCount.classList.add('scripture-collection');
        scriptureCount.innerHTML = `
            <span>Scriptures Collected: </span>
            <span class="scripture-count">${gameState.collectedScriptures.length}</span>
        `;
        journeyMap.appendChild(scriptureCount);
    }
    
// Create a level node on the journey map
function createLevelNode(level, xPercent, yPercent, journeyMap, gameState) {
    const levelNode = document.createElement('div');
    levelNode.classList.add('level-node');
    levelNode.dataset.levelId = level.id;
    
    // Check if level is unlocked
    const isUnlocked = SaveManager.isLevelUnlocked(level.id);
    if (!isUnlocked) {
        levelNode.classList.add('locked');
    }
    
    // Check if level is completed
    const completionData = gameState.completedLevels[level.id];
    if (completionData) {
        levelNode.classList.add('completed');
    }
    
    // Check if current level
    if (level.id === gameState.currentLevel) {
        levelNode.classList.add('current');
    }
    
    // Set position
    levelNode.style.left = `${xPercent}%`;
    levelNode.style.top = `${yPercent}%`;
    
    // Add level number
    const levelNumber = document.createElement('div');
    levelNumber.classList.add('level-number');
    levelNumber.textContent = level.id.split('-')[1];
    levelNode.appendChild(levelNumber);
    
    // Add stars if completed
    if (completionData) {
        const starsContainer = document.createElement('div');
        starsContainer.classList.add('level-stars');
        
        for (let i = 1; i <= 3; i++) {
            const star = document.createElement('div');
            star.classList.add('level-star');
            if (i <= completionData.stars) {
                star.classList.add('earned');
            }
            starsContainer.appendChild(star);
        }
        
        levelNode.appendChild(starsContainer);
    }
    
    // Add tooltip with level name
    const tooltip = document.createElement('div');
    tooltip.classList.add('level-tooltip');
    tooltip.textContent = level.name;
    levelNode.appendChild(tooltip);
    
    // Add click handler for unlocked levels
    if (isUnlocked) {
        levelNode.addEventListener('click', () => {
            // Play click sound
            AudioManager.playSfx('button-click');
            
            // Show level detail panel
            showLevelDetailPanel(level.id, journeyMap);
        });
    }
    
    journeyMap.appendChild(levelNode);
}

// Show level detail panel
function showLevelDetailPanel(levelId, journeyMap) {
    // Remove any existing panel
    const existingPanel = document.querySelector('.level-detail-panel');
    if (existingPanel) {
        existingPanel.remove();
    }
    
    // Get level metadata
    const levelMetadata = LevelManager.getLevelMetadata(levelId);
    const gameState = SaveManager.getGameState();
    const completionData = gameState.completedLevels[levelId] || { stars: 0, score: 0 };
    
    // Create detail panel
    const detailPanel = document.createElement('div');
    detailPanel.classList.add('level-detail-panel');
    
    detailPanel.innerHTML = `
        <div class="level-detail-header">
            <div class="level-detail-title">${levelMetadata.name}</div>
            <button class="level-detail-close">&times;</button>
        </div>
        <div class="level-detail-scripture">${levelMetadata.scriptureRef}</div>
        <div class="level-detail-objective">
            ${completionData.stars > 0 
                ? `<p>Completed with ${completionData.stars} stars!</p>
                   <p>High Score: ${completionData.score}</p>`
                : '<p>Level not yet completed</p>'}
        </div>
        <div class="level-detail-buttons">
            <button class="button button--primary" id="play-level-btn">Play Level</button>
            ${completionData.stars > 0 
                ? '<button class="button" id="replay-level-btn">Replay Level</button>'
                : ''}
        </div>
    `;
    
    journeyMap.appendChild(detailPanel);
    detailPanel.classList.add('active');
    
    // Add event listeners
    detailPanel.querySelector('.level-detail-close').addEventListener('click', () => {
        detailPanel.remove();
    });
    
    detailPanel.querySelector('#play-level-btn').addEventListener('click', () => {
        AudioManager.playSfx('button-click');
        hideScreen('journey-map');
        showLoadingScreen();
        
        // Start the level
        if (window.game) {
            window.game.loadLevel(levelId);
        }
    });
    
    const replayBtn = detailPanel.querySelector('#replay-level-btn');
    if (replayBtn) {
        replayBtn.addEventListener('click', () => {
            AudioManager.playSfx('button-click');
            hideScreen('journey-map');
            showLoadingScreen();
            
            // Start the level
            if (window.game) {
                window.game.loadLevel(levelId);
            }
        });
    }
}

// Update path segments based on completed levels
function updatePathSegments() {
    const gameState = SaveManager.getGameState();
    const completedLevels = gameState.completedLevels;
    
    // Get all level nodes
    const levelNodes = document.querySelectorAll('.level-node');
    const pathElement = document.querySelector('.journey-path-line');
    
    // If no path element, exit
    if (!pathElement) return;
    
    // Get the total path length
    const pathLength = pathElement.getTotalLength();
    
    // Calculate how much of the path should be "completed"
    let completedNodeCount = 0;
    
    levelNodes.forEach(node => {
        const levelId = node.dataset.levelId;
        if (completedLevels[levelId]) {
            completedNodeCount++;
        }
    });
    
    // If no levels completed, exit
    if (completedNodeCount === 0) return;
    
    // Calculate percentage of path completed
    const completedPercentage = completedNodeCount / levelNodes.length;
    
    // Create a completed path element
    const completedPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    completedPath.classList.add('journey-path-line', 'completed');
    
    // Get the same path data
    completedPath.setAttribute('d', pathElement.getAttribute('d'));
    
    // Set stroke-dasharray and stroke-dashoffset to show only completed portion
    completedPath.style.strokeDasharray = pathLength;
    completedPath.style.strokeDashoffset = pathLength * (1 - completedPercentage);
    
    // Add completed path before the original path
    pathElement.parentNode.insertBefore(completedPath, pathElement);
}

// Public API
return {
    init
};
})();

export default UIManager;