const stockfish = new Worker("stockfish.js");

stockfish.onmessage = function(event) {
  let line = event.data;

  if (line.includes("info depth")) {
    let match = line.match(/score (\w+) (-?\d+)/);
    if (match) {
      let type = match[1];
      let value = parseInt(match[2], 10);

      if (type === "cp") {
      

        let score = value; 
        console.log("Evaluation:", score / 100.0);
        updateMusic(score);
        updateIntensity(score / 9);
        
        //updateMusic, then based on the score plays music
        //Alongside music there will be specific sound effects for blunder (Below 25), etc 
        //intensity is volume + speed
      } else if (type === "mate") {
        console.log("Mate in", value);
        updateIntensity(100); // extreme intensity
        updateSpeed(100);
      }
    }
  }
};

function onDrop(source, target) {
  let move = game.move({ from: source, to: target });
  if (move === null) return 'snapback'; // illegal move

  // Sync board
  board.position(game.fen());

  // Send current position to Stockfish
  stockfish.postMessage("uci");
  stockfish.postMessage("ucinewgame");
  stockfish.postMessage("position fen " + game.fen());
  stockfish.postMessage("go depth 10"); // depth 10 for quick analysis
}
function analyzeMove(move) {
  
  let intensity = 0;
  let emp = 0;
  let prom = 0;
  const pieceValues = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 10 };

  intensity += pieceValues[move.piece] || 0;

  if (game.in_checkmate()) intensity += 10;
  else if (move.san.includes('+')) intensity += 5;
  else if (move.flags.includes('c')) intensity += 2; 
  else {
    if (intensity > 0) intensity -= 1;
  }
  if (move.captured) intensity += pieceValues[move.captured];

  if move.flags.includes('e')) emp += 1;
  if move.flags.includes('p')) prom += 1;

// The intensity and other values are UPDATED by this amount
// Unless it is a specific action, then that triggers sound effect ONCE
  promotedAction(prom);
  enpassantAction(emp);
  updateIntensity(intensity);

}
