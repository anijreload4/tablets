/**
 * Tablets & Trials: The Covenant Quest
 * Game Board Module - Core match-3 gameplay
 */

import TileModule from './tile.js';
import MatchEngine from './match-engine.js';
import ErrorHandler from '../services/error-handler.js';
import Debugging from '../utils/debugging.js';
import AudioManager from '../audio/audio-manager.js';

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
                throw new ErrorHandler.GameError(
                    'Canvas element is required to create game board',
                    'BOARD_INIT_ERROR'
                );
            }
            
            // Store canvas reference
            canvas = canvasElement;
            ctx = canvas.getContext('2d');
            
            // Set board dimensions
            boardWidth = options.width || 7;
            boardHeight = options.height || 7;
            
            // Calculate tile size based on canvas dimensions
            calculateTileSize();
            
            // Initialize match engine
            matchEngine = MatchEngine.create(boardWidth, boardHeight);
            
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
                    
                    for (let y = 0; y < boardHeight; y++) {
                        for (let x = 0; x < boardWidth; x++) {
                            if (tiles[y][x]) {
                                const type = tiles[y][x].type;
                                stats[type] = (stats[type] || 0) + 1;
                            }
                        }
                    }
                    
                    return stats;
                },
                
                getTileCount: function() {
                    let count = 0;
                    for (let y = 0; y < boardHeight; y++) {
                        for (let x = 0; x < boardWidth; x++) {
                            if (tiles[y][x]) {
                                count++;
                            }
                        }
                    }
                    return count;
                },
                
                getPossibleMatchCount: function() {
                    return findValidMoves().length;
                }
            };
        } catch (error) {
            Debugging.error('Failed to create game board', error);
            throw error;
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
            matchEngine = MatchEngine.create(boardWidth, boardHeight);
            
            // Create initial board with no matches
            createInitialBoard();
            
            // Trigger callbacks
            if (eventCallbacks.onScoreChanged) {
                eventCallbacks.onScoreChanged(score);
            }
            
            if (eventCallbacks.onMovesChanged) {
                eventCallbacks.onMovesChanged(movesLeft);
            }
            
            if (eventCallbacks.onFaithMeterChanged) {
                eventCallbacks.onFaithMeterChanged(faithMeterValue);
            }
            
            isPaused = false;
            Debugging.info('Board setup complete', { width, height, distribution });
        } catch (error) {
            Debugging.error('Failed to setup board', error);
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
        // Initialize empty tiles array
        tiles = new Array(boardHeight);
        for (let y = 0; y < boardHeight; y++) {
            tiles[y] = new Array(boardWidth);
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
    }
    
    // Get random tile type based on distribution and avoid matches
    function getRandomTileType(x, y, avoidMatches = true) {
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
                if (tiles[y][x-1]?.type === type && tiles[y][x-2]?.type === type) {
                    continue; // Skip this type as it would form a horizontal match
                }
            }
            
            // Check if this type would form a vertical match
            if (y >= 2) {
                if (tiles[y-1][x]?.type === type && tiles[y-2][x]?.type === type) {
                    continue; // Skip this type as it would form a vertical match
                }
            }
            
            // This type doesn't form a match, use it
            return type;
        }
        
        // If all types would form matches, just return a random one
        return shuffledTypes[0];
    }
    
    // Ensure the board has valid moves
    function ensureValidMoves() {
        const validMoves = findValidMoves();
        
        if (validMoves.length === 0) {
            // No valid moves, reshuffle the board
            Debugging.info('No valid moves available, reshuffling board');
            shuffleBoard();
            
            // Recursive check to ensure we have valid moves after shuffle
            ensureValidMoves();
        }
    }
    
    // Find all valid moves on the current board
    function findValidMoves() {
        const validMoves = [];
        
        // Check each tile for potential moves
        for (let y = 0; y < boardHeight; y++) {
            for (let x = 0; x < boardWidth; x++) {
                // Check horizontal swap
                if (x < boardWidth - 1) {
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
                if (y < boardHeight - 1) {
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
        
        return validMoves;
    }
    
    // Shuffle the board
    function shuffleBoard() {
        // Collect all tile types
        const tileTypes = [];
        for (let y = 0; y < boardHeight; y++) {
            for (let x = 0; x < boardWidth; x++) {
                if (tiles[y][x]) {
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
                if (tiles[y][x]) {
                    tiles[y][x].type = tileTypes[index++];
                }
            }
        }
    }
    
    // Show a hint by highlighting a valid move
    function showHint() {
        if (isPaused || isSwapping || isProcessingMatches) return;
        
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
            AudioManager.playSfx('hint');
        }
    }
    
    // Clear any active hint
    function clearHint() {
        if (hintTimer) {
            clearTimeout(hintTimer);
            hintTimer = null;
        }
        
        // Remove hint flag from all tiles
        hintedTiles.forEach(tile => {
            tile.isHinted = false;
        });
        
        hintedTiles = [];
    }
    
    // Handle board resize
    function handleResize() {
        calculateTileSize();
        
        // Recalculate canvas size
        resizeCanvas();
    }
    
    // Calculate tile size based on canvas dimensions
    function calculateTileSize() {
        if (!canvas) return;
        
        // Resize canvas to fit container
        resizeCanvas();
        
        // Calculate tile size to fit board within canvas
        const maxTileWidth = (canvas.width - marginSize * 2) / boardWidth - marginSize;
        const maxTileHeight = (canvas.height - marginSize * 2) / boardHeight - marginSize;
        
        // Use the smaller dimension to ensure square tiles
        tileSize = Math.floor(Math.min(maxTileWidth, maxTileHeight));
        
        // Store board rect for hit testing
        const totalBoardWidth = boardWidth * (tileSize + marginSize) + marginSize;
        const totalBoardHeight = boardHeight * (tileSize + marginSize) + marginSize;
        
        const offsetX = (canvas.width - totalBoardWidth) / 2;
        const offsetY = (canvas.height - totalBoardHeight) / 2;
        
        boardRect = {
            x: offsetX,
            y: offsetY,
            width: totalBoardWidth,
            height: totalBoardHeight
        };
        
        Debugging.info('Tile size calculated', { 
            tileSize, 
            boardRect,
            canvasWidth: canvas.width,
            canvasHeight: canvas.height
        });
    }
    
    // Resize canvas to match container
    function resizeCanvas() {
        if (!canvas) return;
        
        const container = canvas.parentElement;
        if (!container) return;
        
        // Set canvas size to match container
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        
        // Update board rect
        boardRect = null;
    }
    
    // Add event listeners to the canvas
    function addEventListeners() {
        if (!canvas) return;
        
        // Mouse events
        canvas.addEventListener('mousedown', handlePointerDown);
        canvas.addEventListener('mousemove', handlePointerMove);
        canvas.addEventListener('mouseup', handlePointerUp);
        
        // Touch events
        canvas.addEventListener('touchstart', handleTouchStart);
        canvas.addEventListener('touchmove', handleTouchMove);
        canvas.addEventListener('touchend', handleTouchEnd);
    }
    
    // Handle mouse down event
    function handlePointerDown(e) {
        if (isPaused || isSwapping || isProcessingMatches) return;
        
        const { x, y } = getPointerPosition(e);
        const tilePos = getTileAtPosition(x, y);
        
        if (tilePos) {
            selectedTile = tiles[tilePos.y][tilePos.x];
            selectedTile.isSelected = true;
            
            // Clear any hint
            clearHint();
            
            // Play select sound
            AudioManager.playSfx('tile-select');
        }
    }
    
    // Handle mouse move event
    function handlePointerMove(e) {
        if (!selectedTile || isPaused || isSwapping || isProcessingMatches) return;
        
        const { x, y } = getPointerPosition(e);
        const tilePos = getTileAtPosition(x, y);
        
        if (tilePos && (tilePos.x !== selectedTile.position.x || tilePos.y !== selectedTile.position.y)) {
            // Only allow swaps with adjacent tiles
            if (isAdjacent(selectedTile.position, tilePos)) {
                const targetTile = tiles[tilePos.y][tilePos.x];
                swapTiles(selectedTile, targetTile);
                selectedTile = null;
            }
        }
    }
    
    // Handle mouse up event
    function handlePointerUp() {
        if (selectedTile) {
            selectedTile.isSelected = false;
            selectedTile = null;
        }
    }
    
    // Handle touch start event
    function handleTouchStart(e) {
        e.preventDefault(); // Prevent scrolling
        
        if (isPaused || isSwapping || isProcessingMatches) return;
        
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            const { x, y } = getPointerPosition(touch);
            const tilePos = getTileAtPosition(x, y);
            
            if (tilePos) {
                selectedTile = tiles[tilePos.y][tilePos.x];
                selectedTile.isSelected = true;
                
                // Clear any hint
                clearHint();
                
                // Play select sound
                AudioManager.playSfx('tile-select');
            }
        }
    }
    
    // Handle touch move event
    function handleTouchMove(e) {
        e.preventDefault(); // Prevent scrolling
        
        if (!selectedTile || isPaused || isSwapping || isProcessingMatches) return;
        
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            const { x, y } = getPointerPosition(touch);
            const tilePos = getTileAtPosition(x, y);
            
            if (tilePos && (tilePos.x !== selectedTile.position.x || tilePos.y !== selectedTile.position.y)) {
                // Only allow swaps with adjacent tiles
                if (isAdjacent(selectedTile.position, tilePos)) {
                    const targetTile = tiles[tilePos.y][tilePos.x];
                    swapTiles(selectedTile, targetTile);
                    selectedTile = null;
                }
            }
        }
    }
    
    // Handle touch end event
    function handleTouchEnd(e) {
        e.preventDefault(); // Prevent default behavior
        
        if (selectedTile) {
            selectedTile.isSelected = false;
            selectedTile = null;
        }
    }
    
    // Get pointer position relative to canvas
    function getPointerPosition(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }
    
    // Get the tile at a given position
    function getTileAtPosition(x, y) {
        if (!boardRect) {
            calculateTileSize();
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
        
        return null;
    }
    
    // Check if two positions are adjacent
    function isAdjacent(pos1, pos2) {
        return (
            (Math.abs(pos1.x - pos2.x) === 1 && pos1.y === pos2.y) ||
            (Math.abs(pos1.y - pos2.y) === 1 && pos1.x === pos2.x)
        );
    }
    
    // Swap two tiles
    function swapTiles(tile1, tile2) {
        // Mark as swapping to prevent further interaction
        isSwapping = true;
        
        // Reset selected state
        tile1.isSelected = false;
        
        // Set swapping animation state
        tile1.isMoving = true;
        tile2.isMoving = true;
        
        // Play swap sound
        AudioManager.playSfx('tile-swap');
        
        // Wait for animation to complete
        setTimeout(() => {
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
                    eventCallbacks.onMovesChanged(movesLeft);
                }
                
                // Reset moving state
                tile1.isMoving = false;
                tile2.isMoving = false;
                
                // Check for level completion
                checkLevelCompletion();
            } else {
                // No matches, swap back
                setTimeout(() => {
                    // Play failed swap sound
                    AudioManager.playSfx('tile-swap-fail');
                    
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
                }, 200);
            }
        }, 200);
    }
    
    // Process matches
    function processMatches(matches) {
        isProcessingMatches = true;
        
        // Mark matched tiles
        matches.forEach(match => {
            match.tiles.forEach(tilePos => {
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
            AudioManager.playSfx('match-multiple');
        } else {
            const matchSize = matches[0].tiles.length;
            if (matchSize >= 5) {
                AudioManager.playSfx('match-five');
            } else if (matchSize === 4) {
                AudioManager.playSfx('match-four');
            } else {
                AudioManager.playSfx('match-three');
            }
        }
        
        // Calculate score
        let matchScore = 0;
        let totalTiles = 0;
        
        matches.forEach(match => {
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
            eventCallbacks.onScoreChanged(score);
        }
        
        if (eventCallbacks.onFaithMeterChanged) {
            eventCallbacks.onFaithMeterChanged(faithMeterValue);
        }
        
        // Show score popup
        showScorePopup(matchScore, matches[0].tiles[0]);
        
        // Wait for animation, then remove matched tiles
        setTimeout(() => {
            // Check for completed objectives
            updateObjectives(matches);
            
            // Remove matched tiles
            removeMatchedTiles();
            
            // Wait for tiles to disappear, then cascade and refill
            setTimeout(() => {
                cascadeAndRefill();
            }, 300);
        }, 500);
    }
    
    // Remove matched tiles
    function removeMatchedTiles() {
        for (let y = 0; y < boardHeight; y++) {
            for (let x = 0; x < boardWidth; x++) {
                if (tiles[y][x] && tiles[y][x].isMatched) {
                    tiles[y][x] = null;
                }
            }
        }
    }
    
    // Cascade tiles down and refill empty spaces
    function cascadeAndRefill() {
        // Move tiles down to fill empty spaces
        for (let x = 0; x < boardWidth; x++) {
            let emptySpaces = 0;
            
            // Start from the bottom and move up
            for (let y = boardHeight - 1; y >= 0; y--) {
                if (!tiles[y][x]) {
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
                if (!tiles[y][x]) {
                    // Create a new tile
                    const tileType = getRandomTileType(x, y, false);
                    const tile = TileModule.createTile(tileType, { x, y });
                    tile.isNew = true;
                    tiles[y][x] = tile;
                }
            }
        }
        
        // Play cascade sound
        AudioManager.playSfx('tile-cascade');
        
        // Wait for tiles to finish moving, then check for new matches
        setTimeout(() => {
            // Reset movement state
            for (let y = 0; y < boardHeight; y++) {
                for (let x = 0; x < boardWidth; x++) {
                    if (tiles[y][x]) {
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
                            eventCallbacks.onNoMoreMoves();
                        }
                    }
                }
            }
        }, 500);
    }
    
    // Reshuffle the board when no valid moves are available
    function reshuffleBoard() {
        // Notify user
        Debugging.info('No valid moves available, reshuffling board');
        
        // Play reshuffle sound
        AudioManager.playSfx('board-shuffle');
        
        // Mark all tiles as moving
        for (let y = 0; y < boardHeight; y++) {
            for (let x = 0; x < boardWidth; x++) {
                if (tiles[y][x]) {
                    tiles[y][x].isMoving = true;
                }
            }
        }
        
        // Wait for animation
        setTimeout(() => {
            // Shuffle the board
            shuffleBoard();
            
            // Reset movement state
            for (let y = 0; y < boardHeight; y++) {
                for (let x = 0; x < boardWidth; x++) {
                    if (tiles[y][x]) {
                        tiles[y][x].isMoving = false;
                    }
                }
            }
            
            // End processing
            isSwapping = false;
            isProcessingMatches = false;
        }, 500);
    }
    
    // Create a special tile based on match pattern
    function createSpecialTile(match) {
        // Determine special tile type
        let specialType = null;
        
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
            
            // Create the special tile
            const specialTile = TileModule.createTile(match.type, { x: pos.x, y: pos.y }, true, specialType);
            tiles[pos.y][pos.x] = specialTile;
            
            // Play special tile creation sound
            AudioManager.playSfx('special-tile-create');
            
            // Trigger callback
            if (eventCallbacks.onSpecialTileCreated) {
                eventCallbacks.onSpecialTileCreated(specialType, pos);
            }
            
            Debugging.info(`Created special tile: ${specialType} at (${pos.x}, ${pos.y})`);
        }
    }
    
    // Activate a special tile's power
    function activateSpecialTile(tile, match) {
        const x = tile.position.x;
        const y = tile.position.y;
        
        // Different effects based on special tile type
        if (tile.specialType === 'staff') {
            // Staff of Moses clears horizontal row
            for (let i = 0; i < boardWidth; i++) {
                if (tiles[y][i] && !tiles[y][i].isMatched) {
                    tiles[y][i].isMatched = true;
                    match.tiles.push({ x: i, y: y });
                }
            }
            
            // Play staff activation sound
            AudioManager.playSfx('staff-activate');
            
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
                if (tiles[i][x] && !tiles[i][x].isMatched) {
                    tiles[i][x].isMatched = true;
                    match.tiles.push({ x: x, y: i });
                }
            }
            
            // Play pillar activation sound
            AudioManager.playSfx('pillar-activate');
            
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
                    if (tiles[i][j] && !tiles[i][j].isMatched) {
                        tiles[i][j].isMatched = true;
                        match.tiles.push({ x: j, y: i });
                    }
                }
            }
            
            // Play tablets activation sound
            AudioManager.playSfx('tablets-activate');
            
            // Add special effect
            specialEffects.push({
                type: 'tablets',
                x: x,
                y: y,
                duration: 1000,
                startTime: Date.now()
            });
        }
    }
    
    // Activate faith power
    function activateFaithPower(powerType) {
        if (isPaused || isSwapping || isProcessingMatches) return;
        
        isProcessingMatches = true;
        
        // Play power activation sound
        AudioManager.playSfx('faith-power-activate');
        
        if (powerType === 'redSeaParting') {
            // Red Sea Parting clears 2-3 random rows
            const rowsToMatch = Math.floor(Math.random() * 2) + 2; // 2-3 rows
            const startRow = Math.floor(Math.random() * (boardHeight - rowsToMatch));
            
            const powerMatches = [];
            
            for (let i = 0; i < rowsToMatch; i++) {
                const y = startRow + i;
                const rowMatch = { tiles: [], type: 'power', pattern: 'row' };
                
                for (let x = 0; x < boardWidth; x++) {
                    if (tiles[y][x]) {
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
                // Convert random tiles to manna
                for (let i = 0; i < tilesToConvert; i++) {
                    let x, y;
                    let attempts = 0;
                    
                    do {
                        x = Math.floor(Math.random() * boardWidth);
                        y = Math.floor(Math.random() * boardHeight);
                        attempts++;
                    } while (convertedPositions.includes(`${x},${y}`) && attempts < 50);
                    
                    if (attempts < 50 && tiles[y][x]) {
                        tiles[y][x].type = 'manna';
                        tiles[y][x].isMoving = true;
                        convertedPositions.push(`${x},${y}`);
                    }
                }
                
                // Reset movement state
                setTimeout(() => {
                    for (let y = 0; y < boardHeight; y++) {
                        for (let x = 0; x < boardWidth; x++) {
                            if (tiles[y][x]) {
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
                    // Mark matched tiles
                    matches.forEach(match => {
                        match.tiles.forEach(tilePos => {
                            const tile = tiles[tilePos.y][tilePos.x];
                            tile.isMatched = true;
                        });
                    });
                    
                    // Update score and faith meter
                    score += doubledScore;
                    
                    if (eventCallbacks.onScoreChanged) {
                        eventCallbacks.onScoreChanged(score);
                    }
                    
                    // Show score popup
                    showScorePopup(doubledScore, matches[0].tiles[0], true);
                    
                    // Continue with match processing
                    setTimeout(() => {
                        removeMatchedTiles();
                        setTimeout(() => {
                            cascadeAndRefill();
                        }, 300);
                    }, 500);
                }, 1000);
            } else {
                // No matches to double, just end processing
                setTimeout(() => {
                    isProcessingMatches = false;
                }, 2000);
            }
        }
    }
    
    // Calculate score for matches (without applying it)
    function calculateMatchScore(matches) {
        let matchScore = 0;
        
        matches.forEach(match => {
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
        
        return matchScore;
    }
    
    // Show score popup
    function showScorePopup(points, tilePos, isDoubled = false) {
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
    }
    
    // Update objectives based on matches
    function updateObjectives(matches) {
        // For now, just a placeholder for future implementation
        if (eventCallbacks.onObjectiveProgress) {
            eventCallbacks.onObjectiveProgress(matches);
        }
    }
    
    // Check if level is complete
    function checkLevelCompletion() {
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
                    eventCallbacks.onLevelComplete(stars, score);
                }, 1000);
            }
        }
    }
    
    // Pause the game
    function pause() {
        isPaused = true;
        cancelAnimationFrame(animationFrameId);
    }
    
    // Resume the game
    function resume() {
        if (isPaused) {
            isPaused = false;
            requestAnimationFrame(renderLoop);
        }
    }
    
    // Start the render loop
    function startRenderLoop() {
        requestAnimationFrame(renderLoop);
    }
    
    // Main render loop
    function renderLoop(timestamp) {
        if (!isPaused) {
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Render board
            renderBoard();
            
            // Render special effects
            renderSpecialEffects(timestamp);
            
            // Request next frame
            animationFrameId = requestAnimationFrame(renderLoop);
        }
    }
    
    // Render the game board
    function renderBoard() {
        if (!boardRect) {
            calculateTileSize();
        }
        
        // Draw board background
        ctx.fillStyle = '#1A365D'; // Scripture blue
        ctx.fillRect(boardRect.x, boardRect.y, boardRect.width, boardRect.height);
        
        // Draw tiles
        for (let y = 0; y < boardHeight; y++) {
            for (let x = 0; x < boardWidth; x++) {
                const tile = tiles[y][x];
                
                if (tile) {
                    // Calculate tile position
                    const tileX = boardRect.x + marginSize + x * (tileSize + marginSize);
                    const tileY = boardRect.y + marginSize + y * (tileSize + marginSize);
                    
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
        }
    }
    
    // Render special effects
    function renderSpecialEffects(timestamp) {
        // Update and render all active effects
        specialEffects = specialEffects.filter(effect => {
            const elapsedTime = timestamp - effect.startTime;
            const progress = Math.min(1, elapsedTime / effect.duration);
            
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
    }
    
    // Render score popup effect
    function renderScorePopup(effect, progress) {
        // Calculate position with upward movement
        const y = effect.y - progress * 40;
        
        // Calculate opacity (fade out near the end)
        const opacity = progress > 0.7 ? 1 - (progress - 0.7) / 0.3 : 1;
        
        // Draw score text
        ctx.font = 'bold 20px Covenant';
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
    }
    
    // Render staff effect
    function renderStaffEffect(effect, progress) {
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
    }
    
    // Render pillar effect
    function renderPillarEffect(effect, progress) {
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
    }
    // Render tablets effect
    function renderTabletsEffect(effect, progress) {
        const x = boardRect.x + marginSize + effect.x * (tileSize + marginSize) - tileSize;
        const y = boardRect.y + marginSize + effect.y * (tileSize + marginSize) - tileSize;
        const size = tileSize * 3;
        
        // Create radial gradient
        const centerX = x + size / 2;
        const centerY = y + size / 2;
        const radius = size / 2 * (0.5 + progress * 0.5);
        
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
    }
    
    // Render Red Sea effect
    function renderRedSeaEffect(effect, progress) {
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
    }
    
    // Render Manna Shower effect
    function renderMannaShowerEffect(effect, progress) {
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
    }
    
    // Get color for a tile based on its type
    function getTileColor(tile) {
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
    }
    
    // Set event callback
    function setEventCallback(event, callback) {
        if (eventCallbacks.hasOwnProperty(event)) {
            eventCallbacks[event] = callback;
        }
    }
    
    // Clear the board
    function clearBoard() {
        if (tiles) {
            tiles = [];
        }
        
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        
        if (hintTimer) {
            clearTimeout(hintTimer);
            hintTimer = null;
        }
        
        specialEffects = [];
        selectedTile = null;
        isSwapping = false;
        isProcessingMatches = false;
    }
    
    // Debug function to place a specific tile
    function debugPlaceTile(type, x, y) {
        if (Debugging.isDebugMode()) {
            // If position not specified, use center of board
            if (x === undefined || y === undefined) {
                x = Math.floor(boardWidth / 2);
                y = Math.floor(boardHeight / 2);
            }
            
            // Ensure coordinates are valid
            if (x >= 0 && x < boardWidth && y >= 0 && y < boardHeight) {
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
            } else {
                Debugging.error('Invalid tile coordinates for debug placement');
            }
        }
    }
    
    // Return public API
    return {
        create
    };
})();

export default GameBoard;