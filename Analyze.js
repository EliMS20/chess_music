// Analyze current FEN using Lichess Cloud Eval API
async function analyzePosition(fen) {
  try {
    const url = `https://lichess.org/api/cloud-eval?fen=${encodeURIComponent(fen)}&multiPv=1`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.pvs && data.pvs[0]) {
      const pv = data.pvs[0];
      if ("cp" in pv) {
        
        let score = pv.cp;
        console.log("Evaluation:", score / 100.0, "pawns");
        //Music changes based on score, eg for low eval/blunder
        updateMusic(score);
        //Higher score means more intensity
        updateIntensity(score / 9);
      } else if ("mate" in pv) {
        // mate = forced mate in X
        console.log("Mate in", pv.mate);
        //Intensity- volume + speed
        updateIntensity(100/pv.mate);
     
      }
    }
  } catch (err) {
    console.error("Error analyzing position:", err);
  }
}

// On chessboard move drop
function onDrop(source, target) {
  let move = game.move({ from: source, to: target });
  if (move === null) return 'snapback'; // illegal move

  // Sync board
  board.position(game.fen());

  analyzePosition(game.fen());
  analyzeMove(move);
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

  if (move.flags.includes('e')) emp += 1;   // en passant
  if (move.flags.includes('p')) prom += 1;  // promotion

  // Save to Firebase
  firebase.database().ref('game/intensity').push(intensity);

  // Trigger effects, enpassant and promoted play action, intensity updates the intensity value by incrementing
  promotedAction(prom);
  enpassantAction(emp);
  updateIntensity(intensity);  
}
