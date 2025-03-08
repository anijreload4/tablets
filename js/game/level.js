/**
 * Tablets & Trials: The Covenant Quest
 * Level Module - Represents a single playable level
 */

import ErrorHandler from '../services/error-handler.js';
import Debugging from '../utils/debugging.js';
import AssetCache from '../services/asset-cache.js';
import FallbackAssets from '../services/fallback-assets.js';

// Level Module
const LevelModule = (function() {
    // Create a new level object
    function createLevel(levelData) {
        try {
            if (!levelData || !levelData.id) {
                throw new ErrorHandler.GameError(
                    'Cannot create level with invalid data',
                    'LEVEL_CREATE_ERROR'
                );
            }
            
            // Extract basic properties
            const level = {
                id: levelData.id,
                name: levelData.name || `Level ${levelData.id}`,
                epoch: levelData.epoch || 'exodus',
                description: levelData.description || '',
                
                // Board configuration
                boardSize: levelData.boardSize || { width: 7, height: 7 },
                tileDistribution: levelData.tileDistribution || {
                    manna: 20,
                    water: 20,
                    fire: 20,
                    stone: 20,
                    quail: 20
                },
                
                // Level objectives
                objectives: levelData.objectives || [{
                    type: 'score',
                    target: 1000,
                    description: 'Score 1000 points'
                }],
                
                // Level constraints
                moves: levelData.moves || 30,
                timeLimit: levelData.timeLimit || 0, // 0 means no time limit
                
                // Level rewards
                scripture: levelData.scripture || '',
                scriptureReference: levelData.scriptureReference || '',
                starRequirements: levelData.starRequirements || {
                    1: 1000,  // Points needed for 1 star
                    2: 3000,  // Points needed for 2 stars
                    3: 5000   // Points needed for 3 stars
                },
                
                // Level assets
                backgroundImage: levelData.backgroundImage || `assets/images/backgrounds/${levelData.epoch || 'exodus'}-default.jpg`,
                audio: levelData.audio || {
                    background: `${levelData.epoch || 'exodus'}-theme`,
                    effects: {
                        match: 'default-match',
                        special: 'default-special',
                        complete: 'level-complete'
                    }
                },
                
                // Level special mechanics
                obstacles: levelData.obstacles || [],
                specialTiles: levelData.specialTiles || [],
                specialMechanics: levelData.specialMechanics || [],
                
                // Level state
                isCompleted: false,
                stars: 0,
                highScore: 0,
                
                // Methods
                load: function() {
                    return loadLevelAssets(this);
                },
                
                checkObjectives: function(gameState) {
                    return checkObjectivesCompletion(this, gameState);
                },
                
                getStarRating: function(score) {
                    return calculateStarRating(this, score);
                }
            };
            
            return level;
        } catch (error) {
            Debugging.error('Failed to create level', error);
            throw error;
        }
    }
    
    // Load level assets
    function loadLevelAssets(level) {
        return new Promise((resolve, reject) => {
            // Define assets to preload
            const levelAssets = [
                // Background image
                { 
                    id: `background_${level.id}`, 
                    type: 'image', 
                    src: level.backgroundImage 
                }
            ];
            
            // Add obstacle and special tile assets if any
            level.obstacles.forEach(obstacle => {
                if (obstacle.image) {
                    levelAssets.push({
                        id: `obstacle_${obstacle.type}_${level.id}`,
                        type: 'image',
                        src: obstacle.image
                    });
                }
            });
            
            level.specialTiles.forEach(specialTile => {
                if (specialTile.image) {
                    levelAssets.push({
                        id: `special_tile_${specialTile.type}_${level.id}`,
                        type: 'image',
                        src: specialTile.image
                    });
                }
            });
            
            // Load audio assets
            if (level.audio && level.audio.background) {
                levelAssets.push({
                    id: `music_${level.audio.background}`,
                    type: 'audio',
                    src: `assets/audio/music/${level.audio.background}.mp3`
                });
            }
            
            // Load assets using AssetCache
            AssetCache.preloadAssets(levelAssets)
                .then(result => {
                    Debugging.info(`Level ${level.id} assets loaded`, {
                        loaded: result.loaded.length,
                        failed: result.failed.length
                    });
                    
                    // Return level object with loaded asset references
                    resolve(level);
                })
                .catch(error => {
                    // Log error but don't reject - use fallbacks instead
                    Debugging.warning(`Failed to load some assets for level ${level.id}`, error);
                    
                    // Create fallbacks for failed assets
                    result.failed.forEach(asset => {
                        const fallback = FallbackAssets.getFallback(asset.type, asset.id.split('_').pop());
                        Debugging.info(`Using fallback for ${asset.id}`);
                    });
                    
                    // Return level object even with fallbacks
                    resolve(level);
                });
        });
    }
    
    // Check if level objectives are completed
    function checkObjectivesCompletion(level, gameState) {
        const results = {
            complete: false,
            objectives: []
        };
        
        // Check each objective
        level.objectives.forEach(objective => {
            let isComplete = false;
            let progress = 0;
            
            switch (objective.type) {
                case 'score':
                    progress = Math.min(100, (gameState.score / objective.target) * 100);
                    isComplete = gameState.score >= objective.target;
                    break;
                    
                case 'collect':
                    progress = Math.min(100, (gameState.collected[objective.tileType] / objective.count) * 100);
                    isComplete = gameState.collected[objective.tileType] >= objective.count;
                    break;
                    
                case 'clear':
                    progress = Math.min(100, (gameState.cleared[objective.obstacleType] / objective.count) * 100);
                    isComplete = gameState.cleared[objective.obstacleType] >= objective.count;
                    break;
                    
                default:
                    // Unknown objective type
                    Debugging.warning(`Unknown objective type: ${objective.type}`);
                    isComplete = false;
                    progress = 0;
            }
            
            results.objectives.push({
                type: objective.type,
                description: objective.description,
                complete: isComplete,
                progress: progress
            });
        });
        
        // Level is complete if all primary objectives are complete
        // Some levels might have optional secondary objectives
        const primaryObjectives = results.objectives.filter(obj => !obj.secondary);
        results.complete = primaryObjectives.every(obj => obj.complete);
        
        return results;
    }
    
    // Calculate star rating based on score
    function calculateStarRating(level, score) {
        let stars = 0;
        
        if (score >= level.starRequirements[3]) {
            stars = 3;
        } else if (score >= level.starRequirements[2]) {
            stars = 2;
        } else if (score >= level.starRequirements[1]) {
            stars = 1;
        }
        
        return stars;
    }
    
    // Parse level data from JSON
    function parseLevelData(jsonData) {
        try {
            const levelData = JSON.parse(jsonData);
            return createLevel(levelData);
        } catch (error) {
            Debugging.error('Failed to parse level data', error);
            throw new ErrorHandler.GameError(
                'Failed to parse level data',
                'LEVEL_PARSE_ERROR',
                { originalError: error }
            );
        }
    }
    
    // Public API
    return {
        createLevel,
        parseLevelData
    };
})();

export default LevelModule;