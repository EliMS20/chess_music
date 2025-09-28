// Music System for Chess Game
// Adaptive music that changes based on chess moves

class ChessMusicSystem {
    constructor() {
        this.currentIntensity = 1;
        this.moveCount = 0;
        this.captureCount = 0;
        this.isPlaying = false;
        this.currentTrackIndex = 0;
        this.volume = 0.5;
        this.audioContext = null;
        this.backgroundMusic = null;
        this.isBackgroundPlaying = false;
        this.musicOscillators = [];
        this.currentAudio = null;
        this.jamendoTrack = null;
        
        // Jamendo API configuration
        this.jamendoClientId = '6dc7340c';
        this.jamendoBaseUrl = 'https://api.jamendo.com/v3.0';
        
        // Epic Battle by Carvine - hardcoded as requested
        this.epicBattleTrack = {
            name: "Epic Battle",
            artist: "Carvine",
            audioUrl: "https://www.soundjay.com/misc/sounds/checkmate.wav", // Replace with actual Epic Battle by Carvine URL
            description: "Epic battle music for chess intensity"
        };
        
        // Initialize audio context and fetch track
        this.initAudioContext();
        this.setupEventListeners();
        this.fetchEpicBattleTrack();
    }

    // Fetch Epic Battle by Carvine from Jamendo API
    async fetchEpicBattleTrack() {
        try {
            console.log('Searching for Epic Battle by Carvine on Jamendo...');
            
            // Search for Carvine tracks (more flexible search)
            const searchUrl = `${this.jamendoBaseUrl}/tracks/?client_id=${this.jamendoClientId}&format=json&limit=20&search=carvine&include=musicinfo&audiodlformat=mp31`;
            
            const response = await fetch(searchUrl);
            const data = await response.json();
            
            console.log('API Response:', data);
            
            if (data.results && data.results.length > 0) {
                console.log('Found', data.results.length, 'tracks');
                
                // Find Carvine track specifically
                const carvineTrack = data.results.find(track => 
                    track.artist_name.toLowerCase().includes('carvine') && 
                    track.name.toLowerCase().includes('epic')
                );
                
                if (carvineTrack) {
                    console.log('🎯 Found Carvine Epic Battle track:', carvineTrack);
                    this.jamendoTrack = {
                        id: carvineTrack.id,
                        name: carvineTrack.name,
                        artist: carvineTrack.artist_name,
                        duration: carvineTrack.duration,
                        audioUrl: carvineTrack.audio,
                        imageUrl: carvineTrack.album_image,
                        tags: carvineTrack.tags,
                        description: "Epic Battle by Carvine from Jamendo"
                    };
                    console.log('✅ Epic Battle by Carvine loaded:', this.jamendoTrack);
                } else {
                    // Try broader search for Carvine
                    console.log('Specific track not found, searching for Carvine artist...');
                    const carvineUrl = `${this.jamendoBaseUrl}/tracks/?client_id=${this.jamendoClientId}&format=json&limit=10&search=carvine&include=musicinfo&audiodlformat=mp31`;
                    
                    const carvineResponse = await fetch(carvineUrl);
                    const carvineData = await carvineResponse.json();
                    
                    if (carvineData.results && carvineData.results.length > 0) {
                        const track = carvineData.results[0];
                        this.jamendoTrack = {
                            id: track.id,
                            name: track.name,
                            artist: track.artist_name,
                            duration: track.duration,
                            audioUrl: track.audio,
                            imageUrl: track.album_image,
                            tags: track.tags,
                            description: `Track by Carvine from Jamendo`
                        };
                        console.log('✅ Found Carvine track:', this.jamendoTrack);
                    } else {
                        // Fallback to any epic track
                        console.log('Carvine not found, using first epic track...');
                        const epicTrack = data.results[0];
                        this.jamendoTrack = {
                            id: epicTrack.id,
                            name: epicTrack.name,
                            artist: epicTrack.artist_name,
                            duration: epicTrack.duration,
                            audioUrl: epicTrack.audio,
                            imageUrl: epicTrack.album_image,
                            tags: epicTrack.tags,
                            description: "Epic battle music from Jamendo"
                        };
                        console.log('✅ Using epic track from Jamendo:', this.jamendoTrack);
                    }
                }
            } else {
                console.log('No results found, using hardcoded track');
                this.jamendoTrack = {
                    ...this.epicBattleTrack,
                    id: "hardcoded-epic-battle"
                };
            }
            
            // Update UI
            this.updateTrackDisplay();
            
        } catch (error) {
            console.error('❌ Error fetching from Jamendo API:', error);
            console.log('Using hardcoded Epic Battle track');
            this.jamendoTrack = {
                ...this.epicBattleTrack,
                id: "hardcoded-epic-battle"
            };
            this.updateTrackDisplay();
        }
    }

    // Alternative method to search by different styles
    async changeMusicStyle(style) {
        try {
            console.log(`Changing to ${style} music style...`);
            
            let searchTag = style;
            if (style === 'battle') searchTag = 'epic';
            if (style === 'epic') searchTag = 'epic';
            if (style === 'orchestral') searchTag = 'orchestral';
            
            const url = `${this.jamendoBaseUrl}/tracks/?client_id=${this.jamendoClientId}&format=json&limit=1&tags=${searchTag}&include=musicinfo&audiodlformat=mp31`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
                const track = data.results[0];
                this.jamendoTrack = {
                    id: track.id,
                    name: track.name,
                    artist: track.artist_name,
                    duration: track.duration,
                    audioUrl: track.audio,
                    imageUrl: track.album_image,
                    tags: track.tags,
                    description: `${style} music from Jamendo`
                };
                
                console.log(`Loaded ${style} track:`, this.jamendoTrack);
                this.updateTrackDisplay();
                
                // Restart music if currently playing
                if (this.isPlaying && this.isBackgroundPlaying) {
                    this.stopBackgroundMusic();
                    setTimeout(() => this.startBackgroundMusic(), 100);
                }
            }
            
        } catch (error) {
            console.error(`Error fetching ${style} track:`, error);
        }
    }

    // Get current track
    getCurrentTrack() {
        if (this.jamendoTrack) {
            return this.jamendoTrack;
        }
        
        // Fallback track
        return {
            name: "Epic Battle",
            artist: "Carvine",
            audioUrl: null,
            description: "Epic battle chess soundtrack"
        };
    }

    // Initialize Web Audio API context
    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('Audio context initialized');
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }

    // Setup event listeners for music controls
    setupEventListeners() {
        // Volume control
        const volumeSlider = document.getElementById('volumeSlider');
        const volumeDisplay = document.getElementById('volumeDisplay');
        
        if (volumeSlider && volumeDisplay) {
            volumeSlider.addEventListener('input', (e) => {
                this.volume = e.target.value / 100;
                volumeDisplay.textContent = e.target.value + '%';
                this.updateVolume();
            });
        }
    }

    // Update music intensity based on chess move
    updateMusicIntensity(move) {
        let targetIntensity = this.currentIntensity;
        
        // Capture increases intensity based on piece value
        if (move.captured) {
            this.captureCount++;
            
            // Set intensity based on captured piece
            const capturedPiece = move.captured.toLowerCase();
            switch (capturedPiece) {
                case 'p': // Pawn
                    targetIntensity = 3;
                    break;
                case 'n': // Knight
                case 'b': // Bishop
                    targetIntensity = 4;
                    break;
                case 'r': // Rook
                    targetIntensity = 5;
                    break;
                case 'q': // Queen
                    targetIntensity = 8;
                    break;
                case 'k': // King (checkmate)
                    targetIntensity = 10;
                    break;
                default:
                    targetIntensity = 3;
            }
            
            console.log(`🎯 Piece captured: ${capturedPiece} - Setting intensity to ${targetIntensity}/10`);
            
            // Temporarily spike intensity
            this.spikeIntensity(targetIntensity);
            return;
        }
        
        // Check increases intensity
        if (move.san.includes('+')) {
            targetIntensity = Math.min(10, this.currentIntensity + 1);
            this.spikeIntensity(targetIntensity);
            return;
        }
        
        // Castling increases intensity (rare move)
        if (move.san.includes('O-O')) {
            targetIntensity = Math.min(10, this.currentIntensity + 2);
            this.spikeIntensity(targetIntensity);
            return;
        }
        
        // Promotion increases intensity significantly
        if (move.san.includes('=')) {
            targetIntensity = 6;
            this.spikeIntensity(targetIntensity);
            return;
        }
        
        // Normal moves gradually increase base intensity
        const baseIntensityChange = 0.1;
        this.currentIntensity = Math.min(6, Math.max(1, this.currentIntensity + baseIntensityChange));
        
        // Update volume and display
        this.updateVolumeBasedOnIntensity();
        this.updateIntensityDisplay();
    }

    // Temporarily spike intensity and return to normal
    spikeIntensity(targetIntensity) {
        console.log(`🚀 Intensity spike to ${targetIntensity}/10`);
        
        // Clear any existing spike timeout
        if (this.intensitySpikeTimeout) {
            clearTimeout(this.intensitySpikeTimeout);
        }
        
        // Set the spike intensity
        this.currentIntensity = targetIntensity;
        this.updateVolumeBasedOnIntensity();
        this.updateIntensityDisplay();
        
        // Return to normal intensity after 3 seconds
        this.intensitySpikeTimeout = setTimeout(() => {
            const normalIntensity = Math.min(6, Math.max(1, this.moveCount * 0.1 + 1));
            console.log(`📉 Returning to normal intensity: ${normalIntensity.toFixed(1)}/10`);
            
            this.currentIntensity = normalIntensity;
            this.updateVolumeBasedOnIntensity();
            this.updateIntensityDisplay();
        }, 3000); // 3 seconds
    }

    // Update volume based on intensity (single track approach)
    updateVolumeBasedOnIntensity() {
        if (!this.isBackgroundPlaying) return;
        
        // Use track volume control if available, otherwise use generated music volume
        if (this.currentAudio) {
            this.updateTrackVolume();
        } else {
            // Fallback to generated music volume control
            this.updateGeneratedMusicVolume();
        }
    }

    updateGeneratedMusicVolume() {
        if (!this.isBackgroundPlaying) return;
        
        // Calculate volume based on intensity (0.1 to 0.8 range)
        const baseVolume = 0.1;
        const maxVolume = 0.8;
        const intensityVolume = baseVolume + (this.currentIntensity / 10) * (maxVolume - baseVolume);
        
        // Apply the calculated volume to all oscillators
        this.musicOscillators.forEach((oscillator, index) => {
            const gainNode = oscillator.gainNode || this.findGainNode(oscillator);
            if (gainNode) {
                gainNode.gain.setValueAtTime(
                    this.volume * intensityVolume, 
                    this.audioContext.currentTime
                );
            }
        });
        
        console.log(`Generated music volume adjusted to ${(intensityVolume * 100).toFixed(1)}% based on intensity ${this.currentIntensity.toFixed(1)}`);
    }

    // Helper function to find gain node connected to oscillator
    findGainNode(oscillator) {
        // This is a simplified approach - in a real implementation you'd track the audio graph
        return null;
    }

    // Update track selection based on intensity (disabled - using single track)
    updateTrackSelection() {
        // Keep track at 0 - no track switching
        this.currentTrackIndex = 0;
    }

    // Update intensity display in UI
    updateIntensityDisplay() {
        const intensityBar = document.getElementById('intensityBar');
        const intensityText = document.getElementById('intensityText');
        
        if (intensityBar && intensityText) {
            const percentage = (this.currentIntensity / 10) * 100;
            intensityBar.style.width = percentage + '%';
            
            // Add visual effect for intensity spikes
            if (this.currentIntensity >= 8) {
                intensityBar.style.animation = 'pulse 0.5s ease-in-out';
            } else {
                intensityBar.style.animation = 'none';
            }
            
            let intensityLabel = 'Calm';
            let colorClass = 'text-green-600';
            
            if (this.currentIntensity >= 10) {
                intensityLabel = 'CHECKMATE!';
                colorClass = 'text-red-600 font-bold';
            } else if (this.currentIntensity >= 8) {
                intensityLabel = 'QUEEN CAPTURED!';
                colorClass = 'text-red-500 font-bold';
            } else if (this.currentIntensity >= 6) {
                intensityLabel = 'MAJOR CAPTURE!';
                colorClass = 'text-orange-500';
            } else if (this.currentIntensity >= 4) {
                intensityLabel = 'CAPTURE!';
                colorClass = 'text-yellow-600';
            } else if (this.currentIntensity >= 2) {
                intensityLabel = 'Building';
                colorClass = 'text-blue-600';
            }
            
            intensityText.innerHTML = `<span class="${colorClass}">${intensityLabel} (${Math.round(this.currentIntensity)}/10)</span>`;
        }
    }

    // Update track display in UI
    updateTrackDisplay() {
        const currentTrackEl = document.getElementById('trackTitle');
        const trackDescriptionEl = document.getElementById('trackDescription');
        
        if (currentTrackEl) {
            const track = this.getCurrentTrack();
            currentTrackEl.textContent = `${track.name} - ${track.artist}`;
        }
    }

    // Update game statistics
    updateGameStats() {
        this.moveCount++;
        
        const moveCountEl = document.getElementById('moveCount');
        const captureCountEl = document.getElementById('captureCount');
        const gamePhaseEl = document.getElementById('gamePhase');
        
        if (moveCountEl) moveCountEl.textContent = this.moveCount;
        if (captureCountEl) captureCountEl.textContent = this.captureCount;
        
        if (gamePhaseEl) {
            let phase = 'Opening';
            if (this.moveCount > 40) phase = 'Endgame';
            else if (this.moveCount > 20) phase = 'Middlegame';
            else if (this.moveCount > 10) phase = 'Early Middlegame';
            
            gamePhaseEl.textContent = phase;
        }
    }

    // Music control functions
    toggleMusic() {
        console.log('🎵 Toggle music clicked! Current state:', this.isPlaying);
        this.isPlaying = !this.isPlaying;
        
        // Update volume button text
        const volumeBtn = document.getElementById('volumeToggleBtn');
        if (volumeBtn) {
            volumeBtn.textContent = this.isPlaying ? '🔇 Stop Epic Battle' : '🔊 Play Epic Battle';
            console.log('🎮 Button text updated to:', volumeBtn.textContent);
        } else {
            console.error('❌ Volume button not found!');
        }
        
        if (this.isPlaying) {
            console.log('▶️ Starting background music...');
            this.startBackgroundMusic();
        } else {
            console.log('⏸️ Stopping background music...');
            this.stopBackgroundMusic();
        }
        
        console.log('🎵 Epic Battle by Carvine:', this.isPlaying ? 'Playing' : 'Stopped');
    }

    nextTrack() {
        // No track switching - just restart current track
        if (this.isPlaying && this.isBackgroundPlaying) {
            this.stopBackgroundMusic();
            setTimeout(() => this.startBackgroundMusic(), 100);
        }
    }

    previousTrack() {
        // No track switching - just restart current track
        if (this.isPlaying && this.isBackgroundPlaying) {
            this.stopBackgroundMusic();
            setTimeout(() => this.startBackgroundMusic(), 100);
        }
    }

    changeTrack(trackIndex) {
        // No track switching - just restart current track
        if (this.isPlaying && this.isBackgroundPlaying) {
            this.stopBackgroundMusic();
            setTimeout(() => this.startBackgroundMusic(), 100);
        }
    }

    // Reset music system for new game
    reset() {
        this.currentIntensity = 1;
        this.moveCount = 0;
        this.captureCount = 0;
        this.currentTrackIndex = 0;
        
        // Update volume to low level (intensity 1)
        this.updateVolumeBasedOnIntensity();
        
        this.updateGameStats();
        this.updateTrackSelection();
        this.updateIntensityDisplay();
        this.updateTrackDisplay();
    }

    // No sound effects - just volume changes based on intensity

    startBackgroundMusic() {
        console.log('🎵 startBackgroundMusic called. isBackgroundPlaying:', this.isBackgroundPlaying);
        if (this.isBackgroundPlaying) {
            console.log('⚠️ Already playing, skipping...');
            return;
        }
        
        console.log('🎶 Starting Epic Battle music...');
        this.isBackgroundPlaying = true;
        this.playEpicBattleTrack();
    }

    stopBackgroundMusic() {
        console.log('Stopping Epic Battle music');
        this.isBackgroundPlaying = false;
        
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
        }
        
        this.stopAllOscillators();
    }

    playEpicBattleTrack() {
        if (!this.isBackgroundPlaying) return;
        
        const track = this.getCurrentTrack();
        console.log('🎵 Attempting to play track:', track);
        
        // Check if we have a track with audio URL
        if (track.audioUrl && track.audioUrl !== "https://www.soundjay.com/misc/sounds/checkmate.wav") {
            console.log(`🎶 Playing Epic Battle: ${track.name} by ${track.artist}`);
            console.log(`🔗 Audio URL: ${track.audioUrl}`);
            
            // Stop current audio
            if (this.currentAudio) {
                this.currentAudio.pause();
            }
            
            // Create new audio element
            this.currentAudio = new Audio(track.audioUrl);
            this.currentAudio.loop = true;
            this.currentAudio.preload = 'auto';
            
            // Set initial volume based on intensity
            this.updateTrackVolume();
            
            // Handle audio events
            this.currentAudio.addEventListener('loadeddata', () => {
                console.log('Epic Battle track loaded successfully');
                if (this.isBackgroundPlaying) {
                    this.currentAudio.play().catch(e => {
                        console.error('Error playing Epic Battle track:', e);
                        console.log('🔄 Retrying Epic Battle track...');
                        // Retry instead of fallback
                        setTimeout(() => this.playEpicBattleTrack(), 1000);
                    });
                }
            });
            
            this.currentAudio.addEventListener('error', (e) => {
                console.error('Error loading Epic Battle track:', e);
                console.log('🔄 Retrying Epic Battle track in 2 seconds...');
                // Retry instead of fallback
                setTimeout(() => this.playEpicBattleTrack(), 2000);
            });
            
            // Load the audio
            this.currentAudio.load();
        } else {
            console.log('❌ No Epic Battle URL available - retrying API fetch...');
            // Retry fetching Epic Battle instead of using generated music
            this.fetchEpicBattleTrack();
            setTimeout(() => this.playEpicBattleTrack(), 1000);
        }
    }

    updateTrackVolume() {
        if (!this.currentAudio) return;
        
        // Calculate volume based on intensity (0.1 to 0.9 range for Epic Battle)
        const baseVolume = 0.1;
        const maxVolume = 0.9;
        const intensityVolume = baseVolume + (this.currentIntensity / 10) * (maxVolume - baseVolume);
        
        // Apply volume with master volume control
        this.currentAudio.volume = this.volume * intensityVolume;
        
        console.log(`Epic Battle volume adjusted to ${(intensityVolume * 100).toFixed(1)}% based on intensity ${this.currentIntensity.toFixed(1)}`);
    }

    generateBackgroundMusic() {
        console.log('❌ Generated music disabled - Epic Battle only!');
        console.log('🔄 Retrying Epic Battle track...');
        // Don't use generated music, retry Epic Battle instead
        setTimeout(() => this.playEpicBattleTrack(), 1000);
        return;
        
        if (!this.audioContext || !this.isBackgroundPlaying) return;
        
        // Create a simple, pleasant background track as fallback
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        // Simple, pleasant settings
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(220, this.audioContext.currentTime); // A3 note
        
        // Gentle low-pass filter
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, this.audioContext.currentTime);
        
        // Start with low volume (will be adjusted by intensity)
        gainNode.gain.setValueAtTime(this.volume * 0.1, this.audioContext.currentTime);
        
        // Store gain node reference for volume control
        oscillator.gainNode = gainNode;
        
        // Connect nodes
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Start oscillator
        oscillator.start();
        
        // Store oscillator for cleanup
        this.musicOscillators = [oscillator];
        
        // Schedule gentle melody progression
        this.scheduleMelodyProgression();
    }

    scheduleMelodyProgression() {
        if (!this.isBackgroundPlaying || this.musicOscillators.length === 0) return;
        
        // Gentle melody progression every 3 seconds
        setTimeout(() => {
            if (this.isBackgroundPlaying && this.musicOscillators.length > 0) {
                this.playMelodyNote();
                this.scheduleMelodyProgression();
            }
        }, 3000);
    }

    playMelodyNote() {
        if (!this.audioContext || this.musicOscillators.length === 0) return;
        
        const oscillator = this.musicOscillators[0];
        if (!oscillator) return;
        
        // Simple melody progression: A3 -> C4 -> E4 -> A4
        const melodyNotes = [220, 261.63, 329.63, 440]; // A3, C4, E4, A4
        const currentFreq = oscillator.frequency.value;
        let nextNote = melodyNotes[0];
        
        // Find next note in sequence
        for (let i = 0; i < melodyNotes.length; i++) {
            if (Math.abs(currentFreq - melodyNotes[i]) < 10) {
                nextNote = melodyNotes[(i + 1) % melodyNotes.length];
                break;
            }
        }
        
        // Smooth transition to next note
        oscillator.frequency.setValueAtTime(nextNote, this.audioContext.currentTime);
    }

    stopAllOscillators() {
        this.musicOscillators.forEach(oscillator => {
            try {
                oscillator.stop();
            } catch (e) {
                // Oscillator might already be stopped
            }
        });
        this.musicOscillators = [];
    }

    updateVolume() {
        console.log('Volume updated to:', this.volume);
    }
}

// Global music system instance
let musicSystem;

// Initialize music system when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM loaded, initializing music system...');
    musicSystem = new ChessMusicSystem();
    
    // Update displays
    musicSystem.updateTrackDisplay();
    musicSystem.updateIntensityDisplay();
    musicSystem.updateGameStats();
    
    console.log('✅ Epic Battle Chess Music System initialized');
    console.log('🎵 Music system object:', musicSystem);
    console.log('🎮 Volume button element:', document.getElementById('volumeToggleBtn'));
});

// Export functions for use in other files
window.toggleMusic = () => {
    console.log('🌐 Global toggleMusic function called');
    if (musicSystem) {
        musicSystem.toggleMusic();
    } else {
        console.error('❌ Music system not initialized!');
    }
};
window.nextTrack = () => musicSystem.nextTrack();
window.previousTrack = () => musicSystem.previousTrack();
window.changeTrack = (trackIndex) => musicSystem.changeTrack(trackIndex);
window.resetGame = () => musicSystem.reset();
window.changeMusicStyle = (style) => musicSystem.changeMusicStyle(style);
window.testJamendoAPI = () => musicSystem.fetchEpicBattleTrack();

// Function to be called from chess logic when a move is made
window.updateMusicFromMove = (move) => {
    if (musicSystem) {
        musicSystem.updateMusicIntensity(move);
        musicSystem.updateGameStats();
    }
};

// Function to be called when undoing a move
window.undoMove = () => {
    if (musicSystem) {
        musicSystem.moveCount = Math.max(0, musicSystem.moveCount - 1);
        musicSystem.currentIntensity = Math.max(1, musicSystem.currentIntensity - 0.5);
        musicSystem.updateGameStats();
        musicSystem.updateTrackSelection();
        musicSystem.updateIntensityDisplay();
    }
};