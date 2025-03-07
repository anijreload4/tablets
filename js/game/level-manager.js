/**
 * Tablets & Trials: The Covenant Quest
 * Level Manager - Handles level loading and progression
 */

import ErrorHandler from '../services/error-handler.js';
import Debugging from '../utils/debugging.js';
import FallbackAssets from '../services/fallback-assets.js';
import SaveManager from '../services/save-manager.js';

// Level Manager Module
const LevelManager = (function() {
    // Private variables
    let levels = {};
    let isInitialized = false;
    
    // Level metadata - quick reference for journey map
    const levelMetadata = {
        "exodus": [
            { id: "exodus-1", name: "Bricks Without Straw", scriptureRef: "Exodus 5:6-7" },
            { id: "exodus-2", name: "The Plagues Begin", scriptureRef: "Exodus 7:17" },
            { id: "exodus-3", name: "Crossing the Red Sea", scriptureRef: "Exodus 14:21" },
            { id: "exodus-4", name: "The Wilderness Path", scriptureRef: "Exodus 15:22" },
            { id: "exodus-5", name: "Bitter Waters Made Sweet", scriptureRef: "Exodus 15:23-25" },
            { id: "exodus-6", name: "Manna from Heaven", scriptureRef: "Exodus 16:14-15" },
            { id: "exodus-7", name: "Complaining in the Desert", scriptureRef: "Exodus 17:6" },
            { id: "exodus-8", name: "Battle with Amalek", scriptureRef: "Exodus 17:11" },
            { id: "exodus-9", name: "Arrival at Sinai", scriptureRef: "Exodus 19:18" },
            { id: "exodus-10", name: "The Golden Calf", scriptureRef: "Exodus 32:4" }
        ],
        "wilderness": [
            { id: "wilderness-1", name: "The Tabernacle", scriptureRef: "Exodus 35:5" },
            { id: "wilderness-2", name: "The Twelve Spies", scriptureRef: "Numbers 13:17-18" },
            { id: "wilderness-3", name: "Grapes of Canaan", scriptureRef: "Numbers 13:23" },
            { id: "wilderness-4", name: "Giants in the Land", scriptureRef: "Numbers 13:33" },
            { id: "wilderness-5", name: "Faith of Joshua and Caleb", scriptureRef: "Numbers 14:6-7" },
            { id: "wilderness-6", name: "The Bronze Serpent", scriptureRef: "Numbers 21:8" },
            { id: "wilderness-7", name: "Water from the Rock at Kadesh", scriptureRef: "Numbers 20:8" },
            { id: "wilderness-8", name: "Balaam's Donkey", scriptureRef: "Numbers 22:23" },
            { id: "wilderness-9", name: "The Plains of Moab", scriptureRef: "Numbers 22:1" },
            { id: "wilderness-10", name: "Moses Views the Promised Land", scriptureRef: "Deuteronomy 34:4" }
        ]
    };
    
    // Initialize the level manager
    function init() {
        try {
            if (isInitialized) {
                return {
                    getAllLevels,
                    getLevel,
                    getLevelMetadata,
                    loadLevel,
                    getNextLevelId,
                    getLevelEpoch,
                    getLevelNumber
                };
            }
            
            Debugging.info('Level manager initialized');
            
            isInitialized = true;
            
            return {
                getAllLevels,
                getLevel,
                getLevelMetadata,
                loadLevel,
                getNextLevelId,
                getLevelEpoch,
                getLevelNumber
            };
        } catch (error) {
            Debugging.error('Failed to initialize level manager', error);
            throw error;
        }
    }
    
    // Get all level metadata for journey map
    function getAllLevels() {
        return {
            exodus: [...levelMetadata.exodus],
            wilderness: [...levelMetadata.wilderness]
        };
    }
    
    // Get metadata for a specific level
    function getLevelMetadata(levelId) {
        // Parse level ID to get epoch and level number
        const [epoch, levelNum] = levelId.split('-');
        const levelIndex = parseInt(levelNum) - 1;
        
        if (levelMetadata[epoch] && levelMetadata[epoch][levelIndex]) {
            return { ...levelMetadata[epoch][levelIndex] };
        }
        
        return null;
    }
    
    // Get a cached level
    function getLevel(levelId) {
        if (levels[levelId]) {
            return { ...levels[levelId] };
        }
        
        return null;
    }
    
    // Load a level by ID
    function loadLevel(levelId) {
        return new Promise((resolve, reject) => {
            try {
                // Check if level is already cached
                if (levels[levelId]) {
                    Debugging.info(`Using cached level data for ${levelId}`);
                    resolve({ ...levels[levelId] });
                    return;
                }
                
                // Fetch level data from server/local storage
                Debugging.info(`Loading level data for ${levelId}`);
                
                fetchLevelData(levelId)
                    .then(levelData => {
                        // Cache the level data
                        levels[levelId] = levelData;
                        resolve({ ...levelData });
                    })
                    .catch(error => {
                        Debugging.error(`Failed to load level ${levelId}`, error);
                        reject(error);
                    });
            } catch (error) {
                Debugging.error(`Error loading level ${levelId}`, error);
                reject(error);
            }
        });
    }
    
    // Fetch level data from server or local storage
    function fetchLevelData(levelId) {
        return new Promise((resolve, reject) => {
            fetch(`assets/data/levels/${levelId}.json`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Failed to load level data for ${levelId}`);
                    }
                    return response.json();
                })
                .then(levelData => {
                    resolveAndProcessLevel(levelData, resolve);
                })
                .catch(error => {
                    Debugging.warning(`Failed to load level data, using fallback for ${levelId}`, error);
                    
                    // Try using a fallback level
                    const fallbackLevel = generateFallbackLevel(levelId);
                    resolveAndProcessLevel(fallbackLevel, resolve);
                });
        });
    }
    
    // Process and resolve level data
    function resolveAndProcessLevel(levelData, resolve) {
        // Add any runtime processing needed
        levelData.isUnlocked = SaveManager.isLevelUnlocked(levelData.id);
        
        // Get completion status from save data
        const gameState = SaveManager.getGameState();
        const completionData = gameState.completedLevels[levelData.id];
        
        levelData.isCompleted = !!completionData;
        levelData.stars = completionData ? completionData.stars : 0;
        levelData.highScore = completionData ? completionData.score : 0;
        
        resolve(levelData);
    }
    
    // Generate a fallback level if the JSON file is not available
    function generateFallbackLevel(levelId) {
        // Parse level ID to get epoch and level number
        const [epoch, levelNum] = levelId.split('-');
        const level = parseInt(levelNum);
        
        // Get metadata if available
        const metadata = getLevelMetadata(levelId) || {
            id: levelId,
            name: `Level ${level}`,
            scriptureRef: ""
        };
        
        // Create a basic fallback level
        return {
            id: levelId,
            name: metadata.name,
            epoch: epoch,
            level: level,
            description: `Level ${level} of the ${epoch} journey.`,
            scripture: "",
            scriptureReference: metadata.scriptureRef,
            objectives: [
                {
                    type: "collect",
                    tileType: "manna",
                    count: 30,
                    description: "Collect 30 manna tiles"
                }
            ],
            moves: 30,
            boardSize: {
                width: 7,
                height: 7
            },
            tileDistribution: {
                manna: 20,
                water: 20,
                fire: 20,
                stone: 20,
                quail: 20
            },
            obstacles: [],
            specialTiles: [],
            starRequirements: {
                1: 5000,
                2: 7500,
                3: 10000
            },
            audio: {
                background: "default-theme",
                effects: {
                    match: "default-match",
                    special: "default-special",
                    complete: "level-complete"
                }
            },
            backgroundImage: `assets/images/backgrounds/${epoch}-default.jpg`
        };
    }
    
    // Get the next level ID in sequence
    function getNextLevelId(currentLevelId) {
        // Parse level ID to get epoch and level number
        const [epoch, levelNum] = currentLevelId.split('-');
        const level = parseInt(levelNum);
        
        // Check if we're at the end of an epoch
        if (epoch === "exodus" && level === 10) {
            return "wilderness-1"; // Move to wilderness epoch
        } else if (epoch === "wilderness" && level === 10) {
            return null; // End of game
        } else {
            // Next level in the same epoch
            return `${epoch}-${level + 1}`;
        }
    }
    
    // Get the epoch (exodus or wilderness) from a level ID
    function getLevelEpoch(levelId) {
        return levelId.split('-')[0];
    }
    
    // Get the level number from a level ID
    function getLevelNumber(levelId) {
        return parseInt(levelId.split('-')[1]);
    }
    
    // Public API
    return {
        init
    };
})();

export default LevelManager;