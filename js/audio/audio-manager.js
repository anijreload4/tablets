/**
 * Tablets & Trials: The Covenant Quest
 * Audio Manager - Handles game music and sound effects
 */

import ErrorHandler from '../services/error-handler.js';
import Debugging from '../utils/debugging.js';

// Audio Manager Module
const AudioManager = (function() {
    // Private variables
    let musicVolume = 0.7; // 0 to 1
    let sfxVolume = 0.8;   // 0 to 1
    let isMusicMuted = false;
    let isSfxMuted = false;
    let currentMusic = null;
    let musicElement = null;
    let isInitialized = false;
    
    // Add this to your AudioManager.js file to handle browser autoplay policies

// Add these variables at the top of your AudioManager module
let isAudioEnabled = false;
let pendingMusic = null;

// Create a function to enable audio on user interaction
function enableAudio() {
    if (isAudioEnabled) return;
    
    isAudioEnabled = true;
    
    // Try to play a silent sound to unlock audio
    try {
        const silentSound = new Audio("data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=");
        silentSound.play().then(() => {
            Debugging.info('Audio enabled by user interaction');
            
            // Play any pending music
            if (pendingMusic && !isMusicMuted) {
                const trackToPlay = pendingMusic;
                pendingMusic = null;
                playMusic(trackToPlay);
            }
        }).catch(error => {
            Debugging.warning('Failed to enable audio:', error);
            isAudioEnabled = false;
        });
    } catch (error) {
        Debugging.warning('Error enabling audio:', error);
        isAudioEnabled = false;
    }
}

// Modify your playMusic function
function playMusic(trackName) {
    // Skip if music is muted
    if (isMusicMuted) return;
    
    try {
        // Get track path
        const trackPath = musicTracks[trackName];
        if (!trackPath) {
            Debugging.warning(`Music track not found: ${trackName}`);
            return;
        }
        
        // If the same track is already playing, don't restart
        if (currentMusic === trackName && musicElement && !musicElement.paused) {
            return;
        }
        
        // If audio isn't enabled yet, store the track name for later
        if (!isAudioEnabled) {
            pendingMusic = trackName;
            Debugging.info(`Music playback of ${trackName} queued until user interaction`);
            return;
        }
        
        // Stop current music
        stopMusic();
        
        // Skip if we don't have a valid audio element
        if (!musicElement) return;
        
        // Set new track
        musicElement.src = trackPath;
        musicElement.volume = musicVolume;
        currentMusic = trackName;
        
        // Play the music
        musicElement.play().catch(error => {
            // If we get an autoplay error, queue the music for later
            if (error.name === 'NotAllowedError') {
                Debugging.info(`Music autoplay blocked: ${trackName} - will play after user interaction`);
                isAudioEnabled = false;
                pendingMusic = trackName;
                return;
            }
            
            Debugging.warning(`Failed to play music track: ${trackName}`, error);
            
            // Try to use alternative format
            const alternativeTrack = getFallbackTrack(trackPath);
            if (alternativeTrack) {
                Debugging.info(`Trying alternative track format for ${trackName}`);
                musicElement.src = alternativeTrack;
                musicElement.play().catch(e => {
                    if (e.name === 'NotAllowedError') {
                        isAudioEnabled = false;
                        pendingMusic = trackName;
                        return;
                    }
                    Debugging.error('Failed to play alternative track format', e);
                });
            }
        });
    } catch (error) {
        Debugging.error(`Error playing music track: ${trackName}`, error);
    }
}

// Similar updates to playSfx function
function playSfx(sfxName) {
    // Skip if sound effects are muted
    if (isSfxMuted) return;
    
    // If audio isn't enabled yet, don't try to play
    if (!isAudioEnabled) {
        return;
    }
    
    try {
        // Get from cache or load
        let sfx = sfxCache[sfxName];
        if (!sfx) {
            sfx = preloadSfx(sfxName);
            if (!sfx) return; // Failed to load
        }
        
        // Clone the audio to allow multiple simultaneous plays
        const sfxClone = sfx.cloneNode();
        sfxClone.volume = sfxVolume;
        
        // Play the sound
        sfxClone.play().catch(error => {
            // If autoplay is blocked, try to enable audio
            if (error.name === 'NotAllowedError') {
                isAudioEnabled = false;
                return;
            }
            
            Debugging.warning(`Failed to play sound effect: ${sfxName}`, error);
        });
        
        // Clean up when done
        sfxClone.addEventListener('ended', () => {
            sfxClone.remove();
        });
    } catch (error) {
        Debugging.error(`Error playing sound effect: ${sfxName}`, error);
    }
}

// Add event listeners to enable audio on user interaction
function setupAudioUnlock() {
    // These events should unlock audio on most browsers
    const unlockEvents = ['click', 'touchstart', 'touchend', 'keydown', 'mousedown'];
    
    const unlockAudio = () => {
        enableAudio();
        
        // Remove event listeners once audio is enabled
        if (isAudioEnabled) {
            unlockEvents.forEach(event => {
                document.removeEventListener(event, unlockAudio);
            });
            Debugging.info('Audio unlocked - removed event listeners');
        }
    };
    
    // Add event listeners
    unlockEvents.forEach(event => {
        document.addEventListener(event, unlockAudio, { once: false });
    });
    
    Debugging.info('Audio unlock listeners set up');
}

// Call this function during initialization
setupAudioUnlock();

// Replace the entire init function in js/audio/audio-manager.js with this:

// Initialize the audio manager
function init(initialMusicVolume = 0.7, initialSfxVolume = 0.8) {
    try {
        // First, ensure we have valid volume values
        musicVolume = Math.max(0, Math.min(1, Number(initialMusicVolume) || 0.7));
        sfxVolume = Math.max(0, Math.min(1, Number(initialSfxVolume) || 0.8));
        
        // Create audio element for music
        try {
            musicElement = new Audio();
            musicElement.loop = true;
            musicElement.volume = musicVolume;
            
            // Add event listeners
            document.addEventListener('visibilitychange', handleVisibilityChange);
            if (musicElement) {
                musicElement.addEventListener('error', handleMusicError);
            }
            
            // Preload common sound effects
            preloadCommonSounds();
            
            // Set up audio unlock
            setupAudioUnlock();
            
            isInitialized = true;
            console.log('Audio manager initialized');
        } catch (audioError) {
            console.warn('Audio element creation failed, using dummy audio', audioError);
            // Continue with limited functionality
        }
        
        // Return the public API
        return {
            playMusic,
            stopMusic,
            pauseMusic,
            resumeMusic,
            playSfx,
            setMusicVolume,
            setSfxVolume,
            toggleMusicMute,
            toggleSfxMute,
            preloadSounds,
            enableAudio,
            isAudioEnabled: () => isAudioEnabled
        };
    } catch (error) {
        console.error('Failed to initialize audio manager', error);
        
        // Return mock methods that do nothing to prevent errors
        return {
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
    }
}
    // Sound effect cache
    const sfxCache = {};
    
    // Music tracks paths
    const musicTracks = {
        'menu-theme': 'assets/audio/music/menu-theme.mp3',
        'exodus-theme': 'assets/audio/music/exodus-theme.mp3',
        'wilderness-theme': 'assets/audio/music/wilderness-theme.mp3',
        'journey-map-theme': 'assets/audio/music/journey-map-theme.mp3',
        'level-complete': 'assets/audio/music/level-complete.mp3',
        'dramatic-event': 'assets/audio/music/dramatic-event.mp3'
    };
    
    // Sound effect paths
    const sfxTracks = {
        'button-click': 'assets/audio/sfx/button-click.mp3',
        'tile-select': 'assets/audio/sfx/tile-select.mp3',
        'tile-swap': 'assets/audio/sfx/tile-swap.mp3',
        'tile-swap-fail': 'assets/audio/sfx/tile-swap-fail.mp3',
        'match-three': 'assets/audio/sfx/match-three.mp3',
        'match-four': 'assets/audio/sfx/match-four.mp3',
        'match-five': 'assets/audio/sfx/match-five.mp3',
        'match-multiple': 'assets/audio/sfx/match-multiple.mp3',
        'tile-cascade': 'assets/audio/sfx/tile-cascade.mp3',
        'special-tile-create': 'assets/audio/sfx/special-tile-create.mp3',
        'staff-activate': 'assets/audio/sfx/staff-activate.mp3',
        'pillar-activate': 'assets/audio/sfx/pillar-activate.mp3',
        'tablets-activate': 'assets/audio/sfx/tablets-activate.mp3',
        'faith-power-activate': 'assets/audio/sfx/faith-power-activate.mp3',
        'dialogue-appear': 'assets/audio/sfx/dialogue-appear.mp3',
        'dialogue-advance': 'assets/audio/sfx/dialogue-advance.mp3',
        'level-start': 'assets/audio/sfx/level-start.mp3',
        'level-complete': 'assets/audio/sfx/level-complete.mp3',
        'level-fail': 'assets/audio/sfx/level-fail.mp3',
        'star-earned': 'assets/audio/sfx/star-earned.mp3',
        'pause': 'assets/audio/sfx/pause.mp3',
        'unpause': 'assets/audio/sfx/unpause.mp3',
        'error': 'assets/audio/sfx/error.mp3',
        'hint': 'assets/audio/sfx/hint.mp3',
        'board-shuffle': 'assets/audio/sfx/board-shuffle.mp3'
    };
    
    // Fix for the init function in audio-manager.js
// Replace the current init function with this:

// Initialize the audio manager
function init(initialMusicVolume = 0.7, initialSfxVolume = 0.8) {
    try {
        if (isInitialized) {
            return {
                playMusic,
                stopMusic,
                pauseMusic,
                resumeMusic,
                playSfx,
                setMusicVolume,
                setSfxVolume,
                toggleMusicMute,
                toggleSfxMute,
                preloadSounds
            };
        }
        
        // Ensure values are valid numbers between 0 and 1
        musicVolume = Math.max(0, Math.min(1, initialMusicVolume || 0.7));
        sfxVolume = Math.max(0, Math.min(1, initialSfxVolume || 0.8));
        
        // Create audio element for music
        try {
            musicElement = new Audio();
            musicElement.loop = true;
            
            // Add event listeners
            document.addEventListener('visibilitychange', handleVisibilityChange);
            musicElement.addEventListener('error', handleMusicError);
            
            // Preload common sound effects
            preloadCommonSounds();
            
            isInitialized = true;
            console.log('Audio manager initialized');
        } catch (audioError) {
            console.warn('Audio element creation failed, using dummy audio', audioError);
            // Continue with limited functionality
        }
        
        return {
            playMusic,
            stopMusic,
            pauseMusic,
            resumeMusic,
            playSfx,
            setMusicVolume,
            setSfxVolume,
            toggleMusicMute,
            toggleSfxMute,
            preloadSounds
        };
    } catch (error) {
        console.error('Failed to initialize audio manager', error);
        
        // Return mock methods that do nothing to prevent errors
        return {
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
    }
}
    
    // Handle visibility change (pause/resume music)
    function handleVisibilityChange() {
        if (document.hidden) {
            // Document is hidden, pause music
            if (musicElement && !musicElement.paused) {
                musicElement.pause();
            }
        } else {
            // Document is visible again, resume music if it wasn't manually paused
            if (musicElement && currentMusic && !isMusicMuted) {
                musicElement.play().catch(error => {
                    Debugging.warning('Failed to auto-resume music', error);
                });
            }
        }
    }
    
    // Handle music playback errors
    function handleMusicError(event) {
        const error = event.target.error;
        
        if (error) {
            Debugging.warning('Music playback error', error);
            
            // Try to recover by using a different format or track
            if (currentMusic) {
                // Attempt to switch to an alternative version or format
                const alternativeTrack = getFallbackTrack(currentMusic);
                if (alternativeTrack && alternativeTrack !== musicElement.src) {
                    Debugging.info(`Trying alternative track for ${currentMusic}`);
                    musicElement.src = alternativeTrack;
                    musicElement.play().catch(e => {
                        Debugging.error('Failed to play alternative track', e);
                    });
                }
            }
        }
    }
    
    // Get fallback track if available
    function getFallbackTrack(trackName) {
        // Try alternative format
        if (trackName.endsWith('.mp3')) {
            return trackName.replace('.mp3', '.ogg');
        } else if (trackName.endsWith('.ogg')) {
            return trackName.replace('.ogg', '.mp3');
        }
        
        // If no fallback available, return null
        return null;
    }
    
    // Preload common sound effects
    function preloadCommonSounds() {
        const commonSfx = [
            'button-click',
            'tile-select',
            'tile-swap',
            'match-three',
            'dialogue-appear',
            'dialogue-advance'
        ];
        
        commonSfx.forEach(sfx => {
            if (sfxTracks[sfx]) {
                preloadSfx(sfx);
            }
        });
    }
    
    // Preload specific sounds
    function preloadSounds(soundList) {
        for (const sound of soundList) {
            if (sfxTracks[sound]) {
                preloadSfx(sound);
            } else if (musicTracks[sound]) {
                // Don't preload music as it's larger
                continue;
            }
        }
    }
    
    // Preload a specific sound effect
    function preloadSfx(sfxName) {
        if (sfxCache[sfxName]) {
            return sfxCache[sfxName];
        }
        
        try {
            const sfxPath = sfxTracks[sfxName];
            if (!sfxPath) {
                Debugging.warning(`Sound effect not found: ${sfxName}`);
                return null;
            }
            
            const audio = new Audio(sfxPath);
            sfxCache[sfxName] = audio;
            
            // Preload by forcing a load event
            audio.load();
            
            return audio;
        } catch (error) {
            Debugging.error(`Failed to preload sound effect: ${sfxName}`, error);
            return null;
        }
    }
    
    // Play music track
    function playMusic(trackName) {
        // Skip if music is muted
        if (isMusicMuted) return;
        
        try {
            // Get track path
            const trackPath = musicTracks[trackName];
            if (!trackPath) {
                Debugging.warning(`Music track not found: ${trackName}`);
                return;
            }
            
            // If the same track is already playing, don't restart
            if (currentMusic === trackName && !musicElement.paused) {
                return;
            }
            
            // Stop current music
            stopMusic();
            
            // Set new track
            musicElement.src = trackPath;
            musicElement.volume = musicVolume;
            currentMusic = trackName;
            
            // Play the music
            musicElement.play().catch(error => {
                Debugging.warning(`Failed to play music track: ${trackName}`, error);
                
                // Try to use alternative format
                const alternativeTrack = getFallbackTrack(trackPath);
                if (alternativeTrack) {
                    Debugging.info(`Trying alternative track format for ${trackName}`);
                    musicElement.src = alternativeTrack;
                    musicElement.play().catch(e => {
                        Debugging.error('Failed to play alternative track format', e);
                    });
                }
            });
        } catch (error) {
            Debugging.error(`Error playing music track: ${trackName}`, error);
        }
    }
    
    // Stop current music
    function stopMusic() {
        if (musicElement) {
            musicElement.pause();
            musicElement.currentTime = 0;
            currentMusic = null;
        }
    }
    
    // Pause current music
    function pauseMusic() {
        if (musicElement && !musicElement.paused) {
            musicElement.pause();
        }
    }
    
    // Resume current music
    function resumeMusic() {
        // Skip if music is muted
        if (isMusicMuted) return;
        
        if (musicElement && currentMusic) {
            musicElement.play().catch(error => {
                Debugging.warning('Failed to resume music', error);
            });
        }
    }
    
    // Play sound effect
    function playSfx(sfxName) {
        // Skip if sound effects are muted
        if (isSfxMuted) return;
        
        try {
            // Get from cache or load
            let sfx = sfxCache[sfxName];
            if (!sfx) {
                sfx = preloadSfx(sfxName);
                if (!sfx) return; // Failed to load
            }
            
            // Clone the audio to allow multiple simultaneous plays
            const sfxClone = sfx.cloneNode();
            sfxClone.volume = sfxVolume;
            
            // Play the sound
            sfxClone.play().catch(error => {
                Debugging.warning(`Failed to play sound effect: ${sfxName}`, error);
            });
            
            // Clean up when done
            sfxClone.addEventListener('ended', () => {
                sfxClone.remove();
            });
        } catch (error) {
            Debugging.error(`Error playing sound effect: ${sfxName}`, error);
        }
    }
    
    // Set music volume
    function setMusicVolume(volume) {
        // Clamp volume between 0 and 1
        musicVolume = Math.max(0, Math.min(1, volume));
        
        if (musicElement) {
            musicElement.volume = musicVolume;
        }
        
        // If volume is 0, consider it muted
        isMusicMuted = (musicVolume === 0);
        
        Debugging.info(`Music volume set to ${musicVolume}`);
    }
    
    // Set sound effects volume
    function setSfxVolume(volume) {
        // Clamp volume between 0 and 1
        sfxVolume = Math.max(0, Math.min(1, volume));
        
        // If volume is 0, consider it muted
        isSfxMuted = (sfxVolume === 0);
        
        Debugging.info(`SFX volume set to ${sfxVolume}`);
    }
    
    // Toggle music mute
    function toggleMusicMute() {
        isMusicMuted = !isMusicMuted;
        
        if (isMusicMuted) {
            if (musicElement) {
                musicElement.pause();
            }
        } else {
            if (musicElement && currentMusic) {
                musicElement.play().catch(error => {
                    Debugging.warning('Failed to unmute music', error);
                });
            }
        }
        
        Debugging.info(`Music ${isMusicMuted ? 'muted' : 'unmuted'}`);
        return isMusicMuted;
    }
    
    // Toggle sound effects mute
    function toggleSfxMute() {
        isSfxMuted = !isSfxMuted;
        Debugging.info(`Sound effects ${isSfxMuted ? 'muted' : 'unmuted'}`);
        return isSfxMuted;
    }
    
    // Public API
    return {
        init
    };
})();

export default AudioManager;