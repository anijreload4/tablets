/**
 * Tablets & Trials: The Covenant Quest
 * Dialogue Manager - Handles character dialogue and scripture integration
 */

import ErrorHandler from '../services/error-handler.js';
import Debugging from '../utils/debugging.js';
import AudioManager from '../audio/audio-manager.js';

// Dialogue Manager Module
const DialogueManager = (function() {
    // Private variables
    let dialogueContainer = null;
    let characterPortraitElement = null;
    let characterNameElement = null;
    let dialogueTextElement = null;
    let scriptureReferenceElement = null;
    let dialogueAdvanceElement = null;
    
    let currentLevelDialogue = [];
    let currentDialogueSequence = null;
    let currentLineIndex = 0;
    let isDialogueActive = false;
    let dialogueCooldown = false;
    let dialogueQueue = [];
    let dialogueSpeed = 'normal'; // slow, normal, fast
    let triggeredDialogues = new Set(); // Track which dialogues have been shown
    
    let typewriterInterval = null;
    let typewriterText = '';
    let typewriterIndex = 0;
    
    // Character data (maps character IDs to display names and portrait images)
    const characters = {
        'Moses': {
            name: 'Moses',
            portraits: {
                'normal': 'assets/images/characters/moses-normal.png',
                'concerned': 'assets/images/characters/moses-concerned.png',
                'commanding': 'assets/images/characters/moses-commanding.png'
            }
        },
        'Aaron': {
            name: 'Aaron',
            portraits: {
                'normal': 'assets/images/characters/aaron-normal.png',
                'supportive': 'assets/images/characters/aaron-supportive.png',
                'diplomatic': 'assets/images/characters/aaron-diplomatic.png'
            }
        },
        'Miriam': {
            name: 'Miriam',
            portraits: {
                'normal': 'assets/images/characters/miriam-normal.png',
                'joyful': 'assets/images/characters/miriam-joyful.png',
                'prophetic': 'assets/images/characters/miriam-prophetic.png'
            }
        },
        'IsraeliteMother': {
            name: 'Israelite Woman',
            portraits: {
                'normal': 'assets/images/characters/israelite-woman-normal.png',
                'fearful': 'assets/images/characters/israelite-woman-fearful.png',
                'hopeful': 'assets/images/characters/israelite-woman-hopeful.png'
            }
        },
        'IsraeliteFather': {
            name: 'Israelite Man',
            portraits: {
                'normal': 'assets/images/characters/israelite-man-normal.png',
                'suffering': 'assets/images/characters/israelite-man-suffering.png',
                'determined': 'assets/images/characters/israelite-man-determined.png'
            }
        },
        'IsraeliteChild': {
            name: 'Israelite Child',
            portraits: {
                'normal': 'assets/images/characters/israelite-child-normal.png',
                'afraid': 'assets/images/characters/israelite-child-afraid.png',
                'curious': 'assets/images/characters/israelite-child-curious.png'
            }
        },
        'Pharaoh': {
            name: 'Pharaoh',
            portraits: {
                'normal': 'assets/images/characters/pharaoh-normal.png',
                'angry': 'assets/images/characters/pharaoh-angry.png',
                'proud': 'assets/images/characters/pharaoh-proud.png'
            }
        },
        'EgyptianTaskmaster': {
            name: 'Egyptian Taskmaster',
            portraits: {
                'normal': 'assets/images/characters/taskmaster-normal.png',
                'stern': 'assets/images/characters/taskmaster-stern.png',
                'cruel': 'assets/images/characters/taskmaster-cruel.png'
            }
        },
        'Joshua': {
            name: 'Joshua',
            portraits: {
                'normal': 'assets/images/characters/joshua-normal.png',
                'determined': 'assets/images/characters/joshua-determined.png',
                'faithful': 'assets/images/characters/joshua-faithful.png'
            }
        },
        'IsraeliteElder': {
            name: 'Israelite Elder',
            portraits: {
                'normal': 'assets/images/characters/elder-normal.png',
                'worried': 'assets/images/characters/elder-worried.png',
                'angry': 'assets/images/characters/elder-angry.png'
            }
        },
        'IsraeliteYouth': {
            name: 'Israelite Youth',
            portraits: {
                'normal': 'assets/images/characters/youth-normal.png',
                'amazed': 'assets/images/characters/youth-amazed.png',
                'demanding': 'assets/images/characters/youth-demanding.png'
            }
        },
        'IsraelitePeople': {
            name: 'The People',
            portraits: {
                'normal': 'assets/images/characters/people-normal.png',
                'celebrating': 'assets/images/characters/people-celebrating.png',
                'complaining': 'assets/images/characters/people-complaining.png'
            }
        },
        'God': {
            name: 'The LORD',
            portraits: {
                'normal': 'assets/images/characters/god-presence.png',
                'commanding': 'assets/images/characters/god-presence.png',
                'just': 'assets/images/characters/god-presence.png'
            }
        },
        'EgyptianCommander': {
            name: 'Egyptian Commander',
            portraits: {
                'normal': 'assets/images/characters/egyptian-commander-normal.png',
                'determined': 'assets/images/characters/egyptian-commander-determined.png'
            }
        },
        'Narrator': {
            name: 'Narrator',
            portraits: {
                'normal': 'assets/images/characters/scroll.png',
                'transitional': 'assets/images/characters/scroll.png',
                'concluding': 'assets/images/characters/scroll.png'
            }
        }
    };
    
    // Initialize the dialogue manager
    function init(container) {
        try {
            dialogueContainer = container;
            
            if (!dialogueContainer) {
                throw new ErrorHandler.GameError(
                    'Dialogue container element is required to initialize dialogue manager',
                    'DIALOGUE_INIT_ERROR'
                );
            }
            
            // Get dialogue elements
            characterPortraitElement = document.getElementById('character-portrait');
            characterNameElement = document.getElementById('character-name');
            dialogueTextElement = document.getElementById('dialogue-text');
            scriptureReferenceElement = document.getElementById('scripture-reference');
            dialogueAdvanceElement = document.getElementById('dialogue-advance');
            
            // Set default dialogue speed from settings
            const savedSettings = JSON.parse(localStorage.getItem('tablets-trials-settings') || '{}');
            dialogueSpeed = savedSettings.dialogueSpeed || 'normal';
            
            // Add class for dialogue speed
            document.body.classList.add(`dialogue-speed-${dialogueSpeed}`);
            
            Debugging.info('Dialogue manager initialized');
            
            return {
                loadLevelDialogue,
                showDialogue,
                triggerDialogue,
                advanceDialogue,
                setDialogueSpeed,
                isActive: () => isDialogueActive
            };
        } catch (error) {
            Debugging.error('Failed to initialize dialogue manager', error);
            throw error;
        }
    }
    
    // Load dialogue for a specific level
    function loadLevelDialogue(levelId) {
        try {
            // Reset dialogue state
            currentLevelDialogue = [];
            currentDialogueSequence = null;
            currentLineIndex = 0;
            isDialogueActive = false;
            dialogueCooldown = false;
            dialogueQueue = [];
            triggeredDialogues.clear();
            
            // Load dialogue data based on level ID
            return fetch(`assets/data/dialogue/${levelId}.json`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Failed to load dialogue for level ${levelId}`);
                    }
                    return response.json();
                })
                .then(data => {
                    currentLevelDialogue = data || [];
                    Debugging.info(`Loaded dialogue for level ${levelId}`, { count: currentLevelDialogue.length });
                    return currentLevelDialogue;
                })
                .catch(error => {
                    // Load fallback dialogue
                    Debugging.warning(`Failed to load dialogue for level ${levelId}, using fallbacks`, error);
                    currentLevelDialogue = generateFallbackDialogue(levelId);
                    return currentLevelDialogue;
                });
        } catch (error) {
            Debugging.error(`Error loading dialogue for level ${levelId}`, error);
            ErrorHandler.logError(
                new ErrorHandler.GameError(
                    `Failed to load dialogue for level ${levelId}`,
                    'DIALOGUE_LOAD_ERROR',
                    { originalError: error }
                ),
                ErrorHandler.SEVERITY.WARNING
            );
            return Promise.resolve(generateFallbackDialogue(levelId));
        }
    }
    
    // Generate fallback dialogue for a level
    function generateFallbackDialogue(levelId) {
        const [epoch, levelNum] = levelId.split('-');
        const level = parseInt(levelNum);
        
        // Create a basic fallback dialogue sequence
        return [
            {
                id: `${epoch}-${level}-intro`,
                level: level,
                epoch: epoch,
                triggerType: "levelStart",
                priority: 10,
                lines: [
                    {
                        character: "Moses",
                        text: "The Lord has guided us on our journey through the wilderness.",
                        emotion: "normal"
                    },
                    {
                        character: "IsraeliteElder",
                        text: "We must trust in His guidance and follow His commands.",
                        emotion: "normal"
                    }
                ]
            },
            {
                id: `${epoch}-${level}-complete`,
                level: level,
                epoch: epoch,
                triggerType: "levelComplete",
                priority: 10,
                lines: [
                    {
                        character: "Moses",
                        text: "By God's grace, we have overcome this challenge.",
                        emotion: "normal"
                    },
                    {
                        character: "Miriam",
                        text: "Let us praise the Lord for His provision and mercy.",
                        emotion: "normal"
                    }
                ]
            }
        ];
    }
    
    // Trigger dialogue by type
    function triggerDialogue(triggerType, context = {}) {
        if (dialogueCooldown) return;
        
        // Find eligible dialogue sequences for this trigger
        const eligibleDialogues = currentLevelDialogue.filter(dialogue => {
            // Check if this dialogue matches the trigger type
            if (dialogue.triggerType !== triggerType) return false;
            
            // Check if we've already shown this dialogue (unless it's repeatable)
            if (triggeredDialogues.has(dialogue.id) && !dialogue.repeatable) return false;
            
            // Check for specific context conditions if they exist
            if (dialogue.condition) {
                for (const key in dialogue.condition) {
                    if (context[key] !== dialogue.condition[key]) return false;
                }
            }
            
            return true;
        });
        
        if (eligibleDialogues.length === 0) return;
        
        // Sort by priority (higher first)
        eligibleDialogues.sort((a, b) => (b.priority || 0) - (a.priority || 0));
        
        // Queue the highest priority dialogue
        queueDialogue(eligibleDialogues[0]);
    }
    
    // Queue a dialogue sequence for display
    function queueDialogue(dialogue) {
        // Add to queue
        dialogueQueue.push(dialogue);
        
        // If no dialogue is currently active, show the first in queue
        if (!isDialogueActive) {
            showNextInQueue();
        }
    }
    
    // Show the next dialogue in the queue
    function showNextInQueue() {
        if (dialogueQueue.length === 0) return;
        
        const dialogue = dialogueQueue.shift();
        
        // Mark as triggered
        triggeredDialogues.add(dialogue.id);
        
        // Show the dialogue
        showDialogue(dialogue);
        
        // Set cooldown
        dialogueCooldown = true;
        setTimeout(() => {
            dialogueCooldown = false;
        }, 1000); // 1 second cooldown between triggers
    }
    
    // Show a specific dialogue sequence
    function showDialogue(dialogue) {
        currentDialogueSequence = dialogue;
        currentLineIndex = 0;
        
        // Start displaying the sequence
        showDialogueLine();
    }
    
    // Show the current dialogue line
    function showDialogueLine() {
        if (!currentDialogueSequence || 
            currentLineIndex >= currentDialogueSequence.lines.length) {
            hideDialogue();
            return;
        }
        
        isDialogueActive = true;
        
        // Get the current line
        const line = currentDialogueSequence.lines[currentLineIndex];
        
        // Get character info
        const character = characters[line.character] || {
            name: line.character,
            portraits: { normal: 'assets/images/characters/fallback.png' }
        };
        
        // Set character name
        characterNameElement.textContent = character.name;
        
        // Set character portrait based on emotion
        const emotion = line.emotion || 'normal';
        const portraitSrc = character.portraits[emotion] || character.portraits['normal'];
        
        // Apply character transition if not the first line
        if (currentLineIndex > 0) {
            const prevLine = currentDialogueSequence.lines[currentLineIndex - 1];
            
            // Check if character changed
            if (prevLine.character !== line.character) {
                characterPortraitElement.classList.add('character-transition');
                
                // Reset after animation
                setTimeout(() => {
                    characterPortraitElement.classList.remove('character-transition');
                }, 300);
            }
        }
        
        // Set portrait and add emotion class
        characterPortraitElement.src = portraitSrc;
        
        // Set dialogue text with typewriter effect
        typewriterText = line.text;
        typewriterIndex = 0;
        dialogueTextElement.textContent = '';
        
        // Clear previous typewriter interval
        if (typewriterInterval) {
            clearInterval(typewriterInterval);
        }
        
        // Start typewriter effect based on dialogue speed
        let typewriterSpeed = 30; // Default (normal)
        if (dialogueSpeed === 'slow') {
            typewriterSpeed = 50;
        } else if (dialogueSpeed === 'fast') {
            typewriterSpeed = 10;
        }
        
        typewriterInterval = setInterval(() => {
            if (typewriterIndex < typewriterText.length) {
                dialogueTextElement.textContent += typewriterText.charAt(typewriterIndex);
                typewriterIndex++;
            } else {
                clearInterval(typewriterInterval);
                typewriterInterval = null;
            }
        }, typewriterSpeed);
        
        // Set scripture reference if available
        if (line.scriptureReference) {
            scriptureReferenceElement.textContent = line.scriptureReference;
            scriptureReferenceElement.style.display = 'block';
        } else {
            scriptureReferenceElement.style.display = 'none';
        }
        
        // Show the dialogue container
        dialogueContainer.classList.add('active');
        
        // Play dialogue sound
        AudioManager.playSfx('dialogue-appear');
    }
    
    // Hide the dialogue
    function hideDialogue() {
        isDialogueActive = false;
        dialogueContainer.classList.remove('active');
        
        // Clear typewriter
        if (typewriterInterval) {
            clearInterval(typewriterInterval);
            typewriterInterval = null;
        }
        
        // Check if there's more in the queue
        if (dialogueQueue.length > 0) {
            setTimeout(showNextInQueue, 500);
        }
    }
    
    // Advance to the next line in the dialogue
    function advanceDialogue() {
        // If typewriter is still running, complete the text immediately
        if (typewriterInterval) {
            clearInterval(typewriterInterval);
            typewriterInterval = null;
            dialogueTextElement.textContent = typewriterText;
            return;
        }
        
        // Play dialogue advance sound
        AudioManager.playSfx('dialogue-advance');
        
        // Move to the next line
        currentLineIndex++;
        showDialogueLine();
    }
    
    // Set dialogue speed
    function setDialogueSpeed(speed) {
        if (['slow', 'normal', 'fast'].includes(speed)) {
            dialogueSpeed = speed;
            
            // Update class on body
            document.body.classList.remove('dialogue-speed-slow', 'dialogue-speed-normal', 'dialogue-speed-fast');
            document.body.classList.add(`dialogue-speed-${speed}`);
            
            // Save to settings
            const savedSettings = JSON.parse(localStorage.getItem('tablets-trials-settings') || '{}');
            savedSettings.dialogueSpeed = speed;
            localStorage.setItem('tablets-trials-settings', JSON.stringify(savedSettings));
        }
    }
    
    // Format dialogue text with scripture highlights
    function formatScriptureText(text) {
        // Replace scripture quotes with highlighted spans
        return text.replace(/['"]([^'"]+)['"](?=\s*-\s*[A-Za-z\s]+\d+:\d+)/g, '<span class="scripture-highlight">$1</span>');
    }
    
    // Parse dialogue data from JSON
    function parseDialogueData(data) {
        try {
            return JSON.parse(data);
        } catch (error) {
            Debugging.error('Failed to parse dialogue data', error);
            return [];
        }
    }
    
    // Public API
    return {
        init
    };
})();

export default DialogueManager;