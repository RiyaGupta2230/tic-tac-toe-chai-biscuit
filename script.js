const board = document.getElementById('board');
const cells = Array.from(document.querySelectorAll('.cell'));
const message = document.getElementById('message');
const restartBtn = document.getElementById('restartBtn');

const HUMAN = 'chai';    // 🍵 player
const AI = 'biscuit';    // 🍪 computer

let boardState = Array(9).fill(null);
let isGameOver = false;
let winningLineElem = null;

function render() {
  cells.forEach((cell, idx) => {
    cell.className = 'cell'; // reset classes
    if (boardState[idx] === HUMAN) cell.classList.add('chai');
    else if (boardState[idx] === AI) cell.classList.add('biscuit');
  });
}

// Check if a player has won and return the winning combo or null
function checkWinner(bd, player) {
  const wins = [
    [0,1,2],[3,4,5],[6,7,8], // rows
    [0,3,6],[1,4,7],[2,5,8], // columns
    [0,4,8],[2,4,6]          // diagonals
  ];
  for (const combo of wins) {
    if (combo.every(i => bd[i] === player)) {
      return combo; // winning combination found
    }
  }
  return null;
}

function isBoardFull(bd) {
  return bd.every(cell => cell !== null);
}

function createWinningLine(combo) {
  if (winningLineElem) winningLineElem.remove();

  winningLineElem = document.createElement('div');
  winningLineElem.classList.add('winning-line');

  const startCell = cells[combo[0]];
  const endCell = cells[combo[2]];

  const boardRect = board.getBoundingClientRect();
  const startRect = startCell.getBoundingClientRect();
  const endRect = endCell.getBoundingClientRect();

  const startX = startRect.left + startRect.width / 2 - boardRect.left;
  const startY = startRect.top + startRect.height / 2 - boardRect.top;
  const endX = endRect.left + endRect.width / 2 - boardRect.left;
  const endY = endRect.top + endRect.height / 2 - boardRect.top;

  const length = Math.hypot(endX - startX, endY - startY);
  const angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);

  winningLineElem.style.width = length + 'px';
  winningLineElem.style.top = startY + 'px';
  winningLineElem.style.left = startX + 'px';
  winningLineElem.style.transform = `rotate(${angle}deg)`;
  winningLineElem.style.transformOrigin = '0 50%';

  board.appendChild(winningLineElem);

  requestAnimationFrame(() => {
    winningLineElem.classList.add('show');
  });
}

// Minimax algorithm implementation
function minimax(newBoard, player) {
  const availSpots = newBoard.reduce((acc, val, idx) => {
    if (val === null) acc.push(idx);
    return acc;
  }, []);

  const humanWin = checkWinner(newBoard, HUMAN);
  const aiWin = checkWinner(newBoard, AI);

  if (humanWin) return { score: -10 };
  else if (aiWin) return { score: 10 };
  else if (availSpots.length === 0) return { score: 0 };

  const moves = [];

  for (const i of availSpots) {
    const move = {};
    move.index = i;
    newBoard[i] = player;

    if (player === AI) {
      const result = minimax(newBoard, HUMAN);
      move.score = result.score;
    } else {
      const result = minimax(newBoard, AI);
      move.score = result.score;
    }

    newBoard[i] = null; // Undo move
    moves.push(move);
  }

  let bestMove;
  if (player === AI) {
    let bestScore = -Infinity;
    for (const move of moves) {
      if (move.score > bestScore) {
        bestScore = move.score;
        bestMove = move;
      }
    }
  } else {
    let bestScore = Infinity;
    for (const move of moves) {
      if (move.score < bestScore) {
        bestScore = move.score;
        bestMove = move;
      }
    }
  }

  return bestMove;
}

function aiTurn() {
  if (isGameOver) return;

  let best = minimax(boardState, AI);
  if (best && typeof best.index === 'number') {
    boardState[best.index] = AI;
    render();

    const winningCombo = checkWinner(boardState, AI);
    if (winningCombo) {
      isGameOver = true;
      message.textContent = '🍪 Biscuit (AI) wins! Try again?';
      createWinningLine(winningCombo);
    } else if (isBoardFull(boardState)) {
      isGameOver = true;
      message.textContent = "It's a draw!";
    }
  }
}

function humanTurn(idx) {
  if (isGameOver) return;
  if (boardState[idx] !== null) return;

  boardState[idx] = HUMAN;
  render();

  const winningCombo = checkWinner(boardState, HUMAN);
  if (winningCombo) {
    isGameOver = true;
    message.textContent = '🍵 Chai (You) wins! 🎉';
    createWinningLine(winningCombo);
    return;
  }
  if (isBoardFull(boardState)) {
    isGameOver = true;
    message.textContent = "It's a draw!";
    return;
  }

  setTimeout(() => {
    aiTurn();
  }, 300);
}

restartBtn.addEventListener('click', () => {
  boardState = Array(9).fill(null);
  isGameOver = false;
  message.textContent = '';
  if (winningLineElem) {
    winningLineElem.remove();
    winningLineElem = null;
  }
  render();
});

cells.forEach((cell, idx) => {
  cell.addEventListener('click', () => {
    humanTurn(idx);
  });
});

render();
