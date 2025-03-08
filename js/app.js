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

// Safe wrapper for AudioManager calls
function safeAudioCall(methodName, ...args) {
    try {
        if (window.audioManager && typeof window.audioManager[methodName] === 'function') {
            return window.audioManager[methodName](...args);
        }
    } catch (error) {
        Debugging.warning(`AudioManager.${methodName} call failed`, error);
    }
    return null;
}

/**
 * LOADING SCREEN BYPASS
 * 
 * This will bypass most initialization steps and force the game to show the main menu
 * Useful for development and testing specific components
 */
const BYPASS_LOADING = false; // Set to true to enable development mode

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
    let audioManager = null;
    
    // Canvas elements
    let canvasLayers = {};
    
    // Initialize the game
    function init() {
        // BYPASS: Skip all loading and go straight to main menu
        if (BYPASS_LOADING) {
            console.log("⚠️ BYPASSING NORMAL LOADING SEQUENCE - DEVELOPMENT MODE ⚠️");
            
            // Hide loading screen immediately
            const loadingContainer = document.getElementById('loading-container');
            if (loadingContainer) {
                loadingContainer.style.display = 'none';
            }
            
            // Show menu container
            const menuContainer = document.getElementById('menu-container');
            if (menuContainer) {
                menuContainer.classList.add('active');
            }
            
            // Show main menu
            const mainMenu = document.getElementById('main-menu');
            if (mainMenu) {
                mainMenu.classList.add('active');
            }
            
            // Basic module initialization with dummy objects
            window.audioManager = {
                playMusic: () => {},
                stopMusic: () => {},
                pauseMusic: () => {},
                resumeMusic: () => {},
                playSfx: () => {},
                setMusicVolume: () => {},
                setSfxVolume: () => {},
                toggleMusicMute: () => {},
                toggleSfxMute: () => {},
                preloadSounds: () => {}
            };
            
            // Set up minimal event listeners for menu buttons
            setupMinimalEventListeners();
            
            // Mark as initialized and return
            isInitialized = true;
            
            return Promise.resolve();
        }
        
        // Regular initialization
        return new Promise((resolve, reject) => {
            try {
                Debugging.info('Initializing game', { version: gameConfig.version });
                PerformanceProfiler.startMarker('game_initialization');
                
                // Initialize all game subsystems with proper error handling
                initializeSystems()
                    .then(() => {
                        // Mark as initialized
                        isInitialized = true;
                        updateLoadingProgress(100, 'Game ready!');
                        
                        // Log initialization time
                        const initTime = PerformanceProfiler.endMarker('game_initialization');
                        Debugging.info(`Game initialized in ${Math.round(initTime)}ms`);
                        
                        // Start auto-save interval
                        setInterval(() => {
                            try {
                                SaveManager.checkAutoSave();
                            } catch (autoSaveError) {
                                Debugging.warning('Auto-save check failed', autoSaveError);
                            }
                        }, 60000); // Check every minute
                        
                        // Resolve promise
                        resolve();
                    })
                    .catch(initError => {
                        Debugging.error('Game initialization failed in subsystem', initError);
                        // Try to show error screen but still resolve to let the game try to run
                        showErrorScreen('Initialization Error', 'Some game features may not be available.');
                        resolve();
                    });
            } catch (fatalError) {
                Debugging.error('Critical game initialization failed', fatalError);
                
                // Show error screen
                showErrorScreen('Game Initialization Failed', fatalError.message || 'Unknown error');
                reject(fatalError);
            }
        });
    }
    
    // Initialize all game subsystems with error handling for each
    function initializeSystems() {
        return new Promise(async (resolve, reject) => {
            try {
                // Set up error handler for global errors
                window.addEventListener('error', (event) => {
                    try {
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
                    } catch (handlerError) {
                        console.error('Error handler failed:', handlerError);
                        console.error('Original error:', event);
                    }
                });
                
                // Initialize save system first
                updateLoadingProgress(5, 'Initializing save system...');
                try {
                    if (!SaveManager.init()) {
                        Debugging.warning('Save system initialization returned false, using default state');
                    }
                } catch (saveError) {
                    Debugging.error('Save system initialization failed', saveError);
                    // Continue anyway
                }
                
                // Set up canvas layers
                updateLoadingProgress(10, 'Setting up rendering system...');
                try {
                    canvasLayers = {
                        background: document.getElementById('background-canvas'),
                        board: document.getElementById('board-canvas'),
                        ui: document.getElementById('ui-canvas'),
                        effects: document.getElementById('effects-canvas')
                    };
                    
                    // Initialize render manager
                    renderManager = RenderManager.init(canvasLayers);
                } catch (renderError) {
                    Debugging.error('Render system initialization failed', renderError);
                    // Create minimal dummy render manager
                    renderManager = {
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
                
                // Initialize audio system
                updateLoadingProgress(15, 'Initializing audio system...');
                try {
                    // Get default audio settings from SaveManager safely
                    let musicVolume = 0.7; // Default value
                    let sfxVolume = 0.8;   // Default value
                    
                    try {
                        const savedSettings = SaveManager.getSettings();
                        if (savedSettings && typeof savedSettings === 'object') {
                            // Make sure we have valid numbers
                            if (typeof savedSettings.musicVolume === 'number' || 
                                typeof savedSettings.musicVolume === 'string') {
                                musicVolume = Number(savedSettings.musicVolume) / 100;
                            }
                            
                            if (typeof savedSettings.sfxVolume === 'number' || 
                                typeof savedSettings.sfxVolume === 'string') {
                                sfxVolume = Number(savedSettings.sfxVolume) / 100;
                            }
                        }
                    } catch (settingsError) {
                        Debugging.warning('Failed to load audio settings, using defaults', settingsError);
                    }
                    
                    // Create dummy audio manager first for safety
                    const dummyAudioManager = {
                        playMusic: () => {},
                        stopMusic: () => {},
                        pauseMusic: () => {},
                        resumeMusic: () => {},
                        playSfx: () => {},
                        setMusicVolume: () => {},
                        setSfxVolume: () => {},
                        toggleMusicMute: () => {},
                        toggleSfxMute: () => {},
                        preloadSounds: () => {},
                        enableAudio: () => {},
                        isAudioEnabled: () => false
                    };
                    
                    // Assign dummy manager first so it's always available
                    window.audioManager = dummyAudioManager;
                    audioManager = dummyAudioManager;
                    
                    // Then try to initialize the real one
                    try {
                        const realAudioManager = AudioManager.init(musicVolume, sfxVolume);
                        // Only replace if successful
                        if (realAudioManager) {
                            window.audioManager = realAudioManager;
                            audioManager = realAudioManager;
                        }
                    } catch (error) {
                        Debugging.error('Failed to initialize audio system:', error);
                        // Keep using the dummy audio manager we already assigned
                    }
                } catch (audioError) {
                    Debugging.error('Critical audio system failure', audioError);
                    // Continue with dummy audio manager
                }
                
                // Initialize UI manager
                updateLoadingProgress(25, 'Setting up user interface...');
                try {
                    uiManager = UIManager.init({
                        gameContainer: document.getElementById('game-container'),
                        menuContainer: document.getElementById('menu-container'),
                        dialogueContainer: document.getElementById('dialogue-container'),
                        loadingContainer: document.getElementById('loading-container'),
                        loadingBar: document.getElementById('loading-bar')
                    });
                } catch (uiError) {
                    Debugging.error('UI manager initialization failed', uiError);
                    // Create a minimal UI manager interface to prevent crashes
                    uiManager = {
                        showScreen: function(screen) {
                            try {
                                // Minimal implementation that tries to change screens
                                const screenElement = document.getElementById(screen);
                                if (screenElement) {
                                    screenElement.classList.add('active');
                                }
                            } catch (e) { /* ignore */ }
                        },
                        hideScreen: function() {},
                        showLoadingScreen: function() {},
                        hideLoadingScreen: function() {},
                        showErrorScreen: function(title, message) {
                            alert(`Error: ${title}\n${message}`);
                        },
                        showPauseScreen: function() {},
                        hidePauseScreen: function() {},
                        populateJourneyMap: function() {}
                    };
                }
                
                // Setup dialogue manager
                updateLoadingProgress(35, 'Initializing dialogue system...');
                try {
                    dialogueManager = DialogueManager.init(document.getElementById('dialogue-container'));
                } catch (dialogueError) {
                    Debugging.error('Dialogue manager initialization failed', dialogueError);
                    // Create a minimal dialogue manager
                    dialogueManager = {
                        loadLevelDialogue: function() { return Promise.resolve([]); },
                        showDialogue: function() {},
                        triggerDialogue: function() {},
                        advanceDialogue: function() {},
                        setDialogueSpeed: function() {},
                        isActive: function() { return false; }
                    };
                }
                
                // Setup level manager
                updateLoadingProgress(45, 'Preparing level system...');
                try {
                    levelManager = LevelManager.init();
                } catch (levelError) {
                    Debugging.error('Level manager initialization failed', levelError);
                    // Create a minimal level manager
                    levelManager = {
                        getAllLevels: function() { return { exodus: [], wilderness: [] }; },
                        getLevel: function() { return null; },
                        getLevelMetadata: function() { return null; },
                        loadLevel: function() { return Promise.reject(new Error('Level manager not available')); },
                        getNextLevelId: function() { return null; },
                        getLevelEpoch: function() { return 'exodus'; },
                        getLevelNumber: function() { return 1; }
                    };
                }
                
                // Preload shared assets
                updateLoadingProgress(55, 'Loading global assets...');
                try {
                    await preloadGlobalAssets().catch(assetError => {
                        Debugging.warning('Failed to load global assets, continuing with fallbacks', assetError);
                    });
                } catch (assetError) {
                    Debugging.error('Asset preloading error', assetError);
                    // Continue anyway
                }
                
                updateLoadingProgress(85, 'Finalizing setup...');
                
                // Set up game board with error handling
                try {
                    gameBoard = GameBoard.create(canvasLayers.board, {
                        width: 7,
                        height: 7
                    });
                } catch (boardError) {
                    Debugging.error('Game board initialization failed', boardError);
                    // Create minimal game board interface
                    gameBoard = {
                        setupBoard: function() {},
                        handleResize: function() {},
                        pause: function() {},
                        resume: function() {},
                        showHint: function() {},
                        activateFaithPower: function() {},
                        setEventCallback: function() {},
                        getTileStats: function() { return {}; },
                        getTileCount: function() { return 0; },
                        getPossibleMatchCount: function() { return 0; }
                    };
                }
                
                // Add event listeners
                try {
                    window.addEventListener('resize', handleResize);
                    document.addEventListener('visibilitychange', handleVisibilityChange);
                    
                    // Setup event listeners for UI elements
                    setupEventListeners();
                } catch (listenerError) {
                    Debugging.error('Failed to setup event listeners', listenerError);
                    // Continue anyway
                }
                
                // Show appropriate starting screen
                try {
                    uiManager.showScreen('main-menu');
                } catch (screenError) {
                    Debugging.error('Failed to show main menu', screenError);
                    // Try a more direct approach as fallback
                    const mainMenu = document.getElementById('main-menu');
                    if (mainMenu) {
                        mainMenu.classList.add('active');
                    }
                    
                    const menuContainer = document.getElementById('menu-container');
                    if (menuContainer) {
                        menuContainer.classList.add('active');
                    }
                    
                    const loadingContainer = document.getElementById('loading-container');
                    if (loadingContainer) {
                        loadingContainer.classList.remove('active');
                    }
                }
                
                // All systems initialized
                resolve();
            } catch (error) {
                Debugging.error('Critical error in system initialization', error);
                reject(error);
            }
        });
    }
    
    // Minimal event listeners for development mode
    function setupMinimalEventListeners() {
        // Main menu buttons
        document.getElementById('play-button')?.addEventListener('click', () => {
            console.log("Play button clicked - No game implementation in bypass mode");
            alert("Game is in bypass mode. Implement custom handling for gameplay.");
        });
        
        document.getElementById('journey-button')?.addEventListener('click', () => {
            console.log("Journey button clicked - No implementation in bypass mode");
            alert("Journey map not available in bypass mode");
        });
        
        document.getElementById('settings-button')?.addEventListener('click', () => {
            console.log("Settings button clicked");
            const mainMenu = document.getElementById('main-menu');
            const settingsMenu = document.getElementById('settings-menu');
            
            if (mainMenu && settingsMenu) {
                mainMenu.classList.remove('active');
                settingsMenu.classList.add('active');
            }
        });
        
        // Settings back button
        document.getElementById('settings-back')?.addEventListener('click', () => {
            console.log("Settings back button clicked");
            const mainMenu = document.getElementById('main-menu');
            const settingsMenu = document.getElementById('settings-menu');
            
            if (mainMenu && settingsMenu) {
                settingsMenu.classList.remove('active');
                mainMenu.classList.add('active');
            }
        });
    }
    
    // Create a helper function for showing error screens
    function showErrorScreen(title, message) {
        // First try to use UI manager
        if (uiManager && typeof uiManager.showErrorScreen === 'function') {
            try {
                uiManager.showErrorScreen(title, message);
                return;
            } catch (e) {
                // UI manager failed, fall through to alternative
                Debugging.warning('UI manager error screen failed', e);
            }
        }
        
        // Create a fallback error display if UI manager isn't available or fails
        try {
            const errorContainer = document.createElement('div');
            errorContainer.className = 'error-container';
            errorContainer.style.position = 'fixed';
            errorContainer.style.top = '0';
            errorContainer.style.left = '0';
            errorContainer.style.width = '100%';
            errorContainer.style.height = '100%';
            errorContainer.style.backgroundColor = 'rgba(0,0,0,0.8)';
            errorContainer.style.color = 'white';
            errorContainer.style.display = 'flex';
            errorContainer.style.flexDirection = 'column';
            errorContainer.style.justifyContent = 'center';
            errorContainer.style.alignItems = 'center';
            errorContainer.style.zIndex = '9999';
            errorContainer.style.padding = '20px';
            errorContainer.style.textAlign = 'center';
            
            errorContainer.innerHTML = `
                <h2 style="color:white;margin-bottom:20px;">${title || 'Error'}</h2>
                <p style="margin-bottom:20px;">${message || 'An unknown error occurred'}</p>
                <button onclick="window.location.reload()" style="padding:10px 20px;background:#4682B4;color:white;border:none;border-radius:4px;cursor:pointer;">Reload Game</button>
            `;
            
            // Remove any existing error containers
            const existingError = document.querySelector('.error-container');
            if (existingError) {
                existingError.remove();
            }
            
            document.body.appendChild(errorContainer);
        } catch (error) {
            // Last resort - alert
            alert(`Error: ${title}\n${message}`);
        }
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
        
        try {
            const loadingBar = document.getElementById('loading-bar');
            if (loadingBar) {
                loadingBar.style.width = `${percent}%`;
            }
            
            const loadingMessage = document.getElementById('loading-message');
            if (loadingMessage && message) {
                loadingMessage.textContent = message;
            }
        } catch (error) {
            console.warn('Error updating loading progress UI', error);
        }
        
        Debugging.info(`Loading progress: ${percent}%${message ? ' - ' + message : ''}`);
    }
    
    // Handle window resize
    function handleResize() {
        try {
            if (renderManager) {
                renderManager.handleResize();
            }
            
            if (gameBoard) {
                gameBoard.handleResize();
            }
        } catch (error) {
            Debugging.warning('Error handling resize', error);
        }
    }
    
    // Handle visibility change (pause/resume)
    function handleVisibilityChange() {
        try {
            if (document.hidden) {
                if (!isPaused && isInitialized) {
                    pauseGame();
                }
            }
        } catch (error) {
            Debugging.warning('Error handling visibility change', error);
        }
    }
    
    // Setup UI event listeners
    function setupEventListeners() {
        try {
            // Main menu buttons
            document.getElementById('play-button').addEventListener('click', () => {
                safeAudioCall('playSfx', 'button-click');
                startGame();
            });
            
            document.getElementById('journey-button').addEventListener('click', () => {
                safeAudioCall('playSfx', 'button-click');
                uiManager.showScreen('journey-map');
            });
            
            document.getElementById('settings-button').addEventListener('click', () => {
                safeAudioCall('playSfx', 'button-click');
                uiManager.showScreen('settings-menu');
            });
            
            // Settings menu
            document.getElementById('settings-back').addEventListener('click', () => {
                safeAudioCall('playSfx', 'button-click');
                uiManager.showScreen('main-menu');
                
                try {
                    // Save settings
                    SaveManager.updateSettings({
                        musicVolume: document.getElementById('music-volume').value,
                        sfxVolume: document.getElementById('sfx-volume').value,
                        dialogueSpeed: document.getElementById('dialogue-speed').value
                    });
                } catch (error) {
                    Debugging.warning('Failed to save settings', error);
                }
            });
            
            document.getElementById('music-volume').addEventListener('input', (e) => {
                safeAudioCall('setMusicVolume', e.target.value / 100);
            });
            
            document.getElementById('sfx-volume').addEventListener('input', (e) => {
                safeAudioCall('setSfxVolume', e.target.value / 100);
            });
            
            // Game controls
            document.getElementById('pause-button').addEventListener('click', () => {
                safeAudioCall('playSfx', 'button-click');
                pauseGame();
            });
            
            document.getElementById('hint-button').addEventListener('click', () => {
                safeAudioCall('playSfx', 'button-click');
                if (gameBoard) {
                    gameBoard.showHint();
                }
            });
            
            document.getElementById('power-button').addEventListener('click', () => {
                safeAudioCall('playSfx', 'power-activate');
                activateFaithPower();
            });
            
            // Journey map
            document.getElementById('journey-back').addEventListener('click', () => {
                safeAudioCall('playSfx', 'button-click');
                uiManager.showScreen('main-menu');
            });
            
            // Level complete screen
            document.getElementById('next-level').addEventListener('click', () => {
                safeAudioCall('playSfx', 'button-click');
                loadNextLevel();
            });
            
            document.getElementById('replay-level').addEventListener('click', () => {
                safeAudioCall('playSfx', 'button-click');
                replayLevel();
            });
            
            document.getElementById('map-button').addEventListener('click', () => {
                safeAudioCall('playSfx', 'button-click');
                uiManager.showScreen('journey-map');
            });
            
            // Dialogue interaction
            document.getElementById('dialogue-container').addEventListener('click', () => {
                try {
                    dialogueManager.advanceDialogue();
                } catch (error) {
                    Debugging.warning('Error advancing dialogue', error);
                }
            });
        } catch (error) {
            Debugging.error('Error setting up event listeners', error);
        }
    }
    
    // Start a new game
    function startGame() {
        if (!isInitialized) return;
        
        try {
            // Determine which level to start (from save or level 1)
            const savedState = SaveManager.getGameState();
            const levelToLoad = savedState.currentLevel || 'exodus-1';
            
            loadLevel(levelToLoad);
        } catch (error) {
            Debugging.error('Error starting game', error);
            
            // Fallback to first level
            try {
                loadLevel('exodus-1');
            } catch (fallbackError) {
                showErrorScreen('Game Start Failed', 'Unable to start the game. Please try again.');
            }
        }
    }
    
   // Load a specific level
function loadLevel(levelId) {
    if (!isInitialized) return;
    
    // Show loading screen
    try {
        uiManager.showLoadingScreen();
    } catch (e) {
        Debugging.warning('Failed to show loading screen', e);
    }
    
    updateLoadingProgress(0, `Loading level ${levelId}...`);
    
    // Get level data with proper error handling
    levelManager.loadLevel(levelId)
        .then(levelData => {
            try {
                currentLevel = levelData;
                
                // Update UI with level info safely
                const levelTitle = document.getElementById('level-title');
                if (levelTitle) {
                    levelTitle.textContent = levelData.name || `Level ${levelId}`;
                }
                
                const levelObjectives = document.getElementById('level-objectives');
                if (levelObjectives) {
                    levelObjectives.textContent = levelData.objectives[0]?.description || 'Complete the level';
                }
                
                const movesLeftElement = document.getElementById('moves-left');
                if (movesLeftElement) {
                    movesLeftElement.textContent = levelData.moves || '30';
                }
                
                // Create board with level configuration safely
                try {
                    gameBoard.setupBoard(
                        levelData.boardSize?.width || 7, 
                        levelData.boardSize?.height || 7, 
                        levelData.tileDistribution
                    );
                } catch (boardError) {
                    Debugging.error('Failed to setup game board for level', boardError);
                }
                
                // Load level-specific dialogue
                try {
                    dialogueManager.loadLevelDialogue(levelId);
                } catch (dialogueError) {
                    Debugging.error('Failed to load level dialogue', dialogueError);
                }
                
                // Play level music safely
                try {
                    safeAudioCall('playMusic', levelData.audio?.background || 'level-theme');
                } catch (audioError) {
                    Debugging.warning('Failed to play level music', audioError);
                }
                
                // Update save data
                try {
                    SaveManager.setCurrentLevel(levelId);
                } catch (saveError) {
                    Debugging.warning('Failed to save current level', saveError);
                }
                
                // Hide loading screen and show game board
                try {
                    uiManager.showScreen('game-board');
                } catch (screenError) {
                    Debugging.error('Failed to show game board screen', screenError);
                    
                    // Direct approach fallback
                    const loadingContainer = document.getElementById('loading-container');
                    if (loadingContainer) {
                        loadingContainer.classList.remove('active');
                    }
                    
                    const gameBoardContainer = document.getElementById('game-board-container');
                    if (gameBoardContainer) {
                        gameBoardContainer.classList.add('active');
                    }
                }
                
                // Show level start dialogue
                try {
                    dialogueManager.triggerDialogue('levelStart');
                    
                    Debugging.info(`Level loaded: ${levelId}`, levelData);
                } catch (dialogueError) {
                    Debugging.warning('Failed to trigger start dialogue', dialogueError);
                }
                
            } catch (error) {
                Debugging.error(`Error processing loaded level ${levelId}`, error);
                // Try to recover and continue
                showLevelLoadError(levelId);
            }
        })
        .catch(error => {
            Debugging.error(`Failed to load level ${levelId}`, error);
            showLevelLoadError(levelId);
        });
}

/**
 * Helper function for level load errors
 */
function showLevelLoadError(levelId) {
    // Try to load with fallback data
    try {
        const fallbackLevel = FallbackAssets.loadFallbackLevel(levelId);
        currentLevel = fallbackLevel;
        
        // Create board with fallback configuration
        try {
            gameBoard.setupBoard(
                fallbackLevel.levelData.boardSize.width || 7, 
                fallbackLevel.levelData.boardSize.height || 7, 
                fallbackLevel.levelData.tileDistribution
            );
        } catch (boardError) {
            Debugging.error('Failed to setup game board with fallback data', boardError);
        }
        
        // Hide loading screen and show game board
        try {
            uiManager.showScreen('game-board');
        } catch (screenError) {
            // Direct approach fallback
            const loadingContainer = document.getElementById('loading-container');
            if (loadingContainer) {
                loadingContainer.classList.remove('active');
            }
            
            const gameBoardContainer = document.getElementById('game-board-container');
            if (gameBoardContainer) {
                gameBoardContainer.classList.add('active');
            }
        }
        
        // Log the error formally
        try {
            ErrorHandler.logError(
                new ErrorHandler.GameError(
                    `Failed to load level ${levelId}`,
                    'LEVEL_LOAD_ERROR',
                    { levelId }
                ),
                ErrorHandler.SEVERITY.WARNING
            );
        } catch (logError) {
            Debugging.error('Failed to log level load error', logError);
        }
    } catch (fallbackError) {
        Debugging.error('Complete failure to load level', fallbackError);
        
        // Show error message and return to menu
        showErrorScreen('Level Load Failed', 
            `Could not load level ${levelId}. Please try again or select a different level.`);
        
        // Try to return to the main menu
        setTimeout(() => {
            try {
                uiManager.showScreen('main-menu');
            } catch (e) {
                // Direct attempt
                const menuContainer = document.getElementById('menu-container');
                if (menuContainer) {
                    menuContainer.classList.add('active');
                }
                
                const mainMenu = document.getElementById('main-menu');
                if (mainMenu) {
                    mainMenu.classList.add('active');
                }
                
                const gameBoardContainer = document.getElementById('game-board-container');
                if (gameBoardContainer) {
                    gameBoardContainer.classList.remove('active');
                }
            }
        }, 3000);
    }
}

// Load the next level
function loadNextLevel() {
    if (!currentLevel) return;
    
    try {
        // Get next level ID from the level manager
        const nextLevelId = levelManager.getNextLevelId(currentLevel.id);
        
        if (nextLevelId) {
            loadLevel(nextLevelId);
        } else {
            // If there's no next level, go to the journey map
            uiManager.showScreen('journey-map');
        }
    } catch (error) {
        Debugging.error('Error loading next level', error);
        // Try to return to main menu
        uiManager.showScreen('main-menu');
    }
}

// Replay the current level
function replayLevel() {
    if (!currentLevel) return;
    try {
        loadLevel(currentLevel.id);
    } catch (error) {
        Debugging.error('Error replaying level', error);
        // Try to return to main menu
        uiManager.showScreen('main-menu');
    }
}

// Complete the current level
function completeLevel(stars) {
    if (!currentLevel) return;
    
    try {
        // Update progress in save file
        SaveManager.setLevelComplete(currentLevel.id, stars);
        
        // Get score and moves elements
        const scoreElement = document.getElementById('score');
        const movesElement = document.getElementById('moves-left');
        
        // Show level complete screen with scores
        const finalScoreElement = document.getElementById('final-score');
        if (finalScoreElement && scoreElement) {
            finalScoreElement.textContent = scoreElement.textContent || '0';
        }
        
        const finalMovesElement = document.getElementById('final-moves');
        if (finalMovesElement && movesElement) {
            finalMovesElement.textContent = movesElement.textContent || '0';
        }
        
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
        const scriptureElement = document.getElementById('unlocked-scripture');
        if (scriptureElement) {
            scriptureElement.textContent = currentLevel.scripture || '';
        }
        
        // Play completion sound
        safeAudioCall('playSfx', 'level-complete');
        
        // Show the level complete screen
        uiManager.showScreen('level-complete');
    } catch (error) {
        Debugging.error('Error completing level', error);
        
        // Try direct approach as fallback
        try {
            const levelCompleteScreen = document.getElementById('level-complete');
            if (levelCompleteScreen) {
                levelCompleteScreen.classList.add('active');
            }
            
            const gameBoardContainer = document.getElementById('game-board-container');
            if (gameBoardContainer) {
                gameBoardContainer.classList.remove('active');
            }
        } catch (fallbackError) {
            Debugging.error('Failed to show level complete screen', fallbackError);
        }
    }
}

// Pause the game
function pauseGame() {
    if (!isInitialized || !currentLevel) return;
    
    try {
        isPaused = true;
        
        // Pause game systems
        if (gameBoard) {
            try {
                gameBoard.pause();
            } catch (boardError) {
                Debugging.warning('Error pausing game board', boardError);
            }
        }
        
        // Pause audio
        safeAudioCall('pauseMusic');
        
        // Show pause screen
        try {
            uiManager.showPauseScreen();
        } catch (uiError) {
            Debugging.warning('Error showing pause screen', uiError);
            
            // Try direct DOM manipulation
            const pauseScreen = document.getElementById('pause-screen');
            if (pauseScreen) {
                pauseScreen.classList.add('active');
            }
        }
    } catch (error) {
        Debugging.error('Error pausing game', error);
    }
}

// Resume the game
function resumeGame() {
    if (!isInitialized || !currentLevel) return;
    
    try {
        isPaused = false;
        
        // Resume game systems
        if (gameBoard) {
            try {
                gameBoard.resume();
            } catch (boardError) {
                Debugging.warning('Error resuming game board', boardError);
            }
        }
        
        // Resume audio
        safeAudioCall('resumeMusic');
        
        // Hide pause screen
        try {
            uiManager.hidePauseScreen();
        } catch (uiError) {
            Debugging.warning('Error hiding pause screen', uiError);
            
            // Try direct DOM manipulation
            const pauseScreen = document.getElementById('pause-screen');
            if (pauseScreen) {
                pauseScreen.classList.remove('active');
            }
        }
    } catch (error) {
        Debugging.error('Error resuming game', error);
    }
}

// Activate faith power
function activateFaithPower() {
    if (!isInitialized || !currentLevel || !gameBoard) return;
    
    try {
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
        try {
            const powerButton = document.getElementById('power-button');
            if (powerButton) {
                powerButton.disabled = true;
            }
        } catch (buttonError) {
            Debugging.warning('Error disabling power button', buttonError);
        }
    } catch (error) {
        Debugging.error('Error activating faith power', error);
    }
}

// Update faith meter
function updateFaithMeter(value) {
    try {
        const meterFill = document.getElementById('faith-meter-fill');
        const meterValue = document.getElementById('faith-meter-value');
        const powerButton = document.getElementById('power-button');
        
        // Clamp value between 0 and 100
        const clampedValue = Math.max(0, Math.min(100, value));
        
        // Update UI
        if (meterFill) {
            meterFill.style.width = `${clampedValue}%`;
        }
        
        if (meterValue) {
            meterValue.textContent = `${Math.round(clampedValue)}%`;
        }
        
        // Enable power button if meter is full
        if (powerButton) {
            powerButton.disabled = clampedValue < 100;
        }
        
        // Add glow effect when full
        if (meterFill) {
            if (clampedValue >= 100) {
                meterFill.classList.add('full');
            } else {
                meterFill.classList.remove('full');
            }
        }
    } catch (error) {
        Debugging.warning('Error updating faith meter', error);
    }
}

// Reset faith meter
function resetFaithMeter() {
    try {
        updateFaithMeter(0);
    } catch (error) {
        Debugging.warning('Error resetting faith meter', error);
    }
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
})(); // End of game IIFE

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Handle bypass mode
    if (BYPASS_LOADING) {
        // Call our bypass init directly
        game.init().then(() => {
            console.log('Bypass initialization complete');
        });
        return;
    }
    
    // Normal initialization
    try {
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
            
            // Try to show a simplified error screen
            try {
                const errorContainer = document.createElement('div');
                errorContainer.style.position = 'fixed';
                errorContainer.style.top = '0';
                errorContainer.style.left = '0';
                errorContainer.style.width = '100%';
                errorContainer.style.height = '100%';
                errorContainer.style.backgroundColor = 'rgba(0,0,0,0.9)';
                errorContainer.style.color = 'white';
                errorContainer.style.display = 'flex';
                errorContainer.style.alignItems = 'center';
                errorContainer.style.justifyContent = 'center';
                errorContainer.style.flexDirection = 'column';
                errorContainer.style.padding = '20px';
                errorContainer.style.textAlign = 'center';
                errorContainer.style.zIndex = '9999';
                
                errorContainer.innerHTML = `
                    <h2>Game Initialization Failed</h2>
                    <p>${error && error.message ? error.message : 'Unknown error occurred during game startup.'}</p>
                    <button 
                        style="padding:10px 20px;background:#4682B4;color:white;border:none;border-radius:4px;cursor:pointer;margin-top:20px;"
                        onclick="window.location.reload()">
                        Reload Game
                    </button>
                `;
                
                document.body.appendChild(errorContainer);
                
                // Try to hide loading screen
                if (loadingContainer) {
                    loadingContainer.style.display = 'none';
                }
            } catch (displayError) {
                // Last resort - just alert
                alert('Game failed to initialize: ' + (error?.message || 'Unknown error'));
            }
        });
    } catch (error) {
        console.error('Critical error during startup:', error);
        alert('Critical error during startup. Please reload the page.');
    }
});

// Export game instance
export default game;