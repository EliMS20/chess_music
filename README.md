# Chess Music Board

A dynamic chess game where the music intensity and tracks change based on each move, creating an immersive gaming experience that adapts to the game's tension and excitement.

## Features

### 🎮 Interactive Chess Game
- Full chess game with legal move validation using Chess.js
- Drag-and-drop piece movement
- Game state tracking (check, checkmate, draws)
- Move history and undo functionality

### 🎵 Adaptive Music System
- **Dynamic Intensity**: Music intensity changes based on:
  - **Captures**: +2 intensity (significant impact)
  - **Piece Value**: Higher-value pieces increase intensity
  - **Checks**: +1 intensity for putting opponent in check
  - **Castling**: +1.5 intensity for rare strategic moves
  - **Promotions**: +2.5 intensity for dramatic piece promotions
  - **Game Phase**: Endgame naturally increases tension

### 🎼 Music Tracks
1. **Chess Opening** (Intensity 1): Calm and strategic
2. **Tactical Battle** (Intensity 3-4): Building tension
3. **Endgame Tension** (Intensity 5-6): High stakes
4. **Victory Theme** (Intensity 7+): Epic climax

### 🎛️ Music Controls
- Play/Pause toggle
- Track selection (manual or automatic)
- Volume control
- Previous/Next track navigation

### 📊 Game Statistics
- Move counter
- Capture count
- Current game phase (Opening/Middlegame/Endgame)
- Real-time intensity meter

## How It Works

The music system analyzes each chess move and calculates an intensity score based on:

1. **Move Type**: Different moves have different emotional impact
2. **Game State**: Checks, captures, and special moves increase intensity
3. **Game Phase**: Later in the game naturally increases tension
4. **Piece Values**: Moving valuable pieces affects the score

The intensity meter smoothly transitions between tracks, creating a seamless musical experience that matches the game's narrative arc.

## Technical Implementation

- **Frontend**: HTML5, Tailwind CSS, DaisyUI
- **Chess Engine**: Chess.js for game logic and validation
- **Chessboard**: Chessboard2.js for interactive board
- **Music System**: Modular JavaScript class with Web Audio API
- **Audio**: Web Audio API with real-time sound generation
- **Architecture**: Separated concerns with dedicated music.js file
- **Responsive**: Mobile-friendly design

## File Structure

```
chess_music/
├── chess-board.html    # Main HTML file with UI
├── logic.js           # Chess game logic and move handling
├── music.js           # Music system with adaptive tracks
└── README.md          # Documentation
```

## Getting Started

1. Open `chess-board.html` in your web browser
2. Start playing chess by dragging pieces
3. Watch the music intensity change with each move
4. Use the music controls to customize your experience

## Future Enhancements

- [ ] Add actual audio files for each track
- [ ] Implement smooth audio transitions between tracks
- [ ] Add sound effects for captures and checks
- [ ] Create different music themes (classical, electronic, orchestral)
- [ ] Add multiplayer support with synchronized music
- [ ] Implement AI opponent with adaptive difficulty

## Browser Compatibility

- Modern browsers with ES6+ support
- Web Audio API support recommended
- Touch devices supported for mobile play

---

*Built for the 2025 Hackathon - Combining strategy and music for an immersive gaming experience!*
