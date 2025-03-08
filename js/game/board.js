/**
 * Tablets & Trials: The Covenant Quest
 * Game Board Module - Core match-3 gameplay
 */

import TileModule from './tile.js';
import MatchEngine from './match-engine.js';
import ErrorHandler from '../services/error-handler.js';
import Debugging from '../utils/debugging.js';
import AudioManager from '../audio/audio-manager.js';

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

// Game Board Module
const GameBoard = (function() {
    // Private variables
    let canvas = null;
    let ctx = null;
    let boardWidth = 7;
    let boardHeight = 7;
    let tileSize = 64;
    let marginSize = 4;
    let tiles = [];
    let selectedTile = null;
    let isSwapping = false;
    let isProcessingMatches = false;
    let matchEngine = null;
    let boardRect = null;
    let animationFrameId = null;
    let isInitialized = false;
    let isPaused = false;
    let hintTimer = null;
    let hintedTiles = [];
    let score = 0;
    let movesLeft = 0;
    let faithMeterValue = 0;
    let objectives = [];
    let tileDistribution = null;
    let specialEffects = [];
    
    // Event callbacks
    const eventCallbacks = {
        onScoreChanged: null,
        onMovesChanged: null,
        onObjectiveProgress: null,
        onFaithMeterChanged: null,
        onLevelComplete: null,
        onNoMoreMoves: null,
        onSpecialTileCreated: null
    };
    
    // Initialize the game board
    function create(canvasElement, options = {}) {
        try {
            if (!canvasElement) {
                Debugging.error('Canvas element is required to create game board');
                throw new ErrorHandler.GameError(
                    'Canvas element is required to create game board',
                    'BOARD_INIT_ERROR'
                );
            }
            
            // Store canvas reference
            canvas = canvasElement;
            try {
                ctx = canvas.getContext('2d');
            } catch (contextError) {
                Debugging.error('Failed to get canvas 2D context', contextError);
                ctx = null;
            }
            
            // Set board dimensions
            boardWidth = options.width || 7;
            boardHeight = options.height || 7;
            
            // Calculate tile size based on canvas dimensions
            calculateTileSize();
            
            // Initialize match engine
            try {
                matchEngine = MatchEngine.create(boardWidth, boardHeight);
            } catch (matchError) {
                Debugging.error('Failed to initialize match engine', matchError);
                // Create minimal match engine
                matchEngine = {
                    findMatches: () => [],
                    findPotentialMatches: () => [],
                    detectPatterns: () => []
                };
            }
            
            // Add event listeners
            addEventListeners();
            
            // Start render loop
            startRenderLoop();
            
            isInitialized = true;
            Debugging.info('Game board created', { width: boardWidth, height: boardHeight });
            
            return {
                setupBoard,
                handleResize,
                pause,
                resume,
                showHint,
                activateFaithPower,
                setEventCallback,
                debugPlaceTile,
                
                // Debug helpers
                getTileStats: function() {
                    // Count tiles by type
                    const stats = {};
                    
                    try {
                        for (let y = 0; y < boardHeight; y++) {
                            for (let x = 0; x < boardWidth; x++) {
                                if (tiles[y] && tiles[y][x]) {
                                    const type = tiles[y][x].type;
                                    stats[type] = (stats[type] || 0) + 1;
                                }
                            }
                        }
                    } catch (error) {
                        Debugging.warning('Error getting tile stats', error);
                    }
                    
                    return stats;
                },
                
                getTileCount: function() {
                    let count = 0;
                    try {
                        for (let y = 0; y < boardHeight; y++) {
                            for (let x = 0; x < boardWidth; x++) {
                                if (tiles[y] && tiles[y][x]) {
                                    count++;
                                }
                            }
                        }
                    } catch (error) {
                        Debugging.warning('Error getting tile count', error);
                    }
                    return count;
                },
                
                getPossibleMatchCount: function() {
                    try {
                        return findValidMoves().length;
                    } catch (error) {
                        Debugging.warning('Error getting possible match count', error);
                        return 0;
                    }
                }
            };
        } catch (error) {
            Debugging.error('Failed to create game board', error);
            
            // Return minimal game board interface in case of error
            return {
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
    }
    
    // Set up the board with tiles
    function setupBoard(width, height, distribution) {
        try {
            // Clear any existing board
            clearBoard();
            
            // Update board dimensions
            boardWidth = width || boardWidth;
            boardHeight = height || boardHeight;
            
            // Validate dimensions
            if (boardWidth <= 0 || boardHeight <= 0) {
                Debugging.warning('Invalid board dimensions, using defaults', { width, height });
                boardWidth = 7;
                boardHeight = 7;
            }
            
            // Store tile distribution for refilling
            tileDistribution = distribution || {
                manna: 20,
                water: 20,
                fire: 20,
                stone: 20,
                quail: 20
            };
            
            // Reset game state
            score = 0;
            movesLeft = 30; // Default, will be overridden by level data
            faithMeterValue = 0;
            
            // Recalculate tile size
            calculateTileSize();
            
            // Initialize new match engine
            try {
                matchEngine = MatchEngine.create(boardWidth, boardHeight);
            } catch (error) {
                Debugging.error('Failed to initialize match engine', error);
                // Create minimal match engine
                matchEngine = {
                    findMatches: () => [],
                    findPotentialMatches: () => [],
                    detectPatterns: () => []
                };
            }
            
            // Create initial board with no matches
            createInitialBoard();
            
            // Trigger callbacks
            if (eventCallbacks.onScoreChanged) {
                try {
                    eventCallbacks.onScoreChanged(score);
                } catch (error) {
                    Debugging.warning('Error in onScoreChanged callback', error);
                }
            }
            
            if (eventCallbacks.onMovesChanged) {
                try {
                    eventCallbacks.onMovesChanged(movesLeft);
                } catch (error) {
                    Debugging.warning('Error in onMovesChanged callback', error);
                }
            }
            
            if (eventCallbacks.onFaithMeterChanged) {
                try {
                    eventCallbacks.onFaithMeterChanged(faithMeterValue);
                } catch (error) {
                    Debugging.warning('Error in onFaithMeterChanged callback', error);
                }
            }
            
            isPaused = false;
            Debugging.info('Board setup complete', { width, height, distribution });
        } catch (error) {
            Debugging.error('Failed to setup board', error);
            
            // Try to create a fallback board
            createFallbackBoard();
            
            ErrorHandler.logError(
                new ErrorHandler.GameError(
                    'Failed to setup game board',
                    'BOARD_SETUP_ERROR',
                    { originalError: error }
                ),
                ErrorHandler.SEVERITY.ERROR
            );
        }
    }
    
    // Create the initial board with no matches
    function createInitialBoard() {
        try {
            // Initialize empty tiles array with proper dimensions
            tiles = new Array(boardHeight);
            for (let y = 0; y < boardHeight; y++) {
                tiles[y] = new Array(boardWidth);
                
                // Initialize each tile position to null
                for (let x = 0; x < boardWidth; x++) {
                    tiles[y][x] = null;
                }
            }
            
            // Fill board with tiles
            for (let y = 0; y < boardHeight; y++) {
                for (let x = 0; x < boardWidth; x++) {
                    // Create a tile type that doesn't form a match
                    const tileType = getRandomTileType(x, y);
                    const tile = TileModule.createTile(tileType, { x, y });
                    tiles[y][x] = tile;
                }
            }
            
            // Check if there are any valid moves
            ensureValidMoves();
        } catch (error) {
            Debugging.error('Failed to create initial board', error);
            
            // Create minimal valid board in case of error
            createFallbackBoard();
        }
    }
    
    // Create a fallback board when initialization fails
    function createFallbackBoard() {
        Debugging.warning('Creating fallback board');
        
        try {
            // Create minimal valid board
            tiles = new Array(boardHeight);
            for (let y = 0; y < boardHeight; y++) {
                tiles[y] = new Array(boardWidth);
                for (let x = 0; x < boardWidth; x++) {
                    // Use simple alternating pattern
                    const tileTypes = ['manna', 'water', 'fire', 'stone', 'quail'];
                    const typeIndex = (x + y) % tileTypes.length;
                    tiles[y][x] = TileModule.createTile(tileTypes[typeIndex], { x, y });
                }
            }
        } catch (error) {
            Debugging.error('Failed to create fallback board', error);
        }
    }
    
    // Get random tile type based on distribution and avoid matches
    function getRandomTileType(x, y, avoidMatches = true) {
        try {
            // Get available types based on distribution
            const types = [];
            const distribution = { ...tileDistribution };
            
            for (const type in distribution) {
                for (let i = 0; i < distribution[type]; i++) {
                    types.push(type);
                }
            }
            
            if (!avoidMatches) {
                // Return completely random type if not avoiding matches
                return types[Math.floor(Math.random() * types.length)];
            }
            
            // Shuffle types
            const shuffledTypes = [...types].sort(() => Math.random() - 0.5);
            
            // Avoid creating matches by checking adjacent tiles
            for (const type of shuffledTypes) {
                // Check if this type would form a horizontal match
                if (x >= 2) {
                    if (tiles[y] && tiles[y][x-1]?.type === type && tiles[y][x-2]?.type === type) {
                        continue; // Skip this type as it would form a horizontal match
                    }
                }
                
                // Check if this type would form a vertical match
                if (y >= 2) {
                    if (tiles[y-1] && tiles[y-2] && 
                        tiles[y-1][x]?.type === type && tiles[y-2][x]?.type === type) {
                        continue; // Skip this type as it would form a vertical match
                    }
                }
                
                // This type doesn't form a match, use it
                return type;
            }
            
            // If all types would form matches, just return a random one
            return shuffledTypes[0];
        } catch (error) {
            Debugging.warning('Error getting random tile type', error);
            // Return a default type
            return 'manna';
        }
    }
    
    // Ensure the board has valid moves
    function ensureValidMoves() {
        try {
            const validMoves = findValidMoves();
            
            if (validMoves.length === 0) {
                // No valid moves, reshuffle the board
                Debugging.info('No valid moves available, reshuffling board');
                shuffleBoard();
                
                // Recursive check to ensure we have valid moves after shuffle
                ensureValidMoves();
            }
        } catch (error) {
            Debugging.warning('Error ensuring valid moves', error);
        }
    }
    
    // Find all valid moves on the current board
    function findValidMoves() {
        const validMoves = [];
        
        try {
            // Check each tile for potential moves
            for (let y = 0; y < boardHeight; y++) {
                for (let x = 0; x < boardWidth; x++) {
                    // Skip if we don't have valid tiles
                    if (!tiles[y] || !tiles[y][x]) continue;
                    
                    // Check horizontal swap
                    if (x < boardWidth - 1 && tiles[y] && tiles[y][x+1]) {
                        // Swap tiles
                        const temp = tiles[y][x].type;
                        tiles[y][x].type = tiles[y][x + 1].type;
                        tiles[y][x + 1].type = temp;
                        
                        // Check for matches after swap
                        const horizontalMatches = matchEngine.findMatches(tiles);
                        
                        // Swap back
                        tiles[y][x + 1].type = tiles[y][x].type;
                        tiles[y][x].type = temp;
                        
                        if (horizontalMatches.length > 0) {
                            validMoves.push({
                                x1: x, y1: y,
                                x2: x + 1, y2: y,
                                matches: horizontalMatches
                            });
                        }
                    }
                    
                    // Check vertical swap
                    if (y < boardHeight - 1 && tiles[y+1] && tiles[y+1][x]) {
                        // Swap tiles
                        const temp = tiles[y][x].type;
                        tiles[y][x].type = tiles[y + 1][x].type;
                        tiles[y + 1][x].type = temp;
                        
                        // Check for matches after swap
                        const verticalMatches = matchEngine.findMatches(tiles);
                        
                        // Swap back
                        tiles[y + 1][x].type = tiles[y][x].type;
                        tiles[y][x].type = temp;
                        
                        if (verticalMatches.length > 0) {
                            validMoves.push({
                                x1: x, y1: y,
                                x2: x, y2: y + 1,
                                matches: verticalMatches
                            });
                        }
                    }
                }
            }
        } catch (error) {
            Debugging.warning('Error finding valid moves', error);
        }
        
        return validMoves;
    }
    
    // Shuffle the board
    function shuffleBoard() {
        try {
            // Collect all tile types
            const tileTypes = [];
            for (let y = 0; y < boardHeight; y++) {
                for (let x = 0; x < boardWidth; x++) {
                    if (tiles[y] && tiles[y][x]) {
                        tileTypes.push(tiles[y][x].type);
                    }
                }
            }
            
            // Shuffle the types
            tileTypes.sort(() => Math.random() - 0.5);
            
            // Reassign types
            let index = 0;
            for (let y = 0; y < boardHeight; y++) {
                for (let x = 0; x < boardWidth; x++) {
                    if (tiles[y] && tiles[y][x]) {
                        tiles[y][x].type = tileTypes[index++];
                    }
                }
            }
        } catch (error) {
            Debugging.warning('Error shuffling board', error);
        }
    }
    
    // Show a hint by highlighting a valid move
    function showHint() {
        if (isPaused || isSwapping || isProcessingMatches) return;
        
        try {
            // Clear any existing hint
            clearHint();
            
            // Find all valid moves
            const validMoves = findValidMoves();
            
            if (validMoves.length > 0) {
                // Select a random valid move
                const hintMove = validMoves[Math.floor(Math.random() * validMoves.length)];
                
                // Highlight the tiles involved in the move
                const tile1 = tiles[hintMove.y1][hintMove.x1];
                const tile2 = tiles[hintMove.y2][hintMove.x2];
                
                tile1.isHinted = true;
                tile2.isHinted = true;
                
                hintedTiles = [tile1, tile2];
                
                // Set hint timer to clear the hint after 3 seconds
                hintTimer = setTimeout(clearHint, 3000);
                
                // Play hint sound
                safeAudioCall('playSfx', 'hint');
            }
        } catch (error) {
            Debugging.warning('Error showing hint', error);
        }
    }
    
    // Clear any active hint
    function clearHint() {
        try {
            if (hintTimer) {
                clearTimeout(hintTimer);
                hintTimer = null;
            }
            
            // Remove hint flag from all tiles
            hintedTiles.forEach(tile => {
                if (tile) {
                    tile.isHinted = false;
                }
            });
            
            hintedTiles = [];
        } catch (error) {
            Debugging.warning('Error clearing hint', error);
        }
    }
    
    // Handle board resize
    function handleResize() {
        try {
            calculateTileSize();
        } catch (error) {
            Debugging.warning('Error handling resize', error);
        }
    }
    
    // Calculate tile size based on canvas dimensions
    function calculateTileSize() {
        if (!canvas) return;
        
        try {
            // Get canvas dimensions safely
            const canvasWidth = canvas.width || 0;
            const canvasHeight = canvas.height || 0;
            
            // Safety check for zero dimensions
            if (canvasWidth <= 0 || canvasHeight <= 0) {
                tileSize = 64; // Default tile size as fallback
                Debugging.warning('Canvas has zero dimensions, using default tile size');
                
                // Create a default board rect
                boardRect = {
                    x: marginSize,
                    y: marginSize,
                    width: boardWidth * (tileSize + marginSize) + marginSize,
                    height: boardHeight * (tileSize + marginSize) + marginSize
                };
                
                return;
            }
            
            // Calculate tile size to fit board within canvas
            const maxTileWidth = Math.max(10, (canvasWidth - marginSize * 2) / boardWidth - marginSize);
            const maxTileHeight = Math.max(10, (canvasHeight - marginSize * 2) / boardHeight - marginSize);
            
            // Use the smaller dimension to ensure square tiles, with minimum size of 10px
            tileSize = Math.max(10, Math.floor(Math.min(maxTileWidth, maxTileHeight)));
            
            // Store board rect for hit testing
            const totalBoardWidth = boardWidth * (tileSize + marginSize) + marginSize;
            const totalBoardHeight = boardHeight * (tileSize + marginSize) + marginSize;
            
            const offsetX = Math.max(0, (canvasWidth - totalBoardWidth) / 2);
            const offsetY = Math.max(0, (canvasHeight - totalBoardHeight) / 2);
            
            boardRect = {
                x: offsetX,
                y: offsetY,
                width: totalBoardWidth,
                height: totalBoardHeight
            };
            
            Debugging.info('Tile size calculated', { 
                tileSize, 
                boardRect,
                canvasWidth,
                canvasHeight
            });
        } catch (error) {
            Debugging.error('Error calculating tile size', error);
            
            // Fallback to default values
            tileSize = 64;
            boardRect = {
                x: marginSize,
                y: marginSize,
                width: boardWidth * (tileSize + marginSize) + marginSize,
                height: boardHeight * (tileSize + marginSize) + marginSize
            };
        }
    }
    
    // Add event listeners to the canvas
    function addEventListeners() {
        if (!canvas) return;
        
        try {
            // Mouse events
            canvas.addEventListener('mousedown', handlePointerDown);
            canvas.addEventListener('mousemove', handlePointerMove);
            canvas.addEventListener('mouseup', handlePointerUp);
            
            // Touch events
            canvas.addEventListener('touchstart', handleTouchStart);
            canvas.addEventListener('touchmove', handleTouchMove);
            canvas.addEventListener('touchend', handleTouchEnd);
        } catch (error) {
            Debugging.warning('Error adding event listeners', error);
        }
    }
    
    // Handle mouse down event
    function handlePointerDown(e) {
        if (isPaused || isSwapping || isProcessingMatches) return;
        
        try {
            const { x, y } = getPointerPosition(e);
            const tilePos = getTileAtPosition(x, y);
            
            if (tilePos && tiles[tilePos.y] && tiles[tilePos.y][tilePos.x]) {
                selectedTile = tiles[tilePos.y][tilePos.x];
                selectedTile.isSelected = true;
                
                // Clear any hint
                clearHint();
                
                // Play select sound
                safeAudioCall('playSfx', 'tile-select');
            }
        } catch (error) {
            Debugging.warning('Error handling pointer down', error);
        }
    }
    
    // Handle mouse move event
    function handlePointerMove(e) {
        if (!selectedTile || isPaused || isSwapping || isProcessingMatches) return;
        
        try {
            const { x, y } = getPointerPosition(e);
            const tilePos = getTileAtPosition(x, y);
            
            if (tilePos && tiles[tilePos.y] && tiles[tilePos.y][tilePos.x] &&
                (tilePos.x !== selectedTile.position.x || tilePos.y !== selectedTile.position.y)) {
                // Only allow swaps with adjacent tiles
                if (isAdjacent(selectedTile.position, tilePos)) {
                    const targetTile = tiles[tilePos.y][tilePos.x];
                    swapTiles(selectedTile, targetTile);
                    selectedTile = null;
                }
            }
        } catch (error) {
            Debugging.warning('Error handling pointer move', error);
        }
    }
    
    // Handle mouse up event
    function handlePointerUp() {
        try {
            if (selectedTile) {
                selectedTile.isSelected = false;
                selectedTile = null;
            }
        } catch (error) {
            Debugging.warning('Error handling pointer up', error);
        }
    }
    
    // Handle touch start event
    function handleTouchStart(e) {
        try {
            e.preventDefault(); // Prevent scrolling
            
            if (isPaused || isSwapping || isProcessingMatches) return;
            
            if (e.touches.length === 1) {
                const touch = e.touches[0];
                const { x, y } = getPointerPosition(touch);
                const tilePos = getTileAtPosition(x, y);
                
                if (tilePos && tiles[tilePos.y] && tiles[tilePos.y][tilePos.x]) {
                    selectedTile = tiles[tilePos.y][tilePos.x];
                    selectedTile.isSelected = true;
                    
                    // Clear any hint
                    clearHint();
                    
                    // Play select sound
                    safeAudioCall('playSfx', 'tile-select');
                }
            }
        } catch (error) {
            Debugging.warning('Error handling touch start', error);
        }
    }
    
    // Handle touch move event
    function handleTouchMove(e) {
        try {
            e.preventDefault(); // Prevent scrolling
            
            if (!selectedTile || isPaused || isSwapping || isProcessingMatches) return;
            
            if (e.touches.length === 1) {
                const touch = e.touches[0];
                const { x, y } = getPointerPosition(touch);
                const tilePos = getTileAtPosition(x, y);
                
                if (tilePos && tiles[tilePos.y] && tiles[tilePos.y][tilePos.x] &&
                    (tilePos.x !== selectedTile.position.x || tilePos.y !== selectedTile.position.y)) {
                    // Only allow swaps with adjacent tiles
                    if (isAdjacent(selectedTile.position, tilePos)) {
                        const targetTile = tiles[tilePos.y][tilePos.x];
                        swapTiles(selectedTile, targetTile);
                        selectedTile = null;
                    }
                }
            }
        } catch (error) {
            Debugging.warning('Error handling touch move', error);
        }
    }
    
    // Handle touch end event
    function handleTouchEnd(e) {
        try {
            e.preventDefault(); // Prevent default behavior
            
            if (selectedTile) {
                selectedTile.isSelected = false;
                selectedTile = null;
            }
        } catch (error) {
            Debugging.warning('Error handling touch end', error);
        }
    }
    
    // Get pointer position relative to canvas
    function getPointerPosition(e) {
        try {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            
            return {
                x: (e.clientX - rect.left) * scaleX,
                y: (e.clientY - rect.top) * scaleY
            };
        } catch (error) {
            Debugging.warning('Error getting pointer position', error);
            return { x: 0, y: 0 };
        }
    }
    
    // Get the tile at a given position
    function getTileAtPosition(x, y) {
        try {
            if (!boardRect) {
                calculateTileSize();
            }
            
            // Ensure we have a valid boardRect
            if (!boardRect) {
                return null;
            }
            
            // Check if the point is within the board area
            if (x < boardRect.x || x >= boardRect.x + boardRect.width ||
                y < boardRect.y || y >= boardRect.y + boardRect.height) {
                return null;
            }
            
            // Calculate tile coordinates
            const tileX = Math.floor((x - boardRect.x - marginSize) / (tileSize + marginSize));
            const tileY = Math.floor((y - boardRect.y - marginSize) / (tileSize + marginSize));
            
            // Ensure coordinates are within board boundaries
            if (tileX >= 0 && tileX < boardWidth && tileY >= 0 && tileY < boardHeight) {
                return { x: tileX, y: tileY };
            }
        } catch (error) {
            Debugging.warning('Error getting tile at position', error);
        }
        
        return null;
    }
    
    // Check if two positions are adjacent
    function isAdjacent(pos1, pos2) {
        try {
            return (
                (Math.abs(pos1.x - pos2.x) === 1 && pos1.y === pos2.y) ||
                (Math.abs(pos1.y - pos2.y) === 1 && pos1.x === pos2.x)
            );
        } catch (error) {
            Debugging.warning('Error checking if positions are adjacent', error);
            return false;
        }
    }
    
    // Swap two tiles
    function swapTiles(tile1, tile2) {
        // Mark as swapping to prevent further interaction
        isSwapping = true;
        
        try {
            // Reset selected state
            tile1.isSelected = false;
            
            // Set swapping animation state
            tile1.isMoving = true;
            tile2.isMoving = true;
            
            // Play swap sound
            safeAudioCall('playSfx', 'tile-swap');
            
            // Wait for animation to complete
            setTimeout(() => {
                try {
                    // Swap tile types
                    const tempType = tile1.type;
                    tile1.type = tile2.type;
                    tile2.type = tempType;
                    
                    // Swap special properties if needed
                    const tempIsSpecial = tile1.isSpecial;
                    tile1.isSpecial = tile2.isSpecial;
                    tile2.isSpecial = tempIsSpecial;
                    
                    // Check for matches
                    const matches = matchEngine.findMatches(tiles);
                    
                    if (matches.length > 0) {
                        // Process matches
                        processMatches(matches);
                        
                        // Deduct a move
                        movesLeft--;
                        
                        // Update UI
                        if (eventCallbacks.onMovesChanged) {
                            try {
                                eventCallbacks.onMovesChanged(movesLeft);
                            } catch (error) {
                                Debugging.warning('Error in onMovesChanged callback', error);
                            }
                        }
                        
                        // Reset moving state
                        tile1.isMoving = false;
                        tile2.isMoving = false;
                        
                        // Check for level completion
                        checkLevelCompletion();
                    } else {
                        // No matches, swap back
                        setTimeout(() => {
                            try {
                                // Play failed swap sound
                                safeAudioCall('playSfx', 'tile-swap-fail');
                                
                                // Swap back tile types
                                const tempType = tile1.type;
                                tile1.type = tile2.type;
                                tile2.type = tempType;
                                
                                // Swap back special properties
                                const tempIsSpecial = tile1.isSpecial;
                                tile1.isSpecial = tile2.isSpecial;
                                tile2.isSpecial = tempIsSpecial;
                                
                                // Reset states
                                setTimeout(() => {
                                    tile1.isMoving = false;
                                    tile2.isMoving = false;
                                    isSwapping = false;
                                }, 200);
                            } catch (error) {
                                Debugging.warning('Error swapping tiles back', error);
                                isSwapping = false;
                            }
                        }, 200);
                    }
                } catch (error) {
                    Debugging.error('Error processing swap', error);
                    isSwapping = false;
                }
            }, 200);
        } catch (error) {
            Debugging.error('Error swapping tiles', error);
            isSwapping = false;
        }
    }
    
    // Process matches
    function processMatches(matches) {
        isProcessingMatches = true;
        
        try {
            // Mark matched tiles
            matches.forEach(match => {
                if (!match || !match.tiles) return;
                
                match.tiles.forEach(tilePos => {
                    if (!tilePos || !tiles[tilePos.y] || !tiles[tilePos.y][tilePos.x]) return;
                    
                    const tile = tiles[tilePos.y][tilePos.x];
                    tile.isMatched = true;
                    
                    // Check for special tiles
                    if (tile.isSpecial) {
                        activateSpecialTile(tile, match);
                    }
                });
            });
            
            // Play match sound based on match size
            if (matches.length > 1) {
                safeAudioCall('playSfx', 'match-multiple');
            } else if (matches.length === 1) {
                const matchSize = matches[0].tiles.length;
                if (matchSize >= 5) {
                    safeAudioCall('playSfx', 'match-five');
                } else if (matchSize === 4) {
                    safeAudioCall('playSfx', 'match-four');
                } else {
                    safeAudioCall('playSfx', 'match-three');
                }
            }
            
            // Calculate score
            let matchScore = 0;
            let totalTiles = 0;
            
            matches.forEach(match => {
                if (!match || !match.tiles) return;
                
                const baseScore = 100;
                const matchSize = match.tiles.length;
                let matchPoints = 0;
                
                // Base points based on match size
                if (matchSize === 3) {
                    matchPoints = baseScore;
                } else if (matchSize === 4) {
                    matchPoints = baseScore * 1.5; // 150 points
                } else if (matchSize === 5) {
                    matchPoints = baseScore * 2.5; // 250 points
                } else if (matchSize > 5) {
                    matchPoints = baseScore * matchSize * 0.6; // Scale with size
                }
                
                // Bonus for match pattern
                if (match.pattern === 'L') {
                    matchPoints *= 1.2; // 20% bonus for L shape
                } else if (match.pattern === 'T') {
                    matchPoints *= 1.3; // 30% bonus for T shape
                }
                
                // Award points
                matchScore += Math.round(matchPoints);
                totalTiles += matchSize;
                
                // Create special tiles for large matches
                if (matchSize >= 4 || match.pattern) {
                    createSpecialTile(match);
                }
            });
            
            // Add to total score
            score += matchScore;
            
            // Update faith meter (5% per standard match, more for special matches)
            const faithGain = 5 * (1 + (totalTiles - 3) * 0.5);
            faithMeterValue = Math.min(100, faithMeterValue + faithGain);
            
            // Update UI
            if (eventCallbacks.onScoreChanged) {
                try {
                    eventCallbacks.onScoreChanged(score);
                } catch (error) {
                    Debugging.warning('Error in onScoreChanged callback', error);
                }
            }
            
            if (eventCallbacks.onFaithMeterChanged) {
                try {
                    eventCallbacks.onFaithMeterChanged(faithMeterValue);
                } catch (error) {
                    Debugging.warning('Error in onFaithMeterChanged callback', error);
                }
            }
            
            // Show score popup
            if (matches.length > 0 && matches[0].tiles.length > 0) {
                showScorePopup(matchScore, matches[0].tiles[0]);
            }
            
            // Wait for animation, then remove matched tiles
            setTimeout(() => {
                try {
                    // Check for completed objectives
                    updateObjectives(matches);
                    
                    // Remove matched tiles
                    removeMatchedTiles();
                    
                    // Wait for tiles to disappear, then cascade and refill
                    setTimeout(() => {
                        cascadeAndRefill();
                    }, 300);
                } catch (error) {
                    Debugging.error('Error processing matches after animation', error);
                    isProcessingMatches = false;
                    isSwapping = false;
                }
            }, 500);
        } catch (error) {
            Debugging.error('Error processing matches', error);
            isProcessingMatches = false;
            isSwapping = false;
        }
    }
    
    // Remove matched tiles
    function removeMatchedTiles() {
        try {
            for (let y = 0; y < boardHeight; y++) {
                for (let x = 0; x < boardWidth; x++) {
                    if (tiles[y] && tiles[y][x] && tiles[y][x].isMatched) {
                        tiles[y][x] = null;
                    }
                }
            }
        } catch (error) {
            Debugging.error('Error removing matched tiles', error);
        }
    }
    
    // Cascade tiles down and refill empty spaces
    function cascadeAndRefill() {
        try {
            // Move tiles down to fill empty spaces
            for (let x = 0; x < boardWidth; x++) {
                let emptySpaces = 0;
                
                // Start from the bottom and move up
                for (let y = boardHeight - 1; y >= 0; y--) {
                    if (!tiles[y] || !tiles[y][x]) {
                        // Count empty space
                        emptySpaces++;
                    } else if (emptySpaces > 0) {
                        // Move tile down to fill empty space
                        const tile = tiles[y][x];
                        tile.isMoving = true;
                        
                        // Update tile position
                        tiles[y + emptySpaces][x] = tile;
                        tiles[y][x] = null;
                        
                        // Update tile's position property
                        tile.position.y = y + emptySpaces;
                    }
                }
            }
            
            // Create new tiles for empty spaces at the top
            for (let x = 0; x < boardWidth; x++) {
                for (let y = 0; y < boardHeight; y++) {
                    if (!tiles[y] || !tiles[y][x]) {
                        // Create a new tile
                        const tileType = getRandomTileType(x, y, false);
                        const tile = TileModule.createTile(tileType, { x, y });
                        tile.isNew = true;
                        tiles[y][x] = tile;
                    }
                }
            }
            
            // Play cascade sound
            safeAudioCall('playSfx', 'tile-cascade');
            
            // Wait for tiles to finish moving, then check for new matches
            setTimeout(() => {
                try {
                    // Reset movement state
                    for (let y = 0; y < boardHeight; y++) {
                        for (let x = 0; x < boardWidth; x++) {
                            if (tiles[y] && tiles[y][x]) {
                                tiles[y][x].isMoving = false;
                                tiles[y][x].isNew = false;
                            }
                        }
                    }
                    
                    // Check for new matches
                    const newMatches = matchEngine.findMatches(tiles);
                    
                    if (newMatches.length > 0) {
                        // Chain reaction - process new matches
                        processMatches(newMatches);
                    } else {
                        // No new matches, check if there are valid moves
                        const validMoves = findValidMoves();
                        
                        if (validMoves.length === 0) {
                            // No valid moves, reshuffle
                            reshuffleBoard();
                        } else {
                            // End processing
                            isSwapping = false;
                            isProcessingMatches = false;
                            
                            // Check if we've run out of moves
                            if (movesLeft <= 0) {
                                if (eventCallbacks.onNoMoreMoves) {
                                    try {
                                        eventCallbacks.onNoMoreMoves();
                                    } catch (error) {
                                        Debugging.warning('Error in onNoMoreMoves callback', error);
                                    }
                                }
                            }
                        }
                    }
                } catch (error) {
                    Debugging.error('Error in cascade follow-up', error);
                    isSwapping = false;
                    isProcessingMatches = false;
                }
            }, 500);
        } catch (error) {
            Debugging.error('Error in cascade and refill', error);
            isSwapping = false;
            isProcessingMatches = false;
        }
    }
    
    // Reshuffle the board when no valid moves are available
    function reshuffleBoard() {
        try {
            // Notify user
            Debugging.info('No valid moves available, reshuffling board');
            
            // Play reshuffle sound
            safeAudioCall('playSfx', 'board-shuffle');
            
            // Mark all tiles as moving
            for (let y = 0; y < boardHeight; y++) {
                for (let x = 0; x < boardWidth; x++) {
                    if (tiles[y] && tiles[y][x]) {
                        tiles[y][x].isMoving = true;
                    }
                }
            }
            
            // Wait for animation
            setTimeout(() => {
                try {
                    // Shuffle the board
                    shuffleBoard();
                    
                    // Reset movement state
                    for (let y = 0; y < boardHeight; y++) {
                        for (let x = 0; x < boardWidth; x++) {
                            if (tiles[y] && tiles[y][x]) {
                                tiles[y][x].isMoving = false;
                            }
                        }
                    }
                    
                    // Ensure we have valid moves after shuffle
                    ensureValidMoves();
                    
                    // End processing
                    isSwapping = false;
                    isProcessingMatches = false;
                } catch (error) {
                    Debugging.error('Error completing reshuffle', error);
                    isSwapping = false;
                    isProcessingMatches = false;
                }
            }, 500);
        } catch (error) {
            Debugging.error('Error reshuffling board', error);
            isSwapping = false;
            isProcessingMatches = false;
        }
    }
    
    // Create a special tile based on match pattern
    function createSpecialTile(match) {
        try {
            // Determine special tile type
            let specialType = null;
            
            if (!match || !match.tiles || match.tiles.length === 0) return;
            
            if (match.pattern === 'L' || match.pattern === 'T') {
                specialType = 'tablets';
            } else if (match.tiles.length >= 5) {
                specialType = 'staff';
            } else if (match.tiles.length === 4) {
                specialType = 'pillar';
            }
            
            if (specialType) {
                // Select a position for the special tile (typically the center of the match)
                const centerIndex = Math.floor(match.tiles.length / 2);
                const pos = match.tiles[centerIndex];
                
                if (!pos || !tiles[pos.y]) return;
                
                // Create the special tile
                const specialTile = TileModule.createTile(match.type, { x: pos.x, y: pos.y }, true, specialType);
                tiles[pos.y][pos.x] = specialTile;
                
                // Play special tile creation sound
                safeAudioCall('playSfx', 'special-tile-create');
                
                // Trigger callback
                if (eventCallbacks.onSpecialTileCreated) {
                    try {
                        eventCallbacks.onSpecialTileCreated(specialType, pos);
                    } catch (error) {
                        Debugging.warning('Error in onSpecialTileCreated callback', error);
                    }
                }
                
                Debugging.info(`Created special tile: ${specialType} at (${pos.x}, ${pos.y})`);
            }
        } catch (error) {
            Debugging.warning('Error creating special tile', error);
        }
    }
    
    // Activate a special tile's power
    function activateSpecialTile(tile, match) {
        try {
            const x = tile.position.x;
            const y = tile.position.y;
            
            // Different effects based on special tile type
            if (tile.specialType === 'staff') {
                // Staff of Moses clears horizontal row
                for (let i = 0; i < boardWidth; i++) {
                    if (tiles[y] && tiles[y][i] && !tiles[y][i].isMatched) {
                        tiles[y][i].isMatched = true;
                        match.tiles.push({ x: i, y: y });
                    }
                }
                
                // Play staff activation sound
                safeAudioCall('playSfx', 'staff-activate');
                
                // Add special effect
                specialEffects.push({
                    type: 'staff',
                    x: x,
                    y: y,
                    duration: 1000,
                    startTime: Date.now()
                });
            } 
            else if (tile.specialType === 'pillar') {
                // Pillar of Fire clears vertical column
                for (let i = 0; i < boardHeight; i++) {
                    if (tiles[i] && tiles[i][x] && !tiles[i][x].isMatched) {
                        tiles[i][x].isMatched = true;
                        match.tiles.push({ x: x, y: i });
                    }
                }
                
                // Play pillar activation sound
                safeAudioCall('playSfx', 'pillar-activate');
                
                // Add special effect
                specialEffects.push({
                    type: 'pillar',
                    x: x,
                    y: y,
                    duration: 1000,
                    startTime: Date.now()
                });
            } 
            else if (tile.specialType === 'tablets') {
                // Tablets clear a 3x3 area
                for (let i = Math.max(0, y - 1); i <= Math.min(boardHeight - 1, y + 1); i++) {
                    for (let j = Math.max(0, x - 1); j <= Math.min(boardWidth - 1, x + 1); j++) {
                        if (tiles[i] && tiles[i][j] && !tiles[i][j].isMatched) {
                            tiles[i][j].isMatched = true;
                            match.tiles.push({ x: j, y: i });
                        }
                    }
                }
                
                // Play tablets activation sound
                safeAudioCall('playSfx', 'tablets-activate');
                
                // Add special effect
                specialEffects.push({
                    type: 'tablets',
                    x: x,
                    y: y,
                    duration: 1000,
                    startTime: Date.now()
                });
            }
        } catch (error) {
            Debugging.warning('Error activating special tile', error);
        }
    }
    
    // Activate faith power
    function activateFaithPower(powerType) {
        if (isPaused || isSwapping || isProcessingMatches) return;
        
        try {
            isProcessingMatches = true;
            
            // Play power activation sound
            safeAudioCall('playSfx', 'faith-power-activate');
            
            if (powerType === 'redSeaParting') {
                // Red Sea Parting clears 2-3 random rows
                const rowsToMatch = Math.floor(Math.random() * 2) + 2; // 2-3 rows
                const startRow = Math.floor(Math.random() * (boardHeight - rowsToMatch));
                
                const powerMatches = [];
                
                for (let i = 0; i < rowsToMatch; i++) {
                    const y = startRow + i;
                    const rowMatch = { tiles: [], type: 'power', pattern: 'row' };
                    
                    for (let x = 0; x < boardWidth; x++) {
                        if (tiles[y] && tiles[y][x]) {
                            tiles[y][x].isMatched = true;
                            rowMatch.tiles.push({ x, y });
                        }
                    }
                    
                    powerMatches.push(rowMatch);
                }
                
                // Add special effect
                specialEffects.push({
                    type: 'redSea',
                    y: startRow,
                    height: rowsToMatch,
                    duration: 2000,
                    startTime: Date.now()
                });
                
                // Process the matches
                setTimeout(() => {
                    processMatches(powerMatches);
                }, 1000);
            } 
            else if (powerType === 'mannaShower') {
                // Manna Shower converts random tiles to manna
                const tilesToConvert = Math.floor(boardWidth * boardHeight * 0.3); // 30% of tiles
                const convertedPositions = [];
                
                // Add special effect first
                specialEffects.push({
                    type: 'mannaShower',
                    duration: 2000,
                    startTime: Date.now()
                });
                
                // Wait for animation
                setTimeout(() => {
                    try {
                        // Convert random tiles to manna
                        for (let i = 0; i < tilesToConvert; i++) {
                            let x, y;
                            let attempts = 0;
                            
                            do {
                                x = Math.floor(Math.random() * boardWidth);
                                y = Math.floor(Math.random() * boardHeight);
                                attempts++;
                            } while (convertedPositions.includes(`${x},${y}`) && attempts < 50);
                            
                            if (attempts < 50 && tiles[y] && tiles[y][x]) {
                                tiles[y][x].type = 'manna';
                                tiles[y][x].isMoving = true;
                                convertedPositions.push(`${x},${y}`);
                            }
                        }
                        
                        // Reset movement state
                        setTimeout(() => {
                            for (let y = 0; y < boardHeight; y++) {
                                for (let x = 0; x < boardWidth; x++) {
                                    if (tiles[y] && tiles[y][x]) {
                                        tiles[y][x].isMoving = false;
                                    }
                                }
                            }
                            
                            // Check for matches
                            const newMatches = matchEngine.findMatches(tiles);
                            
                            if (newMatches.length > 0) {
                                processMatches(newMatches);
                            } else {
                                isProcessingMatches = false;
                            }
                        }, 500);
                    } catch (error) {
                        Debugging.error('Error in manna shower effect', error);
                        isProcessingMatches = false;
                    }
                }, 1000);
            } 
            else if (powerType === 'tabletsOfStone') {
                // Tablets of Stone doubles points for current matches
                
                // Add special effect
                specialEffects.push({
                    type: 'tablets',
                    duration: 2000,
                    startTime: Date.now()
                });
                
                // Find all current matches
                const matches = matchEngine.findMatches(tiles);
                
                if (matches.length > 0) {
                    // Double the score for these matches
                    const originalScore = calculateMatchScore(matches);
                    const doubledScore = originalScore * 2;
                    
                    // Process matches with doubled score
                    setTimeout(() => {
                        try {
                            // Mark matched tiles
                            matches.forEach(match => {
                                if (match && match.tiles) {
                                    match.tiles.forEach(tilePos => {
                                        if (tiles[tilePos.y] && tiles[tilePos.y][tilePos.x]) {
                                            tiles[tilePos.y][tilePos.x].isMatched = true;
                                        }
                                    });
                                }
                            });
                            
                            // Update score and faith meter
                            score += doubledScore;
                            
                            if (eventCallbacks.onScoreChanged) {
                                try {
                                    eventCallbacks.onScoreChanged(score);
                                } catch (error) {
                                    Debugging.warning('Error in onScoreChanged callback', error);
                                }
                            }
                            
                            // Show score popup
                            if (matches.length > 0 && matches[0].tiles.length > 0) {
                                showScorePopup(doubledScore, matches[0].tiles[0], true);
                            }
                            
                            // Continue with match processing
                            setTimeout(() => {
                                removeMatchedTiles();
                                setTimeout(() => {
                                    cascadeAndRefill();
                                }, 300);
                            }, 500);
                        } catch (error) {
                            Debugging.error('Error in tablets power effect', error);
                            isProcessingMatches = false;
                        }
                    }, 1000);
                } else {
                    // No matches to double, just end processing
                    setTimeout(() => {
                        isProcessingMatches = false;
                    }, 2000);
                }
            } else {
                // Unknown power type
                isProcessingMatches = false;
            }
        } catch (error) {
            Debugging.error('Error activating faith power', error);
            isProcessingMatches = false;
        }
    }
    
    // Calculate score for matches (without applying it)
    function calculateMatchScore(matches) {
        let matchScore = 0;
        
        try {
            matches.forEach(match => {
                if (!match || !match.tiles) return;
                
                const baseScore = 100;
                const matchSize = match.tiles.length;
                let matchPoints = 0;
                
                // Base points based on match size
                if (matchSize === 3) {
                    matchPoints = baseScore;
                } else if (matchSize === 4) {
                    matchPoints = baseScore * 1.5; // 150 points
                } else if (matchSize === 5) {
                    matchPoints = baseScore * 2.5; // 250 points
                } else if (matchSize > 5) {
                    matchPoints = baseScore * matchSize * 0.6; // Scale with size
                }
                
                // Bonus for match pattern
                if (match.pattern === 'L') {
                    matchPoints *= 1.2; // 20% bonus for L shape
                } else if (match.pattern === 'T') {
                    matchPoints *= 1.3; // 30% bonus for T shape
                }
                
                // Add points
                matchScore += Math.round(matchPoints);
            });
        } catch (error) {
            Debugging.warning('Error calculating match score', error);
        }
        
        return matchScore;
    }
    
    // Show score popup
    function showScorePopup(points, tilePos, isDoubled = false) {
        try {
            if (!boardRect || !tilePos) return;
            
            // Calculate screen position of tile
            const screenX = boardRect.x + marginSize + tilePos.x * (tileSize + marginSize) + tileSize / 2;
            const screenY = boardRect.y + marginSize + tilePos.y * (tileSize + marginSize);
            
            // Add to special effects
            specialEffects.push({
                type: 'scorePopup',
                x: screenX,
                y: screenY,
                points: points,
                doubled: isDoubled,
                duration: 1000,
                startTime: Date.now()
            });
        } catch (error) {
            Debugging.warning('Error showing score popup', error);
        }
    }
    
    // Update objectives based on matches
    function updateObjectives(matches) {
        // For now, just a placeholder for future implementation
        if (eventCallbacks.onObjectiveProgress) {
            try {
                eventCallbacks.onObjectiveProgress(matches);
            } catch (error) {
                Debugging.warning('Error in onObjectiveProgress callback', error);
            }
        }
    }
    
    // Check if level is complete
    function checkLevelCompletion() {
        try {
            // For now, just check if we're out of moves
            if (movesLeft <= 0) {
                // Determine stars based on score
                let stars = 1; // Always at least 1 star for completion
                
                // Placeholder thresholds - would be set by level data
                if (score >= 5000) {
                    stars = 3;
                } else if (score >= 3000) {
                    stars = 2;
                }
                
                // Trigger level complete callback
                if (eventCallbacks.onLevelComplete) {
                    setTimeout(() => {
                        try {
                            eventCallbacks.onLevelComplete(stars, score);
                        } catch (error) {
                            Debugging.warning('Error in onLevelComplete callback', error);
                        }
                    }, 1000);
                }
            }
        } catch (error) {
            Debugging.warning('Error checking level completion', error);
        }
    }
    
    // Pause the game
    function pause() {
        try {
            isPaused = true;
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
        } catch (error) {
            Debugging.warning('Error pausing game', error);
        }
    }
    
    // Resume the game
    function resume() {
        try {
            if (isPaused) {
                isPaused = false;
                requestAnimationFrame(renderLoop);
            }
        } catch (error) {
            Debugging.warning('Error resuming game', error);
        }
    }
    
    // Start the render loop
    function startRenderLoop() {
        try {
            animationFrameId = requestAnimationFrame(renderLoop);
        } catch (error) {
            Debugging.error('Failed to start render loop', error);
        }
    }
    
    // Main render loop
    function renderLoop(timestamp) {
        if (isPaused) return;
        
        try {
            // Clear canvas
            if (ctx && canvas) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            } else {
                return; // Can't render without context or canvas
            }
            
            // Render board
            renderBoard();
            
            // Render special effects
            renderSpecialEffects(timestamp);
            
            // Request next frame
            animationFrameId = requestAnimationFrame(renderLoop);
        } catch (error) {
            Debugging.error('Error in render loop', error);
            // Try to recover by requesting next frame anyway
            animationFrameId = requestAnimationFrame(renderLoop);
        }
    }
    
    // Render the game board
    function renderBoard() {
        // Safety check
        if (!ctx || !canvas) return;
        
        // Make sure we have valid boardRect
        if (!boardRect) {
            calculateTileSize();
        }
        
        // Safety check for boardRect 
        if (!boardRect || typeof boardRect !== 'object') {
            Debugging.warning('Invalid boardRect in renderBoard');
            return;
        }
        
        try {
            // Draw board background
            ctx.fillStyle = '#1A365D'; // Scripture blue
            ctx.fillRect(
                boardRect.x || 0, 
                boardRect.y || 0, 
                boardRect.width || (boardWidth * tileSize), 
                boardRect.height || (boardHeight * tileSize)
            );
            
            // Draw tiles
            for (let y = 0; y < boardHeight; y++) {
                for (let x = 0; x < boardWidth; x++) {
                    const tile = tiles[y] && tiles[y][x];
                    
                    if (!tile) continue;
                    
                    // Calculate tile position
                    const tileX = (boardRect.x || 0) + marginSize + x * (tileSize + marginSize);
                    const tileY = (boardRect.y || 0) + marginSize + y * (tileSize + marginSize);
                    
                    // Draw tile background
                    ctx.fillStyle = getTileColor(tile);
                    
                    // Handle animations
                    let drawX = tileX;
                    let drawY = tileY;
                    let drawSize = tileSize;
                    let alpha = 1;
                    
                    if (tile.isSelected) {
                        drawSize = tileSize * 1.1;
                        drawX = tileX - (drawSize - tileSize) / 2;
                        drawY = tileY - (drawSize - tileSize) / 2;
                    }
                    
                    if (tile.isMatched) {
                        alpha = 0.7;
                        drawSize = tileSize * 0.9;
                        drawX = tileX + (tileSize - drawSize) / 2;
                        drawY = tileY + (tileSize - drawSize) / 2;
                    }
                    
                    if (tile.isNew) {
                        drawY = tileY - tileSize; // Start above the board
                    }
                    
                    if (tile.isHinted) {
                        // Pulse animation for hints
                        const hintScale = 1 + Math.sin(Date.now() / 200) * 0.1;
                        drawSize = tileSize * hintScale;
                        drawX = tileX + (tileSize - drawSize) / 2;
                        drawY = tileY + (tileSize - drawSize) / 2;
                    }
                    
                    // Apply transparency
                    ctx.globalAlpha = alpha;
                    
                    // Draw tile
                    ctx.fillRect(drawX, drawY, drawSize, drawSize);
                    
                    // Reset transparency
                    ctx.globalAlpha = 1;
                    
                    // Draw special indicator if applicable
                    if (tile.isSpecial) {
                        // Draw special indicator
                        ctx.strokeStyle = '#D4AF37'; // Covenant gold
                        ctx.lineWidth = 3;
                        ctx.strokeRect(drawX + 3, drawY + 3, drawSize - 6, drawSize - 6);
                        
                        // Draw glow for special tiles
                        ctx.shadowColor = '#D4AF37';
                        ctx.shadowBlur = 10;
                        ctx.strokeRect(drawX + 3, drawY + 3, drawSize - 6, drawSize - 6);
                        ctx.shadowBlur = 0;
                    }
                }
            }
        } catch (error) {
            Debugging.error('Error rendering board', error);
        }
    }
    
    // Render special effects
    function renderSpecialEffects(timestamp) {
        try {
            // Update and render all active effects
            specialEffects = specialEffects.filter(effect => {
                if (!effect || !effect.startTime) return false;
                
                const elapsedTime = timestamp - effect.startTime;
                const progress = Math.min(1, elapsedTime / (effect.duration || 1000));
                
                if (progress >= 1) {
                    return false; // Remove completed effects
                }
                
                // Render based on effect type
                if (effect.type === 'scorePopup') {
                    renderScorePopup(effect, progress);
                } else if (effect.type === 'staff') {
                    renderStaffEffect(effect, progress);
                } else if (effect.type === 'pillar') {
                    renderPillarEffect(effect, progress);
                } else if (effect.type === 'tablets') {
                    renderTabletsEffect(effect, progress);
                } else if (effect.type === 'redSea') {
                    renderRedSeaEffect(effect, progress);
                } else if (effect.type === 'mannaShower') {
                    renderMannaShowerEffect(effect, progress);
                }
                
                return true; // Keep active effects
            });
        } catch (error) {
            Debugging.warning('Error rendering special effects', error);
            // Clear effects on error to prevent persistent issues
            specialEffects = [];
        }
    }
    
    // Render score popup effect
    function renderScorePopup(effect, progress) {
        try {
            if (!ctx) return;
            
            // Calculate position with upward movement
            const y = effect.y - progress * 40;
            
            // Calculate opacity (fade out near the end)
            const opacity = progress > 0.7 ? 1 - (progress - 0.7) / 0.3 : 1;
            
            // Draw score text
            ctx.font = 'bold 20px Arial'; // Fallback to Arial if Covenant font isn't available
            ctx.textAlign = 'center';
            ctx.globalAlpha = opacity;
            
            if (effect.doubled) {
                // For doubled scores, use gold color and add "x2"
                ctx.fillStyle = '#D4AF37'; // Covenant gold
                ctx.fillText(`${effect.points} x2`, effect.x, y);
            } else {
                ctx.fillStyle = 'white';
                ctx.fillText(`+${effect.points}`, effect.x, y);
            }
            
            ctx.globalAlpha = 1;
        } catch (error) {
            Debugging.warning('Error rendering score popup', error);
        }
    }
    
    // Render staff effect
    function renderStaffEffect(effect, progress) {
        try {
            if (!ctx || !boardRect) return;
            
            const x = boardRect.x;
            const y = boardRect.y + marginSize + effect.y * (tileSize + marginSize);
            const width = boardRect.width;
            const height = tileSize;
            
            // Create gradient for wave effect
            const gradient = ctx.createLinearGradient(x, y, x + width, y);
            gradient.addColorStop(0, 'rgba(70, 130, 180, 0)'); // Water blue
            gradient.addColorStop(progress, 'rgba(70, 130, 180, 0.7)');
            gradient.addColorStop(Math.min(1, progress + 0.1), 'rgba(70, 130, 180, 0.7)');
            gradient.addColorStop(Math.min(1, progress + 0.2), 'rgba(70, 130, 180, 0)');
            
            // Draw effect
            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, width, height);
        } catch (error) {
            Debugging.warning('Error rendering staff effect', error);
        }
    }
    
    // Render pillar effect
    function renderPillarEffect(effect, progress) {
        try {
            if (!ctx || !boardRect) return;
            
            const x = boardRect.x + marginSize + effect.x * (tileSize + marginSize);
            const y = boardRect.y;
            const width = tileSize;
            const height = boardRect.height;
            
            // Create gradient for flame effect
            const gradient = ctx.createLinearGradient(x, y, x, y + height);
            gradient.addColorStop(0, 'rgba(255, 140, 0, 0)'); // Dark orange
            gradient.addColorStop(1 - progress, 'rgba(255, 140, 0, 0)');
            gradient.addColorStop(Math.min(1, 1 - progress + 0.1), 'rgba(255, 140, 0, 0.7)');
            gradient.addColorStop(Math.min(1, 1 - progress + 0.3), 'rgba(255, 69, 0, 0.7)'); // Red-orange
            gradient.addColorStop(1, 'rgba(255, 69, 0, 0)');
            
            // Draw effect
            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, width, height);
        } catch (error) {
            Debugging.warning('Error rendering pillar effect', error);
        }
    }
    
    // Render tablets effect
    function renderTabletsEffect(effect, progress) {
        try {
            if (!ctx || !boardRect) return;
            
            // If it's a centered effect without specific coordinates
            let centerX, centerY, radius;
            
            if (effect.x !== undefined && effect.y !== undefined) {
                // Positioned effect
                const x = boardRect.x + marginSize + effect.x * (tileSize + marginSize) - tileSize;
                const y = boardRect.y + marginSize + effect.y * (tileSize + marginSize) - tileSize;
                const size = tileSize * 3;
                
                centerX = x + size / 2;
                centerY = y + size / 2;
                radius = size / 2 * (0.5 + progress * 0.5);
            } else {
                // Centered effect (used by the Tablets of Stone power)
                centerX = boardRect.x + boardRect.width / 2;
                centerY = boardRect.y + boardRect.height / 2;
                radius = Math.min(boardRect.width, boardRect.height) * 0.4 * progress;
            }
            
            // Create radial gradient
            const gradient = ctx.createRadialGradient(
                centerX, centerY, 0,
                centerX, centerY, radius
            );
            
            gradient.addColorStop(0, 'rgba(220, 220, 220, 0.7)'); // Light gray
            gradient.addColorStop(0.7, 'rgba(169, 169, 169, 0.5)'); // Dark gray
            gradient.addColorStop(1, 'rgba(169, 169, 169, 0)');
            
            // Draw effect
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.fill();
        } catch (error) {
            Debugging.warning('Error rendering tablets effect', error);
        }
    }
    
    // Render Red Sea effect
    function renderRedSeaEffect(effect, progress) {
        try {
            if (!ctx || !boardRect) return;
            
            const x = boardRect.x;
            const y = boardRect.y + marginSize + effect.y * (tileSize + marginSize);
            const width = boardRect.width;
            const height = effect.height * (tileSize + marginSize) - marginSize;
            
            // Create wave pattern
            const waveHeight = 10;
            const waveFrequency = 0.05;
            const wavePeriods = 5; // Number of complete waves across width
            
            ctx.fillStyle = 'rgba(70, 130, 180, 0.4)'; // Water blue
            ctx.beginPath();
            ctx.moveTo(x, y + height);
            
            // Bottom edge of the water area
            for (let i = 0; i <= width; i++) {
                const dx = i;
                const yOffset = Math.sin((dx * waveFrequency * wavePeriods) + progress * 10) * waveHeight;
                ctx.lineTo(x + dx, y + height + yOffset);
            }
            
            // Finish the shape
            ctx.lineTo(x + width, y);
            ctx.lineTo(x, y);
            ctx.closePath();
            ctx.fill();
            
            // Add some white caps for foam
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            for (let i = 0; i <= width; i += 20) {
                const dx = i;
                const yOffset = Math.sin((dx * waveFrequency * wavePeriods) + progress * 10) * waveHeight;
                
                if (Math.random() > 0.7) {
                    ctx.moveTo(x + dx, y + height + yOffset);
                    ctx.lineTo(x + dx + 10, y + height + yOffset - 5);
                }
            }
            
            ctx.stroke();
        } catch (error) {
            Debugging.warning('Error rendering Red Sea effect', error);
        }
    }
    
    // Render Manna Shower effect
    function renderMannaShowerEffect(effect, progress) {
        try {
            if (!ctx || !boardRect) return;
            
            const x = boardRect.x;
            const y = boardRect.y;
            const width = boardRect.width;
            const height = boardRect.height;
            
            // Number of manna particles
            const particleCount = 50;
            
            // Draw falling manna particles
            ctx.fillStyle = '#F5F5DC'; // Beige
            
            for (let i = 0; i < particleCount; i++) {
                // Randomize positions
                const particleX = x + (i / particleCount) * width + Math.sin(progress * 10 + i) * 10;
                const particleY = y + (progress * 2 * height * ((i % 3) + 1) / 3) % height;
                const particleSize = 3 + Math.random() * 5;
                
                // Draw particle
                ctx.beginPath();
                ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Add glow at the top to suggest more falling from above
            const gradient = ctx.createLinearGradient(x, y, x, y + 50);
            gradient.addColorStop(0, 'rgba(255, 255, 220, 0.5)');
            gradient.addColorStop(1, 'rgba(255, 255, 220, 0)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, width, 50);
        } catch (error) {
            Debugging.warning('Error rendering manna shower effect', error);
        }
    }
    
    // Get color for a tile based on its type
    function getTileColor(tile) {
        if (!tile) return '#CCCCCC'; // Default gray
        
        try {
            switch (tile.type) {
                case 'manna':
                    return '#F5F5DC'; // Beige
                case 'water':
                    return '#4682B4'; // Water blue
                case 'fire':
                    return '#C41E3A'; // Fire red
                case 'stone':
                    return '#696969'; // Stone gray
                case 'quail':
                    return '#8B4513'; // Brown
                default:
                    return '#FFFFFF'; // White as fallback
            }
        } catch (error) {
            Debugging.warning('Error getting tile color', error);
            return '#CCCCCC'; // Default gray
        }
    }
    
    // Set event callback
    function setEventCallback(event, callback) {
        try {
            if (eventCallbacks.hasOwnProperty(event)) {
                eventCallbacks[event] = callback;
                return true;
            }
            return false;
        } catch (error) {
            Debugging.warning('Error setting event callback', error);
            return false;
        }
    }
    
    // Clear the board
    function clearBoard() {
        try {
            if (tiles) {
                tiles = [];
            }
            
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
            
            if (hintTimer) {
                clearTimeout(hintTimer);
                hintTimer = null;
            }
            
            specialEffects = [];
            selectedTile = null;
            isSwapping = false;
            isProcessingMatches = false;
        } catch (error) {
            Debugging.warning('Error clearing board', error);
        }
    }
    
    // Debug function to place a specific tile
    function debugPlaceTile(type, x, y) {
        try {
            // Check if debug mode is active
            if (typeof Debugging.isDebugMode === 'function' && Debugging.isDebugMode()) {
                // If position not specified, use center of board
                if (x === undefined || y === undefined) {
                    x = Math.floor(boardWidth / 2);
                    y = Math.floor(boardHeight / 2);
                }
                
                // Ensure coordinates are valid
                if (x >= 0 && x < boardWidth && y >= 0 && y < boardHeight && tiles[y]) {
                    // Create the tile
                    const isSpecial = type === 'staff' || type === 'pillar' || type === 'tablets';
                    const baseType = isSpecial ? 'manna' : type; // Use manna as base for special tiles
                    
                    const tile = TileModule.createTile(
                        baseType, 
                        { x, y }, 
                        isSpecial, 
                        isSpecial ? type : null
                    );
                    
                    // Replace existing tile
                    tiles[y][x] = tile;
                    
                    Debugging.info(`Debug tile placed: ${type} at (${x}, ${y})`);
                    return true;
                } else {
                    Debugging.error('Invalid tile coordinates for debug placement');
                    return false;
                }
            }
            return false;
        } catch (error) {
            Debugging.warning('Error placing debug tile', error);
            return false;
        }
    }
    
    // Return public API
    return {
        create
    };
})();

export default GameBoard;