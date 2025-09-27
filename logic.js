// NOTE: this example uses the chess.js library:
// https://github.com/jhlywa/chess.js

const game = new Chess()

const boardConfig = {
  draggable: true,
  position: game.fen(),
  onDragStart,
  onDrop
  // onSnapEnd
}
const board = Chessboard2('board2', boardConfig)

function onDragStart (dragStartEvt) {
  // do not pick up pieces if the game is over
	if (game.game_over()) {return false}

  // only pick up pieces for the side to move
  if (game.turn() === 'w' && !isWhitePiece(dragStartEvt.piece)) return false
  if (game.turn() === 'b' && !isBlackPiece(dragStartEvt.piece)) return false

  // what moves are available to from this square?
  const legalMoves = game.moves({
    square: dragStartEvt.square,
    verbose: true
  })

  // place Circles on the possible target squares
  legalMoves.forEach((move) => {
    board.addCircle(move.to)
  })
}

function isWhitePiece (piece) { return /^w/.test(piece) }
function isBlackPiece (piece) { return /^b/.test(piece) }

function onDrop (dropEvt) {
  // see if the move is legal
  const move = game.move({
    from: dropEvt.source,
    to: dropEvt.target,
    promotion: 'q' // NOTE: always promote to a queen for example simplicity
  })

  // remove all Circles from the board
  board.clearCircles()

  // make the move if it is legal
  if (move) {
    board.fen(game.fen());
	// analyzeMove(move);
	analyzePosition(game.fen());
  } else {
    return 'snapback'
  }
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
// function onSnapEnd () {
//   board.position(game.fen())
// }



// Analyze current FEN using Lichess Cloud Eval API
async function analyzePosition(fen) {
  try {
    const url = `https://lichess.org/api/cloud-eval?fen=${encodeURIComponent(fen)}&multiPv=1`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.pvs && data.pvs[0]) {
      const pv = data.pvs[0];
	  console.log(pv);
      if ("cp" in pv) {
        
        let score = pv.cp;
        console.log("Evaluation:", score / 100.0, "pawns");
        //Music changes based on score, eg for low eval/blunder
        // updateMusic(score); // find better way too change music
        //Higher score means more intensity
        // updateIntensity(score / 9);
      } else if ("mate" in pv) {
        // mate = forced mate in X
        console.log("Mate in", pv.mate);
        //Intensity- volume + speed
        // updateIntensity(100/pv.mate);
     
      }
    }
  } catch (err) {
    console.error("Error analyzing position:", err);
  }
}

// On chessboard move drop
/*function onDrop(source, target) {
  let move = game.move({ from: source, to: target });
  if (move === null) return 'snapback'; // illegal move

  // Sync board
  board.position(game.fen());

  analyzePosition(game.fen());
  analyzeMove(move);
}

*/
function analyzeMove(move) {
  let intensity = 0;
  let emp = 0;
  let prom = 0;
  const pieceValues = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 10 };

  intensity += pieceValues[move.piece] || 0;

  if (game.in_checkmate()) intensity += 10;
  else if (move.san.includes('+')) intensity += 4;
  else if (move.flags.includes('c')) intensity += 3;
// For forks
  let forkTargets = 0;

  const moves = game.moves({ square: move.to, verbose: true });
  for (let m of moves) {
    if (m.captured) {
      forkTargets += pieceValues[m.captured] || 0;
    }
  }
  if (forkTargets >= 2) Actions(4);
///

  if (move.captured) intensity += (pieceValues[move.captured] / 2);

  
  if (move.flags.includes('b')) Actions(3);
  if (move.flags.includes('e')) Actions(1);   // en passant
  if (move.flags.includes('p')) Actions(2);  // promotion

  updateIntensity(intensity);  
}
// //certain game states, it should change
// updateMusic(){}
// // For intensity, if between 3 and 6 we subtract//// or we subtract 5 from total score, but if below certain point we actually increment
// updateIntensity(){}
// //If 1, en passant, if 2 promotion, other numbers- other effects
// Actions(){}
<div id="player"></div>
<input type="range" id="volumeSlider" min="0" max="100" value="50">

<script src="https://www.youtube.com/iframe_api"></script>
<script>
let player;

function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '360',
    width: '640',
    videoId: 'M7lc1UVf-VE', // Replace with your video ID
    events: { 'onReady': onPlayerReady }
  });
}

function onPlayerReady(event) {
  event.target.playVideo();

  const slider = document.getElementById('volumeSlider');
  slider.addEventListener('input', () => {
    player.setVolume(slider.value); // 0–100
  });
}
</script>
