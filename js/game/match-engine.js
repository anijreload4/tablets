/**
 * Tablets & Trials: The Covenant Quest
 * Match Engine - Detects matches on the game board
 */

import Debugging from '../utils/debugging.js';

// Match Engine Module
const MatchEngine = (function() {
    // Private variables
    let boardWidth = 0;
    let boardHeight = 0;
    
    // Create and initialize the match engine
    function create(width, height) {
        boardWidth = width;
        boardHeight = height;
        
        return {
            findMatches,
            findPotentialMatches,
            detectPatterns
        };
    }
    
    // Find all matches on the board
    function findMatches(board) {
        const matches = [];
        
        // Find horizontal matches
        const horizontalMatches = findHorizontalMatches(board);
        matches.push(...horizontalMatches);
        
        // Find vertical matches
        const verticalMatches = findVerticalMatches(board);
        matches.push(...verticalMatches);
        
        // Detect special patterns (L, T shapes)
        const patternMatches = detectPatterns(board, horizontalMatches, verticalMatches);
        matches.push(...patternMatches);
        
        return matches;
    }
    
    // Find horizontal matches (3 or more in a row)
    function findHorizontalMatches(board) {
        const matches = [];
        
        for (let y = 0; y < boardHeight; y++) {
            let matchLength = 1;
            let matchType = null;
            let matchStart = 0;
            
            for (let x = 0; x < boardWidth; x++) {
                const currentTile = board[y][x];
                const nextTile = x < boardWidth - 1 ? board[y][x + 1] : null;
                
                if (!currentTile) {
                    // Skip empty positions
                    matchLength = 1;
                    matchType = null;
                    matchStart = x + 1;
                    continue;
                }
                
                if (!matchType) {
                    // Start a new potential match
                    matchType = currentTile.type;
                    matchStart = x;
                    matchLength = 1;
                } else if (nextTile && nextTile.type === matchType) {
                    // Continue the match
                    matchLength++;
                } else {
                    // Check if we have a match (3+ tiles)
                    if (matchLength >= 3) {
                        const matchTiles = [];
                        for (let i = 0; i < matchLength; i++) {
                            matchTiles.push({ x: matchStart + i, y });
                        }
                        
                        matches.push({
                            type: matchType,
                            direction: 'horizontal',
                            tiles: matchTiles,
                            length: matchLength
                        });
                    }
                    
                    // Start a new potential match
                    matchType = currentTile.type;
                    matchStart = x;
                    matchLength = 1;
                }
            }
            
            // Check for match at the end of the row
            if (matchLength >= 3) {
                const matchTiles = [];
                for (let i = 0; i < matchLength; i++) {
                    matchTiles.push({ x: matchStart + i, y });
                }
                
                matches.push({
                    type: matchType,
                    direction: 'horizontal',
                    tiles: matchTiles,
                    length: matchLength
                });
            }
        }
        
        return matches;
    }
    
    // Find vertical matches (3 or more in a column)
    function findVerticalMatches(board) {
        const matches = [];
        
        for (let x = 0; x < boardWidth; x++) {
            let matchLength = 1;
            let matchType = null;
            let matchStart = 0;
            
            for (let y = 0; y < boardHeight; y++) {
                const currentTile = board[y][x];
                const nextTile = y < boardHeight - 1 ? board[y + 1][x] : null;
                
                if (!currentTile) {
                    // Skip empty positions
                    matchLength = 1;
                    matchType = null;
                    matchStart = y + 1;
                    continue;
                }
                
                if (!matchType) {
                    // Start a new potential match
                    matchType = currentTile.type;
                    matchStart = y;
                    matchLength = 1;
                } else if (nextTile && nextTile.type === matchType) {
                    // Continue the match
                    matchLength++;
                } else {
                    // Check if we have a match (3+ tiles)
                    if (matchLength >= 3) {
                        const matchTiles = [];
                        for (let i = 0; i < matchLength; i++) {
                            matchTiles.push({ x, y: matchStart + i });
                        }
                        
                        matches.push({
                            type: matchType,
                            direction: 'vertical',
                            tiles: matchTiles,
                            length: matchLength
                        });
                    }
                    
                    // Start a new potential match
                    matchType = currentTile.type;
                    matchStart = y;
                    matchLength = 1;
                }
            }
            
            // Check for match at the end of the column
            if (matchLength >= 3) {
                const matchTiles = [];
                for (let i = 0; i < matchLength; i++) {
                    matchTiles.push({ x, y: matchStart + i });
                }
                
                matches.push({
                    type: matchType,
                    direction: 'vertical',
                    tiles: matchTiles,
                    length: matchLength
                });
            }
        }
        
        return matches;
    }
    
    // Detect special patterns like L and T shapes
    function detectPatterns(board, horizontalMatches, verticalMatches) {
        const patternMatches = [];
        
        // Create a map of tile positions for easy lookup
        const horizontalMatchMap = createMatchMap(horizontalMatches);
        const verticalMatchMap = createMatchMap(verticalMatches);
        
        // Detect L shapes (intersecting horizontal and vertical matches)
        for (const hMatch of horizontalMatches) {
            for (const vMatch of verticalMatches) {
                // Check if the matches share the same tile type
                if (hMatch.type !== vMatch.type) continue;
                
                // Check for intersection points
                for (const hTile of hMatch.tiles) {
                    for (const vTile of vMatch.tiles) {
                        if (hTile.x === vTile.x && hTile.y === vTile.y) {
                            // Found an L shape at intersection point
                            const lShapeTiles = new Set();
                            
                            // Add all tiles from both matches
                            [...hMatch.tiles, ...vMatch.tiles].forEach(tile => {
                                lShapeTiles.add(`${tile.x},${tile.y}`);
                            });
                            
                            // Convert back to array of positions
                            const tilePositions = Array.from(lShapeTiles).map(pos => {
                                const [x, y] = pos.split(',').map(Number);
                                return { x, y };
                            });
                            
                            patternMatches.push({
                                type: hMatch.type,
                                pattern: 'L',
                                tiles: tilePositions,
                                length: tilePositions.length
                            });
                            
                            // Skip to next horizontal match after finding an L shape
                            break;
                        }
                    }
                }
            }
        }
        
        // Detect T shapes (one match through the middle of another)
        detectTShapes(horizontalMatches, verticalMatches, patternMatches);
        
        return patternMatches;
    }
    
    // Detect T-shaped patterns
    function detectTShapes(horizontalMatches, verticalMatches, patternMatches) {
        // Check horizontal match through middle of vertical match
        for (const hMatch of horizontalMatches) {
            for (const vMatch of verticalMatches) {
                // Check if the matches share the same tile type
                if (hMatch.type !== vMatch.type) continue;
                
                // Check if horizontal match passes through the middle of vertical match
                const vStartY = Math.min(...vMatch.tiles.map(t => t.y));
                const vEndY = Math.max(...vMatch.tiles.map(t => t.y));
                const vX = vMatch.tiles[0].x;
                
                // Horizontal match must pass through the vertical match
                const horizontalContainsVerticalX = hMatch.tiles.some(t => t.x === vX);
                
                if (horizontalContainsVerticalX) {
                    const hY = hMatch.tiles[0].y;
                    
                    // Check if the horizontal match passes through the middle (not at the ends)
                    if (hY > vStartY && hY < vEndY) {
                        // Found a T shape
                        const tShapeTiles = new Set();
                        
                        // Add all tiles from both matches
                        [...hMatch.tiles, ...vMatch.tiles].forEach(tile => {
                            tShapeTiles.add(`${tile.x},${tile.y}`);
                        });
                        
                        // Convert back to array of positions
                        const tilePositions = Array.from(tShapeTiles).map(pos => {
                            const [x, y] = pos.split(',').map(Number);
                            return { x, y };
                        });
                        
                        patternMatches.push({
                            type: hMatch.type,
                            pattern: 'T',
                            tiles: tilePositions,
                            length: tilePositions.length
                        });
                    }
                }
            }
        }
        
        // Check vertical match through middle of horizontal match
        for (const vMatch of verticalMatches) {
            for (const hMatch of horizontalMatches) {
                // Check if the matches share the same tile type
                if (vMatch.type !== hMatch.type) continue;
                
                // Check if vertical match passes through the middle of horizontal match
                const hStartX = Math.min(...hMatch.tiles.map(t => t.x));
                const hEndX = Math.max(...hMatch.tiles.map(t => t.x));
                const hY = hMatch.tiles[0].y;
                
                // Vertical match must pass through the horizontal match
                const verticalContainsHorizontalY = vMatch.tiles.some(t => t.y === hY);
                
                if (verticalContainsHorizontalY) {
                    const vX = vMatch.tiles[0].x;
                    
                    // Check if the vertical match passes through the middle (not at the ends)
                    if (vX > hStartX && vX < hEndX) {
                        // Found a T shape (rotated)
                        const tShapeTiles = new Set();
                        
                        // Add all tiles from both matches
                        [...vMatch.tiles, ...hMatch.tiles].forEach(tile => {
                            tShapeTiles.add(`${tile.x},${tile.y}`);
                        });
                        
                        // Convert back to array of positions
                        const tilePositions = Array.from(tShapeTiles).map(pos => {
                            const [x, y] = pos.split(',').map(Number);
                            return { x, y };
                        });
                        
                        patternMatches.push({
                            type: vMatch.type,
                            pattern: 'T',
                            tiles: tilePositions,
                            length: tilePositions.length
                        });
                    }
                }
            }
        }
    }
    
    // Create a map of matched tile positions for easy lookup
    function createMatchMap(matches) {
        const map = {};
        
        matches.forEach(match => {
            match.tiles.forEach(tile => {
                const key = `${tile.x},${tile.y}`;
                if (!map[key]) {
                    map[key] = [];
                }
                map[key].push(match);
            });
        });
        
        return map;
    }
    
    // Find potential matches (for hint system)
    function findPotentialMatches(board) {
        const potentialMatches = [];
        
        // Check horizontal potential matches
        for (let y = 0; y < boardHeight; y++) {
            for (let x = 0; x < boardWidth - 1; x++) {
                // Skip empty spaces
                if (!board[y][x] || !board[y][x + 1]) continue;
                
                // Swap tiles
                const temp = board[y][x];
                board[y][x] = board[y][x + 1];
                board[y][x + 1] = temp;
                
                // Check for matches after swap
                const matches = findMatches(board);
                
                // Swap back
                board[y][x + 1] = board[y][x];
                board[y][x] = temp;
                
                // If matches found, add to potential matches
                if (matches.length > 0) {
                    potentialMatches.push({
                        from: { x, y },
                        to: { x: x + 1, y },
                        matches
                    });
                }
            }
        }
        
        // Check vertical potential matches
        for (let x = 0; x < boardWidth; x++) {
            for (let y = 0; y < boardHeight - 1; y++) {
                // Skip empty spaces
                if (!board[y][x] || !board[y + 1][x]) continue;
                
                // Swap tiles
                const temp = board[y][x];
                board[y][x] = board[y + 1][x];
                board[y + 1][x] = temp;
                
                // Check for matches after swap
                const matches = findMatches(board);
                
                // Swap back
                board[y + 1][x] = board[y][x];
                board[y][x] = temp;
                
                // If matches found, add to potential matches
                if (matches.length > 0) {
                    potentialMatches.push({
                        from: { x, y },
                        to: { x, y: y + 1 },
                        matches
                    });
                }
            }
        }
        
        return potentialMatches;
    }
    
    // Public API
    return {
        create
    };
})();

export default MatchEngine;