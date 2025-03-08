/**
 * Tablets & Trials: The Covenant Quest
 * Tile Module - Manages individual tile objects
 */

// Tile Module using Module Pattern
const TileModule = (function() {
    // Private variables
    const tileTypes = ['manna', 'water', 'fire', 'stone', 'quail'];
    const specialTileTypes = ['staff', 'pillar', 'tablets'];
    
    // Private methods
    function generateTileId() {
        return 'tile_' + Math.random().toString(36).substr(2, 9);
    }
    
    // Publicly exposed API
    return {
        // Create a new tile
        createTile: function(type, position, isSpecial = false, specialType = null) {
            if (!tileTypes.includes(type) && !specialTileTypes.includes(type)) {
                throw new Error(`Invalid tile type: ${type}`);
            }
            
            if (isSpecial && specialType && !specialTileTypes.includes(specialType)) {
                throw new Error(`Invalid special tile type: ${specialType}`);
            }
            
            return {
                id: generateTileId(),
                type: type,
                position: { ...position },
                isSpecial: isSpecial,
                specialType: specialType,
                isMatched: false,
                isMoving: false,
                isSelected: false,
                isHinted: false,
                isNew: false
            };
        },
        
        // Get list of available tile types
        getTileTypes: function() {
            return [...tileTypes];
        },
        
        // Get list of special tile types
        getSpecialTileTypes: function() {
            return [...specialTileTypes];
        },
        
        // Check if a tile can match with another
        canMatch: function(tile1, tile2) {
            return tile1.type === tile2.type && 
                   !tile1.isMoving && !tile2.isMoving &&
                   !tile1.isMatched && !tile2.isMatched;
        },
        
        // Get image asset path for a tile
        getTileImagePath: function(tile) {
            if (tile.isSpecial && tile.specialType) {
                return `assets/images/tiles/${tile.specialType}.svg`;
            }
            
            return `assets/images/tiles/${tile.type}.svg`;
        },
        
        // Get tile color based on type
        getTileColor: function(tile) {
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
        },
        
        // Clone a tile
        cloneTile: function(tile) {
            return {
                ...tile,
                position: { ...tile.position } // Deep copy position
            };
        }
    };
})();

export default TileModule;