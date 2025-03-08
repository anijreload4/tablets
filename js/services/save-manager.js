/**
 * Tablets & Trials: The Covenant Quest
 * Save Manager - Handles game state persistence
 */

import ErrorHandler from './error-handler.js';
import Debugging from '../utils/debugging.js';

// Save Manager Module
const SaveManager = (function() {
    // Private variables
    const SAVE_KEY = 'tablets-trials-save';
    const SETTINGS_KEY = 'tablets-trials-settings';
    let gameState = null;
    let settings = null;
    let lastAutoSave = Date.now();
    
    // Default game state
    const DEFAULT_GAME_STATE = {
        playerName: '',
        currentLevel: 'exodus-1', // First level
        completedLevels: {},      // Format: levelId: { stars: 0-3, score: 0 }
        collectedScriptures: [],  // Array of scripture IDs
        faithPoints: 0,          // Total faith points earned
        lastPlayed: Date.now(),
        version: '1.0.0',
        settings: {             // Include settings directly in game state for backward compatibility
            musicVolume: 70,
            sfxVolume: 80,
            dialogueSpeed: 'normal',
            showHints: true
        }
    };
    
    // Default settings
    const DEFAULT_SETTINGS = {
        musicVolume: 70,
        sfxVolume: 80,
        dialogueSpeed: 'normal',
        showHints: true
    };
    
    // Initialize the save manager
    function init() {
        try {
            // Load settings
            loadSettings();
            
            // Load game state
            loadGameState();
            
            Debugging.info('Save manager initialized');
            return true;
        } catch (error) {
            Debugging.error('Failed to initialize save manager', error);
            ErrorHandler.logError(
                new ErrorHandler.GameError(
                    'Failed to initialize save system',
                    'SAVE_INIT_ERROR',
                    { originalError: error }
                ),
                ErrorHandler.SEVERITY.WARNING
            );
            return false;
        }
    }
    
    // Load settings from local storage
    function loadSettings() {
        try {
            const savedSettings = localStorage.getItem(SETTINGS_KEY);
            if (savedSettings) {
                settings = { ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) };
            } else {
                settings = { ...DEFAULT_SETTINGS };
                saveSettings();
            }
        } catch (error) {
            Debugging.error('Failed to load settings', error);
            settings = { ...DEFAULT_SETTINGS };
            saveSettings();
        }
    }
    
    // Save settings to local storage
    function saveSettings() {
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
            return true;
        } catch (error) {
            Debugging.error('Failed to save settings', error);
            return false;
        }
    }
    
    // Load game state from local storage
    function loadGameState() {
        try {
            const savedState = localStorage.getItem(SAVE_KEY);
            if (savedState) {
                // Parse saved state and merge with defaults to ensure all properties exist
                const parsedState = JSON.parse(savedState);
                gameState = { ...DEFAULT_GAME_STATE, ...parsedState };
                
                // Ensure settings exist
                if (!gameState.settings) {
                    gameState.settings = { ...DEFAULT_SETTINGS };
                } else {
                    // Make sure all setting properties exist
                    gameState.settings = { ...DEFAULT_SETTINGS, ...gameState.settings };
                }
                
                // Save merged state back to storage
                saveGameState();
            } else {
                gameState = { ...DEFAULT_GAME_STATE };
                saveGameState();
            }
        } catch (error) {
            Debugging.error('Failed to load game state', error);
            gameState = { ...DEFAULT_GAME_STATE };
            saveGameState();
        }
    }
    
    // Save game state to local storage
    function saveGameState() {
        try {
            // Update last played timestamp
            gameState.lastPlayed = Date.now();
            
            // Ensure settings are included
            if (!gameState.settings) {
                gameState.settings = { ...DEFAULT_SETTINGS };
            }
            
            localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
            return true;
        } catch (error) {
            Debugging.error('Failed to save game state', error);
            return false;
        }
    }
    
    // Check if auto-save is needed and perform if necessary
    function checkAutoSave() {
        const now = Date.now();
        const autoSaveInterval = 5 * 60 * 1000; // 5 minutes
        
        if (now - lastAutoSave > autoSaveInterval) {
            lastAutoSave = now;
            saveGameState();
        }
    }
    
    // Get the full game state
    function getGameState() {
        if (!gameState) {
            loadGameState();
        }
        
        // Double-check that settings exist
        if (!gameState.settings) {
            gameState.settings = { ...DEFAULT_SETTINGS };
            saveGameState();
        }
        
        return { ...gameState };
    }
    
    // Get settings
    function getSettings() {
        if (!settings) {
            loadSettings();
        }
        
        return { ...settings };
    }
    
    // Update settings
    function updateSettings(newSettings) {
        settings = { ...settings, ...newSettings };
        saveSettings();
        
        // Also update settings in the game state for backward compatibility
        if (gameState) {
            gameState.settings = { ...settings };
            saveGameState();
        }
        
        return settings;
    }
    
    // Set current level
    function setCurrentLevel(levelId) {
        if (!gameState) {
            loadGameState();
        }
        
        gameState.currentLevel = levelId;
        saveGameState();
        
        return gameState;
    }
    
    // Mark a level as complete
    function setLevelComplete(levelId, stars, score = 0) {
        if (!gameState) {
            loadGameState();
        }
        
        // Get existing level data or create new entry
        const levelData = gameState.completedLevels[levelId] || { stars: 0, score: 0 };
        
        // Only update if new score is better
        if (stars > levelData.stars || (stars === levelData.stars && score > levelData.score)) {
            gameState.completedLevels[levelId] = { 
                stars: stars, 
                score: score, 
                completedAt: Date.now() 
            };
            
            saveGameState();
        }
        
        return gameState;
    }
    
    // Add a collected scripture
    function addScripture(scriptureId) {
        if (!gameState) {
            loadGameState();
        }
        
        if (!gameState.collectedScriptures.includes(scriptureId)) {
            gameState.collectedScriptures.push(scriptureId);
            saveGameState();
        }
        
        return gameState;
    }
    
    // Add faith points
    function addFaithPoints(points) {
        if (!gameState) {
            loadGameState();
        }
        
        gameState.faithPoints += points;
        saveGameState();
        
        return gameState;
    }
    
    // Reset game progress
    function resetProgress() {
        // Keep settings but reset game state
        const currentSettings = gameState?.settings || settings || DEFAULT_SETTINGS;
        gameState = { ...DEFAULT_GAME_STATE, settings: { ...currentSettings } };
        saveGameState();
        
        Debugging.info('Game progress reset');
        
        return gameState;
    }
    
    // Export save data as JSON
    function exportSave() {
        if (!gameState) {
            loadGameState();
        }
        
        return {
            gameState: { ...gameState },
            settings: { ...settings },
            exportedAt: Date.now()
        };
    }
    
    // Import save data from JSON
    function importSave(saveData) {
        try {
            if (!saveData || !saveData.gameState) {
                throw new Error('Invalid save data format');
            }
            
            // Validate version compatibility
            const importedVersion = saveData.gameState.version || '1.0.0';
            const currentVersion = DEFAULT_GAME_STATE.version;
            
            // Simple version check (for future use)
            if (importedVersion > currentVersion) {
                Debugging.warning(`Imported save from newer version (${importedVersion}) than current (${currentVersion})`);
            }
            
            // Update game state and settings
            gameState = { ...DEFAULT_GAME_STATE, ...saveData.gameState };
            settings = { ...DEFAULT_SETTINGS, ...saveData.settings };
            
            // Ensure settings exist in gameState
            if (!gameState.settings) {
                gameState.settings = { ...settings };
            }
            
            // Save to storage
            saveGameState();
            saveSettings();
            
            Debugging.info('Save data imported successfully');
            return true;
        } catch (error) {
            Debugging.error('Failed to import save data', error);
            ErrorHandler.logError(
                new ErrorHandler.GameError(
                    'Failed to import save data',
                    'SAVE_IMPORT_ERROR',
                    { originalError: error }
                ),
                ErrorHandler.SEVERITY.WARNING
            );
            return false;
        }
    }
    
    // Check if a level is unlocked
    function isLevelUnlocked(levelId) {
        if (!gameState) {
            loadGameState();
        }
        
        // Parse level ID to get epoch and number
        const [epoch, levelNum] = levelId.split('-');
        const level = parseInt(levelNum);
        
        // First level is always unlocked
        if (epoch === 'exodus' && level === 1) {
            return true;
        }
        
        // Determine the previous level
        let prevLevelId;
        if (level > 1) {
            // Previous level in same epoch
            prevLevelId = `${epoch}-${level - 1}`;
        } else if (epoch === 'wilderness') {
            // Last level of previous epoch
            prevLevelId = 'exodus-10';
        } else {
            // No previous level
            return false;
        }
        
        // Check if previous level was completed
        return !!gameState.completedLevels[prevLevelId];
    }
    
    // Unlock all levels (debug/cheat function)
    function unlockAllLevels() {
        if (!gameState) {
            loadGameState();
        }
        
        // Create dummy completion data for all levels
        for (let i = 1; i <= 10; i++) {
            gameState.completedLevels[`exodus-${i}`] = { 
                stars: 1, 
                score: 1000, 
                completedAt: Date.now() 
            };
        }
        
        for (let i = 1; i <= 10; i++) {
            gameState.completedLevels[`wilderness-${i}`] = { 
                stars: 1, 
                score: 1000, 
                completedAt: Date.now() 
            };
        }
        
        saveGameState();
        
        Debugging.info('All levels unlocked');
        
        return gameState;
    }
    
    // Check if save data exists
    function hasSaveData() {
        return !!localStorage.getItem(SAVE_KEY);
    }
    
    // Public API
    return {
        init,
        getGameState,
        getSettings,
        updateSettings,
        setCurrentLevel,
        setLevelComplete,
        addScripture,
        addFaithPoints,
        resetProgress,
        exportSave,
        importSave,
        isLevelUnlocked,
        unlockAllLevels,
        hasSaveData,
        checkAutoSave
    };
})();

export default SaveManager;