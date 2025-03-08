/**
 * Tablets & Trials: The Covenant Quest
 * Main Application Entry Point
 */

import RenderManager from './utils/render-manager.js';
import AssetCache from './services/asset-cache.js';
import SaveManager from './services/save-manager.js';
import AudioManager from './audio/audio-manager.js';
import GameBoard from './game/board.js';
import LevelManager from './game/level-manager.js';
import DialogueManager from './dialogue/dialogue-manager.js';
import UIManager from './ui/ui-manager.js';
import FallbackAssets from './services/fallback-assets.js';
import ErrorHandler from './services/error-handler.js';
import Debugging from './utils/debugging.js';
import PerformanceProfiler from './utils/performance-profiler.js';
import NetworkManager from './services/network-manager.js';

// Game configuration
const gameConfig = {
    version: '1.0.0',
    buildNumber: '20230501',
    debug: false,
    apiEndpoint: 'https://api.tablets-trials.com/v1/',
    cdnEndpoint: 'https://cdn.tablets-trials.com/'
};

// Make game config globally available
window.gameConfig = gameConfig;

// Game instance
const game = (function() {
    // Game state
    let currentLevel = null;
    let isInitialized = false;
    let isPaused = false;
    let loadingProgress = 0;
    
    // Game systems
    let renderManager = null;
    let gameBoard = null;
    let levelManager = null;
    let dialogueManager = null;
    let uiManager = null;
    
    // Canvas elements
    let canvasLayers = {};
    
    // Initialize the game
    function init() {
        return new Promise((resolve, reject) => {
            try {
                Debugging.info('Initializing game', { version: gameConfig.version });
                PerformanceProfiler.startMarker('game_initialization');
                
                // Set up error handler for global errors
                window.addEventListener('error', (event) => {
                    ErrorHandler.logError(
                        new ErrorHandler.GameError(
                            event.message || 'Unknown error',
                            'UNCAUGHT_ERROR',
                            {
                                filename: event.filename,
                                lineno: event.lineno,
                                colno: event.colno
                            }
                        ),
                        ErrorHandler.SEVERITY.ERROR
                    );
                });
                
                // Initialize save system first
                updateLoadingProgress(5, 'Initializing save system...');
                
                // Initialize the save manager
                if (!SaveManager.init()) {
                    Debugging.warning('Failed to initialize save system, using default state');
                }
                
                // Set up canvas layers
                updateLoadingProgress(10, 'Setting up rendering system...');
                canvasLayers = {
                    background: document.getElementById('background-canvas'),
                    board: document.getElementById('board-canvas'),
                    ui: document.getElementById('ui-canvas'),
                    effects: document.getElementById('effects-canvas')
                };
                
                // Initialize render manager
                renderManager = RenderManager.init(canvasLayers);
                
                // Initialize audio system
updateLoadingProgress(15, 'Initializing audio system...');

// Create default audio manager with fallback methods
const defaultAudioManager = {
    playMusic: function(track) { console.log('Mock playing music:', track); },
    stopMusic: function() { console.log('Mock stopping music'); },
    pauseMusic: function() { console.log('Mock pausing music'); },
    resumeMusic: function() { console.log('Mock resuming music'); },
    playSfx: function(sfx) { console.log('Mock playing sound effect:', sfx); },
    setMusicVolume: function(vol) { console.log('Mock setting music volume:', vol); },
    setSfxVolume: function(vol) { console.log('Mock setting sfx volume:', vol); }
};

try {
    // Safe way to get settings
    let musicVolume = 0.7; // Default value
    let sfxVolume = 0.8;   // Default value
    
    try {
        const savedSettings = localStorage.getItem('tablets-trials-settings');
        if (savedSettings) {
            const parsedSettings = JSON.parse(savedSettings);
            if (parsedSettings) {
                musicVolume = (parsedSettings.musicVolume !== undefined) ? 
                    parsedSettings.musicVolume / 100 : 0.7;
                sfxVolume = (parsedSettings.sfxVolume !== undefined) ? 
                    parsedSettings.sfxVolume / 100 : 0.8;
            }
        }
    } catch (e) {
        console.warn('Failed to load audio settings, using defaults');
    }
    
    // Initialize AudioManager safely
    const audioManager = AudioManager.init ?
        AudioManager.init(musicVolume, sfxVolume) : defaultAudioManager;
    
    // Make audio manager available globally and on the game object
    window.audioManager = audioManager;
    
} catch (error) {
    console.error('Failed to initialize audio system:', error);
    // Use fallback audio manager
    window.audioManager = defaultAudioManager;
}


// Capture the returned object
const audioManager = AudioManager.init(musicVolume, sfxVolume);
window.audioManager = audioManager; // Make it globally available
                
                // Initialize UI manager
                updateLoadingProgress(25, 'Setting up user interface...');
                uiManager = UIManager.init({
                    gameContainer: document.getElementById('game-container'),
                    menuContainer: document.getElementById('menu-container'),
                    dialogueContainer: document.getElementById('dialogue-container'),
                    loadingContainer: document.getElementById('loading-container'),
                    loadingBar: document.getElementById('loading-bar')
                });
                
                // Setup dialogue manager
                updateLoadingProgress(35, 'Initializing dialogue system...');
                dialogueManager = DialogueManager.init(document.getElementById('dialogue-container'));
                
                // Setup level manager
                updateLoadingProgress(45, 'Preparing level system...');
                levelManager = LevelManager.init();
                
                // Preload shared assets
                updateLoadingProgress(55, 'Loading global assets...');
                preloadGlobalAssets().then(() => {
                    updateLoadingProgress(85, 'Finalizing setup...');
                    
                    // Add event listeners
                    window.addEventListener('resize', handleResize);
                    document.addEventListener('visibilitychange', handleVisibilityChange);
                    
                    // Set up game board
                    gameBoard = GameBoard.create(canvasLayers.board, {
                        width: 7,
                        height: 7
                    });
                    
                    // Load save data
                    const savedState = SaveManager.getGameState();
                    
                    // Setup event listeners for UI elements
                    setupEventListeners();
                    
                    // Show appropriate starting screen
                    uiManager.showScreen('main-menu');
                    
                    // Mark as initialized
                    isInitialized = true;
                    updateLoadingProgress(100, 'Game ready!');
                    
                    // Log initialization time
                    const initTime = PerformanceProfiler.endMarker('game_initialization');
                    Debugging.info(`Game initialized in ${Math.round(initTime)}ms`);
                    
                    // Start auto-save interval
                    setInterval(() => {
                        SaveManager.checkAutoSave();
                    }, 60000); // Check every minute
                    
                    // Resolve promise
                    resolve();
                }).catch(error => {
                    Debugging.error('Failed to load global assets', error);
                    
                    // Try to initialize with fallbacks
                    Debugging.warning('Initializing with fallback assets');
                    isInitialized = true;
                    uiManager.showScreen('main-menu');
                    
                    // Resolve anyway to allow game to start
                    resolve();
                });
            } catch (error) {
                Debugging.error('Game initialization failed', error);
                
                // Show error screen
                if (uiManager) {
                    uiManager.showErrorScreen('Failed to initialize game', error.message);
                } else {
                    // Fallback error display if UI manager isn't initialized
                    const errorContainer = document.createElement('div');
                    errorContainer.className = 'error-container';
                    errorContainer.innerHTML = `
                        <h2>Game Initialization Failed</h2>
                        <p>${error.message || 'Unknown error'}</p>
                        <button onclick="window.location.reload()">Reload Game</button>
                    `;
                    document.body.innerHTML = '';
                    document.body.appendChild(errorContainer);
                }
                
                reject(error);
            }
        });
    }
    
    // Preload global assets
    function preloadGlobalAssets() {
        // Define essential assets that should be preloaded
        const globalAssets = [
            // UI Assets
            { id: 'logo', type: 'image', src: 'assets/images/ui/logo.png' },
            { id: 'button-bg', type: 'image', src: 'assets/images/ui/button-bg.png' },
            { id: 'dialogue-bg', type: 'image', src: 'assets/images/ui/dialogue-bg.png' },
            
            // Audio Assets
            { id: 'menu-music', type: 'audio', src: 'assets/audio/music/menu-theme.mp3' },
            { id: 'button-click', type: 'audio', src: 'assets/audio/sfx/button-click.mp3' },
            
            // Tile Assets (base set)
            { id: 'tile-manna', type: 'image', src: 'assets/images/tiles/manna.svg' },
            { id: 'tile-water', type: 'image', src: 'assets/images/tiles/water.svg' },
            { id: 'tile-fire', type: 'image', src: 'assets/images/tiles/fire.svg' },
            { id: 'tile-stone', type: 'image', src: 'assets/images/tiles/stone.svg' },
            { id: 'tile-quail', type: 'image', src: 'assets/images/tiles/quail.svg' },
            
            // Character Portraits (core characters)
            { id: 'moses-normal', type: 'image', src: 'assets/images/characters/moses-normal.png' },
            { id: 'moses-concerned', type: 'image', src: 'assets/images/characters/moses-concerned.png' },
            { id: 'moses-commanding', type: 'image', src: 'assets/images/characters/moses-commanding.png' },
            { id: 'aaron-normal', type: 'image', src: 'assets/images/characters/aaron-normal.png' }
        ];
        
        return AssetCache.preloadAssets(globalAssets, (progress) => {
            updateLoadingProgress(55 + Math.round(progress * 30), 'Loading assets...');
        });
    }
    
    // Update loading progress
    function updateLoadingProgress(percent, message) {
        loadingProgress = percent;
        
        const loadingBar = document.getElementById('loading-bar');
        if (loadingBar) {
            loadingBar.style.width = `${percent}%`;
        }
        
        const loadingMessage = document.getElementById('loading-message');
        if (loadingMessage && message) {
            loadingMessage.textContent = message;
        }
        
        Debugging.info(`Loading progress: ${percent}%${message ? ' - ' + message : ''}`);
    }
    
    // Handle window resize
    function handleResize() {
        if (renderManager) {
            renderManager.handleResize();
        }
        
        if (gameBoard) {
            gameBoard.handleResize();
        }
    }
    
    // Handle visibility change (pause/resume)
    function handleVisibilityChange() {
        if (document.hidden) {
            if (!isPaused && isInitialized) {
                pauseGame();
            }
        }
    }
    
    // Setup UI event listeners
    function setupEventListeners() {
        // Main menu buttons
        document.getElementById('play-button').addEventListener('click', () => {
            AudioManager.playSfx('button-click');
            startGame();
        });
        
        document.getElementById('journey-button').addEventListener('click', () => {
            AudioManager.playSfx('button-click');
            uiManager.showScreen('journey-map');
        });
        
        document.getElementById('settings-button').addEventListener('click', () => {
            AudioManager.playSfx('button-click');
            uiManager.showScreen('settings-menu');
        });
        
        // Settings menu
        document.getElementById('settings-back').addEventListener('click', () => {
            AudioManager.playSfx('button-click');
            uiManager.showScreen('main-menu');
            
            // Save settings
            SaveManager.updateSettings({
                musicVolume: document.getElementById('music-volume').value,
                sfxVolume: document.getElementById('sfx-volume').value,
                dialogueSpeed: document.getElementById('dialogue-speed').value
            });
        });
        
        document.getElementById('music-volume').addEventListener('input', (e) => {
            AudioManager.setMusicVolume(e.target.value / 100);
        });
        
        document.getElementById('sfx-volume').addEventListener('input', (e) => {
            AudioManager.setSfxVolume(e.target.value / 100);
        });
        
        // Game controls
        document.getElementById('pause-button').addEventListener('click', () => {
            AudioManager.playSfx('button-click');
            pauseGame();
        });
        
        document.getElementById('hint-button').addEventListener('click', () => {
            AudioManager.playSfx('button-click');
            if (gameBoard) {
                gameBoard.showHint();
            }
        });
        
        document.getElementById('power-button').addEventListener('click', () => {
            AudioManager.playSfx('power-activate');
            activateFaithPower();
        });
        
        // Journey map
        document.getElementById('journey-back').addEventListener('click', () => {
            AudioManager.playSfx('button-click');
            uiManager.showScreen('main-menu');
        });
        
        // Level complete screen
        document.getElementById('next-level').addEventListener('click', () => {
            AudioManager.playSfx('button-click');
            loadNextLevel();
        });
        
        document.getElementById('replay-level').addEventListener('click', () => {
            AudioManager.playSfx('button-click');
            replayLevel();
        });
        
        document.getElementById('map-button').addEventListener('click', () => {
            AudioManager.playSfx('button-click');
            uiManager.showScreen('journey-map');
        });
        
        // Dialogue interaction
        document.getElementById('dialogue-container').addEventListener('click', () => {
            dialogueManager.advanceDialogue();
        });
    }
    
    // Start a new game
    function startGame() {
        if (!isInitialized) return;
        
        // Determine which level to start (from save or level 1)
        const savedState = SaveManager.getGameState();
        const levelToLoad = savedState.currentLevel || 'exodus-1';
        
        loadLevel(levelToLoad);
    }
    
    // Load a specific level
    function loadLevel(levelId) {
        if (!isInitialized) return;
        
        // Show loading screen
        uiManager.showLoadingScreen();
        updateLoadingProgress(0, `Loading level ${levelId}...`);
        
        // Get level data
        levelManager.loadLevel(levelId)
            .then(levelData => {
                currentLevel = levelData;
                
                // Update UI with level info
                document.getElementById('level-title').textContent = levelData.name;
                document.getElementById('level-objectives').textContent = levelData.objectives[0].description;
                document.getElementById('moves-left').textContent = levelData.moves;
                
                // Create board with level configuration
                gameBoard.setupBoard(levelData.boardSize.width, levelData.boardSize.height, levelData.tileDistribution);
                
                // Load level-specific dialogue
                dialogueManager.loadLevelDialogue(levelId);
                
                // Play level music
                AudioManager.playMusic(levelData.audio?.background || 'level-theme');
                
                // Update save data
                SaveManager.setCurrentLevel(levelId);
                
                // Hide loading screen and show game board
                uiManager.showScreen('game-board');
                
                // Show level start dialogue
                dialogueManager.triggerDialogue('levelStart');
                
                Debugging.info(`Level loaded: ${levelId}`, levelData);
            })
            .catch(error => {
                Debugging.error(`Failed to load level ${levelId}`, error);
                
                // Try to load with fallback data
                const fallbackLevel = FallbackAssets.loadFallbackLevel(levelId);
                currentLevel = fallbackLevel;
                
                // Create board with fallback configuration
                gameBoard.setupBoard(fallbackLevel.levelData.boardSize.width, 
                                   fallbackLevel.levelData.boardSize.height, 
                                   fallbackLevel.levelData.tileDistribution);
                
                // Hide loading screen and show game board
                uiManager.showScreen('game-board');
                
                ErrorHandler.logError(
                    new ErrorHandler.GameError(
                        `Failed to load level ${levelId}`,
                        'LEVEL_LOAD_ERROR',
                        { originalError: error }
                    ),
                    ErrorHandler.SEVERITY.WARNING
                );
            });
    }
    
    // Load the next level
    function loadNextLevel() {
        if (!currentLevel) return;
        
        // Get next level ID from the level manager
        const nextLevelId = levelManager.getNextLevelId(currentLevel.id);
        
        if (nextLevelId) {
            loadLevel(nextLevelId);
        } else {
            // If there's no next level, go to the journey map
            uiManager.showScreen('journey-map');
        }
    }
    
    // Replay the current level
    function replayLevel() {
        if (!currentLevel) return;
        loadLevel(currentLevel.id);
    }
    
    // Complete the current level
    function completeLevel(stars) {
        if (!currentLevel) return;
        
        // Update progress in save file
        SaveManager.setLevelComplete(currentLevel.id, stars);
        
        // Show level complete screen
        document.getElementById('final-score').textContent = document.getElementById('score').textContent;
        document.getElementById('final-moves').textContent = document.getElementById('moves-left').textContent;
        
        // Set stars
        const starElements = document.querySelectorAll('.star');
        starElements.forEach((star, index) => {
            if (index < stars) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
        
        // Show the unlocked scripture
        document.getElementById('unlocked-scripture').textContent = currentLevel.scripture || '';
        
        // Play completion sound
        AudioManager.playSfx('level-complete');
        
        // Show the level complete screen
        uiManager.showScreen('level-complete');
    }
    
    // Pause the game
    function pauseGame() {
        if (!isInitialized || !currentLevel) return;
        
        isPaused = true;
        
        // Pause game systems
        if (gameBoard) {
            gameBoard.pause();
        }
        
        // Show pause screen
        uiManager.showPauseScreen();
    }
    
    // Resume the game
    function resumeGame() {
        if (!isInitialized || !currentLevel) return;
        
        isPaused = false;
        
        // Resume game systems
        if (gameBoard) {
            gameBoard.resume();
        }
        
        // Hide pause screen
        uiManager.hidePauseScreen();
    }
    
    // Activate faith power
    function activateFaithPower() {
        if (!isInitialized || !currentLevel || !gameBoard) return;
        
        // Get the appropriate power based on current epoch
        const epoch = currentLevel.id.split('-')[0];
        let power;
        
        if (epoch === 'exodus') {
            power = 'redSeaParting';
        } else if (epoch === 'wilderness') {
            power = 'mannaShower';
        } else {
            power = 'tabletsOfStone'; // Default power
        }
        
        // Activate the power
        gameBoard.activateFaithPower(power);
        
        // Reset faith meter
        resetFaithMeter();
        
        // Disable power button
        document.getElementById('power-button').disabled = true;
    }
    
    // Update faith meter
    function updateFaithMeter(value) {
        const meterFill = document.getElementById('faith-meter-fill');
        const meterValue = document.getElementById('faith-meter-value');
        
        // Clamp value between 0 and 100
        const clampedValue = Math.max(0, Math.min(100, value));
        
        // Update UI
        meterFill.style.width = `${clampedValue}%`;
        meterValue.textContent = `${Math.round(clampedValue)}%`;
        
        // Enable power button if meter is full
        document.getElementById('power-button').disabled = clampedValue < 100;
        
        // Add glow effect when full
        if (clampedValue >= 100) {
            meterFill.classList.add('full');
        } else {
            meterFill.classList.remove('full');
        }
    }
    
    // Reset faith meter
    function resetFaithMeter() {
        updateFaithMeter(0);
    }
    
    // Public API
    return {
        init,
        startGame,
        loadLevel,
        completeLevel,
        pauseGame,
        resumeGame,
        updateFaithMeter,
        resetFaithMeter,
        get isInitialized() { return isInitialized; },
        get isPaused() { return isPaused; },
        get currentLevel() { return currentLevel; }
    };
})();

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Show loading screen
    const loadingContainer = document.getElementById('loading-container');
    if (loadingContainer) {
        loadingContainer.classList.add('active');
    }
    
    // Initialize game
    game.init().then(() => {
        console.log('Game initialized successfully!');
    }).catch(error => {
        console.error('Game initialization failed:', error);
    });
});

// Export game instance
export default game;