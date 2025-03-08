/**
 * Tablets & Trials: The Covenant Quest
 * Fallback Assets - Provides fallbacks when assets fail to load
 */

import Debugging from '../utils/debugging.js';

// Fallback Assets Module
const FallbackAssets = (function() {
    // Predefined placeholder assets as data URIs (works offline)
    const placeholders = {
        tile: {
            manna: 'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><circle cx="32" cy="32" r="24" fill="%23F5F5DC" stroke="%23000" stroke-width="2"/><text x="32" y="37" text-anchor="middle" font-family="Arial" font-size="12">Manna</text></svg>',
            water: 'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><circle cx="32" cy="32" r="24" fill="%234682B4" stroke="%23000" stroke-width="2"/><text x="32" y="37" text-anchor="middle" font-family="Arial" font-size="12" fill="white">Water</text></svg>',
            fire: 'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><circle cx="32" cy="32" r="24" fill="%23C41E3A" stroke="%23000" stroke-width="2"/><text x="32" y="37" text-anchor="middle" font-family="Arial" font-size="12" fill="white">Fire</text></svg>',
            stone: 'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><circle cx="32" cy="32" r="24" fill="%23696969" stroke="%23000" stroke-width="2"/><text x="32" y="37" text-anchor="middle" font-family="Arial" font-size="12" fill="white">Stone</text></svg>',
            quail: 'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><circle cx="32" cy="32" r="24" fill="%238B4513" stroke="%23000" stroke-width="2"/><text x="32" y="37" text-anchor="middle" font-family="Arial" font-size="12" fill="white">Quail</text></svg>',
            staff: 'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><circle cx="32" cy="32" r="24" fill="%23D4AF37" stroke="%23000" stroke-width="2"/><text x="32" y="37" text-anchor="middle" font-family="Arial" font-size="10" fill="black">Staff</text></svg>',
            pillar: 'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><circle cx="32" cy="32" r="24" fill="%23FF8C00" stroke="%23000" stroke-width="2"/><text x="32" y="37" text-anchor="middle" font-family="Arial" font-size="10" fill="black">Pillar</text></svg>',
            tablets: 'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><circle cx="32" cy="32" r="24" fill="%23DCDCDC" stroke="%23000" stroke-width="2"/><text x="32" y="37" text-anchor="middle" font-family="Arial" font-size="9" fill="black">Tablets</text></svg>',
            default: 'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><circle cx="32" cy="32" r="24" fill="%23CCC" stroke="%23000" stroke-width="2"/><text x="32" y="37" text-anchor="middle" font-family="Arial" font-size="12">Tile</text></svg>'
        },
        image: {
            'dialogue-bg': 'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="500" height="150" viewBox="0 0 500 150"><rect width="500" height="150" fill="%231A365D" rx="10" ry="10"/><text x="250" y="80" text-anchor="middle" font-family="Arial" font-size="16" fill="white">Dialogue Background</text></svg>',
            'moses-normal': 'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><circle cx="64" cy="64" r="60" fill="%23DEB887" stroke="%23000" stroke-width="2"/><text x="64" y="70" text-anchor="middle" font-family="Arial" font-size="16">Moses</text></svg>',
            'moses-concerned': 'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><circle cx="64" cy="64" r="60" fill="%23DEB887" stroke="%23000" stroke-width="2"/><text x="64" y="70" text-anchor="middle" font-family="Arial" font-size="16">Moses</text></svg>',
            'moses-commanding': 'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><circle cx="64" cy="64" r="60" fill="%23DEB887" stroke="%23000" stroke-width="2"/><text x="64" y="70" text-anchor="middle" font-family="Arial" font-size="16">Moses</text></svg>',
            'aaron-normal': 'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><circle cx="64" cy="64" r="60" fill="%23DEB887" stroke="%23000" stroke-width="2"/><text x="64" y="70" text-anchor="middle" font-family="Arial" font-size="16">Aaron</text></svg>',
            'logo': 'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"><rect width="400" height="200" fill="%231A365D" rx="10" ry="10"/><text x="200" y="100" text-anchor="middle" font-family="Arial" font-size="24" fill="white">Tablets & Trials</text></svg>',
            'button-bg': 'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="50" viewBox="0 0 200 50"><rect width="200" height="50" fill="%23696969" rx="5" ry="5"/></svg>',
            'fallback-image': 'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23CCCCCC"/><text x="100" y="100" text-anchor="middle" font-family="Arial" font-size="16">Image Not Found</text></svg>',
            'tile-manna': 'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><circle cx="32" cy="32" r="24" fill="%23F5F5DC" stroke="%23000" stroke-width="2"/><text x="32" y="37" text-anchor="middle" font-family="Arial" font-size="12">Manna</text></svg>',
            'tile-water': 'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><circle cx="32" cy="32" r="24" fill="%234682B4" stroke="%23000" stroke-width="2"/><text x="32" y="37" text-anchor="middle" font-family="Arial" font-size="12" fill="white">Water</text></svg>',
            'tile-fire': 'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><circle cx="32" cy="32" r="24" fill="%23C41E3A" stroke="%23000" stroke-width="2"/><text x="32" y="37" text-anchor="middle" font-family="Arial" font-size="12" fill="white">Fire</text></svg>',
            'tile-stone': 'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><circle cx="32" cy="32" r="24" fill="%23696969" stroke="%23000" stroke-width="2"/><text x="32" y="37" text-anchor="middle" font-family="Arial" font-size="12" fill="white">Stone</text></svg>',
            'tile-quail': 'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><circle cx="32" cy="32" r="24" fill="%238B4513" stroke="%23000" stroke-width="2"/><text x="32" y="37" text-anchor="middle" font-family="Arial" font-size="12" fill="white">Quail</text></svg>',
            default: 'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23CCCCCC"/><text x="100" y="100" text-anchor="middle" font-family="Arial" font-size="16">Image Not Found</text></svg>'
        },
        character: {
            moses: 'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><circle cx="64" cy="64" r="60" fill="%23DEB887" stroke="%23000" stroke-width="2"/><text x="64" y="70" text-anchor="middle" font-family="Arial" font-size="16">Moses</text></svg>',
            aaron: 'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><circle cx="64" cy="64" r="60" fill="%23DEB887" stroke="%23000" stroke-width="2"/><text x="64" y="70" text-anchor="middle" font-family="Arial" font-size="16">Aaron</text></svg>',
            miriam: 'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><circle cx="64" cy="64" r="60" fill="%23DEB887" stroke="%23000" stroke-width="2"/><text x="64" y="70" text-anchor="middle" font-family="Arial" font-size="16">Miriam</text></svg>',
            pharaoh: 'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><circle cx="64" cy="64" r="60" fill="%23DEB887" stroke="%23000" stroke-width="2"/><text x="64" y="70" text-anchor="middle" font-family="Arial" font-size="16">Pharaoh</text></svg>',
            israelite: 'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><circle cx="64" cy="64" r="60" fill="%23DEB887" stroke="%23000" stroke-width="2"/><text x="64" y="70" text-anchor="middle" font-family="Arial" font-size="16">Israelite</text></svg>',
            joshua: 'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><circle cx="64" cy="64" r="60" fill="%23DEB887" stroke="%23000" stroke-width="2"/><text x="64" y="70" text-anchor="middle" font-family="Arial" font-size="16">Joshua</text></svg>',
            god: 'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><circle cx="64" cy="64" r="60" fill="%23D4AF37" stroke="%23000" stroke-width="2"/><text x="64" y="70" text-anchor="middle" font-family="Arial" font-size="16">The LORD</text></svg>',
            default: 'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><circle cx="64" cy="64" r="60" fill="%23DEB887" stroke="%23000" stroke-width="2"/><text x="64" y="70" text-anchor="middle" font-family="Arial" font-size="16">Character</text></svg>'
        },
        background: {
            exodus: 'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="%23F5F5DC"/><text x="400" y="300" text-anchor="middle" font-family="Arial" font-size="30">Exodus Background</text></svg>',
            wilderness: 'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="%23ECD9B8"/><text x="400" y="300" text-anchor="middle" font-family="Arial" font-size="30">Wilderness Background</text></svg>',
            'menu-bg': 'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="%231A365D"/><text x="400" y="300" text-anchor="middle" font-family="Arial" font-size="30" fill="white">Menu Background</text></svg>',
            default: 'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="%23F5F5DC"/><text x="400" y="300" text-anchor="middle" font-family="Arial" font-size="30">Background</text></svg>'
        },
        audio: {
            // Tiny silent audio data URI - works in all browsers
            silent: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=',
            'menu-theme': 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=',
            'button-click': 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=',
            'dialogue-appear': 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=',
            'dialogue-advance': 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=',
            'match-three': 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=',
            'tile-select': 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=',
            'tile-swap': 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=',
            'exodus-theme': 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=',
            'wilderness-theme': 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=',
            'journey-map-theme': 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=', 
            default: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA='
        }
    };
    
    // Generate a simple SVG placeholder
    function generateSVGPlaceholder(text, color = '#CCCCCC') {
        return `data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="${encodeURIComponent(color)}"/><text x="32" y="32" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="10">${encodeURIComponent(text)}</text></svg>`;
    }
    
    // Generate character placeholder
    function generateCharacterPlaceholder(name = 'Character') {
        return `data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><circle cx="64" cy="64" r="60" fill="%23DEB887" stroke="%23000" stroke-width="2"/><text x="64" y="70" text-anchor="middle" font-family="Arial" font-size="16">${encodeURIComponent(name)}</text></svg>`;
    }
    
    // Generate background placeholder
    function generateBackgroundPlaceholder(color = '#F5F5DC', label = 'Background') {
        return `data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="${encodeURIComponent(color)}"/><text x="400" y="300" text-anchor="middle" font-family="Arial" font-size="30">${encodeURIComponent(label)}</text></svg>`;
    }
    
    // Get fallback asset
    function getFallback(type, key) {
        // Special case handling
        if (type === 'image' && key && key.startsWith('tile-')) {
            // Handle tile images
            const tileType = key.replace('tile-', '');
            if (placeholders.tile[tileType]) {
                return placeholders.tile[tileType];
            }
        }
        
        // Try to match by specific key
        if (placeholders[type] && placeholders[type][key]) {
            return placeholders[type][key];
        }
        
        // Try to find a partial match for character portraits
        if (type === 'image' && key) {
            // Check if it's a character portrait (e.g., moses-normal)
            const keyParts = key.split('-');
            if (keyParts.length > 1) {
                const characterName = keyParts[0];
                if (placeholders.character[characterName]) {
                    return placeholders.character[characterName];
                }
            }
        }
        
        // Return default for this type
        if (placeholders[type] && placeholders[type].default) {
            return placeholders[type].default;
        }
        
        // Return type-specific generic fallback
        switch (type) {
            case 'tile':
                return generateSVGPlaceholder('Tile', '#CCCCCC');
            case 'image':
                return placeholders.image.default;
            case 'character':
                return generateCharacterPlaceholder('Character');
            case 'background':
                return generateBackgroundPlaceholder();
            case 'audio':
                return placeholders.audio.silent;
            default:
                // Return simplest possible fallback
                return 'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" fill="#CCCCCC"/></svg>';
        }
    }
    
    // Create a complete fallback for level assets
    function createLevelFallbacks(levelId) {
        const levelMatch = levelId.match(/([a-z]+)-(\d+)/);
        const epoch = levelMatch ? levelMatch[1] : 'default';
        const levelNum = levelMatch ? parseInt(levelMatch[2]) : 0;
        
        return {
            background: placeholders.background[epoch] || placeholders.background.default,
            tiles: { ...placeholders.tile },
            characters: { ...placeholders.character },
            audio: {
                background: placeholders.audio.silent,
                effects: {
                    match: placeholders.audio.silent,
                    special: placeholders.audio.silent,
                    complete: placeholders.audio.silent
                }
            },
            levelData: {
                id: levelId,
                name: `Level ${levelNum}: ${epoch.charAt(0).toUpperCase() + epoch.slice(1)}`,
                objectives: [
                    { type: 'score', target: 1000, description: "Score 1000 points" }
                ],
                moves: 30,
                tileDistribution: {
                    water: 20,
                    manna: 20,
                    fire: 20,
                    stone: 20,
                    quail: 20
                },
                boardSize: {
                    width: 7,
                    height: 7
                }
            }
        };
    }
    
    // Load a fallback level configuration
    function loadFallbackLevel(levelId) {
        Debugging.warning(`Loading fallback configuration for level: ${levelId}`);
        
        // Create basic level configuration
        return createLevelFallbacks(levelId);
    }
    
    // Public API
    return {
        getFallback,
        createLevelFallbacks,
        loadFallbackLevel,
        generateSVGPlaceholder,
        generateCharacterPlaceholder,
        generateBackgroundPlaceholder
    };
})();

export default FallbackAssets;