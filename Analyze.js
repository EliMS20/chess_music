function analyzeMove(move) {
  
  let intensity = 0;
  const pieceValues = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 10 };

  intensity += pieceValues[move.piece] || 0;
  if (move.captured) intensity += pieceValues[move.captured] * 2;
  if (move.flags.includes('c')) intensity += 2; // capture
  if (move.san.includes('+')) intensity += 5;   // check
  if (game.in_checkmate()) intensity += 10;


  firebase.database().ref('game/intensity').push(intensity);


  updateMusic(intensity);
}
