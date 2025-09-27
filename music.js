
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
        
        // Initialize audio context
        this.initAudioContext();
        this.setupEventListeners();
    }

    // Music tracks with different intensities and themes
    playlist = [
        {
            name: "Chess Opening",
            intensity: 1,
            description: "Calm and strategic",
            mood: "peaceful",
            audioUrl: "assets/audio/chess-opening.mp3"
        },
        {
            name: "Tactical Battle", 
            intensity: 3,
            description: "Building tension",
            mood: "tense",
            audioUrl: "assets/audio/tactical-battle.mp3"
        },
        {
            name: "Endgame Tension",
            intensity: 5, 
            description: "High stakes",
            mood: "dramatic",
            audioUrl: "assets/audio/endgame-tension.mp3"
        },
        {
            name: "Victory Theme",
            intensity: 7,
            description: "Epic climax", 
            mood: "triumphant",
            audioUrl: "assets/audio/victory-theme.mp3"
        }
    ];

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
        // Navbar volume toggle
        const volumeToggle = document.getElementById('volumeToggle');
        if (volumeToggle) {
            volumeToggle.addEventListener('change', (e) => {
                if (e.target.checked) {
                    // Volume on - start music
                    this.isPlaying = true;
                    this.startBackgroundMusic();
                    console.log('Volume turned ON - Music started');
                } else {
                    // Volume off - stop music
                    this.isPlaying = false;
                    this.stopBackgroundMusic();
                    console.log('Volume turned OFF - Music stopped');
                }
            });
        }

        // Volume slider (if it exists)
        const volumeSlider = document.getElementById('volumeSlider');
        const volumeDisplay = document.getElementById('volumeDisplay');
        
        if (volumeSlider && volumeDisplay) {
            volumeSlider.addEventListener('input', (e) => {
                this.volume = e.target.value / 100;
                volumeDisplay.textContent = e.target.value + '%';
                this.updateVolume();
            });
        }

        // Track selection (if it exists)
        const trackSelect = document.getElementById('trackSelect');
        if (trackSelect) {
            trackSelect.addEventListener('change', (e) => {
                this.changeTrack(parseInt(e.target.value));
            });
        }
    }

    // Update music intensity based on chess move
    updateMusicIntensity(move) {
        let intensityChange = 0;
        
        // Capture increases intensity significantly
        if (move.captured) {
            intensityChange += 2;
            this.captureCount++;
            this.playCaptureSound();
        }
        
        // Piece value affects intensity
        const pieceValues = { 'q': 3, 'r': 2, 'b': 1, 'n': 1, 'p': 0, 'k': 1 };
        const pieceValue = pieceValues[move.piece] || 0;
        intensityChange += pieceValue * 0.3;
        
        // Check increases intensity
        if (move.san.includes('+')) {
            intensityChange += 1;
            this.playCheckSound();
        }
        
        // Castling increases intensity (rare move)
        if (move.san.includes('O-O')) {
            intensityChange += 1.5;
            this.playCastlingSound();
        }
        
        // Promotion increases intensity significantly
        if (move.san.includes('=')) {
            intensityChange += 2.5;
            this.playPromotionSound();
        }
        
        // Update current intensity with smooth transition
        this.currentIntensity = Math.min(10, Math.max(1, this.currentIntensity + intensityChange));
        
        // Determine appropriate track based on intensity
        this.updateTrackSelection();
        this.updateIntensityDisplay();
        
        // Play move sound
        this.playMoveSound(move);
    }

    // Update track selection based on intensity
    updateTrackSelection() {
        let newTrackIndex = 0;
        
        if (this.currentIntensity >= 8) {
            newTrackIndex = 3; // Victory Theme
        } else if (this.currentIntensity >= 6) {
            newTrackIndex = 2; // Endgame Tension
        } else if (this.currentIntensity >= 4) {
            newTrackIndex = 1; // Tactical Battle
        } else {
            newTrackIndex = 0; // Chess Opening
        }
        
        // Only change track if intensity warrants it
        if (newTrackIndex !== this.currentTrackIndex) {
            this.currentTrackIndex = newTrackIndex;
            this.updateTrackDisplay();
            this.playTrackTransition();
            console.log(`Track changed to: ${this.playlist[this.currentTrackIndex].name}`);
        }
    }

    // Update intensity display in UI
    updateIntensityDisplay() {
        const intensityBar = document.getElementById('intensityBar');
        const intensityText = document.getElementById('intensityText');
        
        if (intensityBar && intensityText) {
            const percentage = (this.currentIntensity / 10) * 100;
            intensityBar.style.width = percentage + '%';
            
            let intensityLabel = 'Calm';
            if (this.currentIntensity >= 8) intensityLabel = 'Epic';
            else if (this.currentIntensity >= 6) intensityLabel = 'Intense';
            else if (this.currentIntensity >= 4) intensityLabel = 'Building';
            else if (this.currentIntensity >= 2) intensityLabel = 'Moderate';
            
            intensityText.textContent = `${intensityLabel} (${Math.round(this.currentIntensity)}/10)`;
        }
    }

    // Update track display in UI
    updateTrackDisplay() {
        const currentTrackEl = document.getElementById('currentTrack');
        const trackDescriptionEl = document.getElementById('trackDescription');
        const trackSelect = document.getElementById('trackSelect');
        
        if (currentTrackEl && trackDescriptionEl && trackSelect) {
            currentTrackEl.textContent = this.playlist[this.currentTrackIndex].name;
            trackDescriptionEl.textContent = this.playlist[this.currentTrackIndex].description;
            trackSelect.value = this.currentTrackIndex;
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
        this.isPlaying = !this.isPlaying;
        
        // Update navbar volume toggle
        this.syncVolumeToggle();
        
        // Update play/pause button if it exists
        const playPauseBtn = document.getElementById('playPauseBtn');
        if (playPauseBtn) {
            playPauseBtn.textContent = this.isPlaying ? '⏸️' : '▶️';
        }
        
        if (this.isPlaying) {
            this.startBackgroundMusic();
        } else {
            this.stopBackgroundMusic();
        }
        
        console.log('Music toggled:', this.isPlaying ? 'Playing' : 'Paused');
    }

    nextTrack() {
        this.currentTrackIndex = (this.currentTrackIndex + 1) % this.playlist.length;
        this.updateTrackDisplay();
        this.playTrackTransition();
        console.log(`Switched to: ${this.playlist[this.currentTrackIndex].name}`);
    }

    previousTrack() {
        this.currentTrackIndex = (this.currentTrackIndex - 1 + this.playlist.length) % this.playlist.length;
        this.updateTrackDisplay();
        this.playTrackTransition();
        console.log(`Switched to: ${this.playlist[this.currentTrackIndex].name}`);
    }

    changeTrack(trackIndex) {
        this.currentTrackIndex = trackIndex;
        this.updateTrackDisplay();
        this.playTrackTransition();
        console.log(`Manually switched to: ${this.playlist[this.currentTrackIndex].name}`);
    }

    // Reset music system for new game
    reset() {
        this.currentIntensity = 1;
        this.moveCount = 0;
        this.captureCount = 0;
        this.currentTrackIndex = 0;
        
        this.updateGameStats();
        this.updateTrackSelection();
        this.updateIntensityDisplay();
        this.updateTrackDisplay();
    }

    // Sound effect functions using Web Audio API
    playMoveSound(move) {
        if (!this.audioContext || !this.isPlaying) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        gainNode.gain.setValueAtTime(this.volume * 0.05, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }

    playCaptureSound() {
        if (!this.audioContext || !this.isPlaying) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(300, this.audioContext.currentTime + 0.2);
        gainNode.gain.setValueAtTime(this.volume * 0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }

    playCheckSound() {
        if (!this.audioContext || !this.isPlaying) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime);
        gainNode.gain.setValueAtTime(this.volume * 0.08, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.15);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.15);
    }

    playCastlingSound() {
        if (!this.audioContext || !this.isPlaying) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(500, this.audioContext.currentTime);
        gainNode.gain.setValueAtTime(this.volume * 0.07, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }

    playPromotionSound() {
        if (!this.audioContext || !this.isPlaying) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.4);
        gainNode.gain.setValueAtTime(this.volume * 0.12, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.4);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.4);
    }

    playTrackTransition() {
        if (!this.audioContext || !this.isPlaying) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(500, this.audioContext.currentTime + 0.2);
        gainNode.gain.setValueAtTime(this.volume * 0.06, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }

    startBackgroundMusic() {
        console.log('Starting background music:', this.playlist[this.currentTrackIndex].name);
    }

    stopBackgroundMusic() {
        console.log('Stopping background music');
    }

    updateVolume() {
        console.log('Volume updated to:', this.volume);
    }

    // Sync volume toggle with music state
    syncVolumeToggle() {
        const volumeToggle = document.getElementById('volumeToggle');
        if (volumeToggle) {
            volumeToggle.checked = this.isPlaying;
        }
    }
}

// Global music system instance
let musicSystem;

// Initialize music system when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    musicSystem = new ChessMusicSystem();
    
    // Update displays
    musicSystem.updateTrackDisplay();
    musicSystem.updateIntensityDisplay();
    musicSystem.updateGameStats();
    musicSystem.syncVolumeToggle();
    
    console.log('Chess Music System initialized');
});

// Export functions for use in other files
window.toggleMusic = () => musicSystem.toggleMusic();
window.nextTrack = () => musicSystem.nextTrack();
window.previousTrack = () => musicSystem.previousTrack();
window.changeTrack = (trackIndex) => musicSystem.changeTrack(trackIndex);
window.resetMusicSystem = () => musicSystem.reset();

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