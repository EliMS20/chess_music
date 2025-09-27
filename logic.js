		<script>
		const game = new Chess();

		const board = Chessboard2('board2', {
			draggable: true,
			position: "start",
			showNotation: true,
			onDrop: function(source, target, piece) {
				// Try to make the move using chess.js
				const move = game.move({ from: source, to: target, promotion: 'q' });
				console.log(move);
				if (move === null) {
					// Illegal move, snapback
					console.log('Illegal move: ' + source + ' to ' + target);
					return 'snapback';
				} else {
					// Legal move, update board
					board.position(game.fen());
					updateStatus();
					// No return needed for legal moves
				}
			}
		});

		function updateStatus() {
			let status = '';
			if (game.in_checkmate()) {
				status = 'Game over, ' + (game.turn() === 'w' ? 'Black' : 'White') + ' wins by checkmate!';
			} else if (game.in_draw()) {
				status = 'Game over, drawn position.';
			} else {
				status = (game.turn() === 'w' ? 'White' : 'Black') + ' to move';
				if (game.in_check()) {
					status += ', ' + (game.turn() === 'w' ? 'White' : 'Black') + ' is in check!';
				}
			}
			document.getElementById('status').textContent = status;
		}

		// Add a status display below the board
		document.addEventListener('DOMContentLoaded', function() {
			const statusDiv = document.createElement('div');
			statusDiv.id = 'status';
			statusDiv.style.textAlign = 'center';
			statusDiv.style.marginTop = '20px';
			document.body.appendChild(statusDiv);
			updateStatus();
		});
		</script>