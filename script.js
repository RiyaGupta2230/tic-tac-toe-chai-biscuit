const board = document.getElementById('board');
const cells = Array.from(document.querySelectorAll('.cell'));
const message = document.getElementById('message');
const restartBtn = document.getElementById('restartBtn');

const HUMAN = 'chai';    // 🍵 player
const AI = 'biscuit';    // 🍪 computer

// Board state: array of 9 elements: 'chai', 'biscuit', or null
let boardState = Array(9).fill(null);
let isGameOver = false;

function render() {
  cells.forEach((cell, idx) => {
    cell.className = 'cell'; // reset class
    if (boardState[idx] === HUMAN) cell.classList.add('chai');
    else if (boardState[idx] === AI) cell.classList.add('biscuit');
  });
}

function checkWinner(bd, player) {
  const wins = [
    [0,1,2],[3,4,5],[6,7,8], // rows
    [0,3,6],[1,4,7],[2,5,8], // cols
    [0,4,8],[2,4,6]          // diagonals
  ];
  return wins.some(combo => combo.every(i => bd[i] === player));
}

function isBoardFull(bd) {
  return bd.every(cell => cell !== null);
}

// Minimax algorithm for AI
function minimax(newBoard, player) {
  if (checkWinner(newBoard, HUMAN)) return {score: -10};
  if (checkWinner(newBoard, AI)) return {score: 10};
  if (isBoardFull(newBoard)) return {score: 0};

  let moves = [];

  for (let i=0; i < newBoard.length; i++) {
    if (newBoard[i] === null) {
      let move = {};
      move.index = i;
      newBoard[i] = player;

      if (player === AI) {
        let result = minimax(newBoard, HUMAN);
        move.score = result.score;
      } else {
        let result = minimax(newBoard, AI);
        move.score = result.score;
      }

      newBoard[i] = null;
      moves.push(move);
    }
  }

  let bestMove;
  if (player === AI) {
    let bestScore = -Infinity;
    for (let i=0; i < moves.length; i++) {
      if (moves[i].score > bestScore) {
        bestScore = moves[i].score;
        bestMove = moves[i];
      }
    }
  } else {
    let bestScore = Infinity;
    for (let i=0; i < moves.length; i++) {
      if (moves[i].score < bestScore) {
        bestScore = moves[i].score;
        bestMove = moves[i];
      }
    }
  }
  return bestMove;
}

function aiTurn() {
  if (isGameOver) return;

  let best = minimax(boardState, AI);
  if (best !== undefined && best.index !== undefined) {
    boardState[best.index] = AI;
    render();
    if (checkWinner(boardState, AI)) {
      isGameOver = true;
      message.textContent = '🍪 Biscuit (AI) wins! Try again?';
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

  if (checkWinner(boardState, HUMAN)) {
    isGameOver = true;
    message.textContent = '🍵 Chai (You) wins! 🎉';
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

// Event listeners
cells.forEach((cell, idx) => {
  cell.addEventListener('click', () => {
    humanTurn(idx);
  });
});

restartBtn.addEventListener('click', () => {
  boardState = Array(9).fill(null);
  isGameOver = false;
  message.textContent = '';
  render();
});

render();
