const boardSize = 10;
const gameBoard = document.getElementById('game-board');
const setupBoard = document.getElementById('setup-board');
const startGameButton = document.getElementById('start-game');
const colorSelection = document.getElementById('color-selection');
const chooseRedButton = document.getElementById('choose-red');
const chooseBlueButton = document.getElementById('choose-blue');
const pieceSelection = document.getElementById('piece-selection');
const contextMenu = document.createElement('div');
contextMenu.classList.add('context-menu');
document.body.appendChild(contextMenu);

const pieces = {
    red: [
        { type: 'Flag', rank: 0, abbr: 'F', count: 1 },
        { type: 'Spy', rank: 1, abbr: 'S', count: 1 },
        { type: 'Scout', rank: 2, abbr: 'Sc', count: 8 },
        { type: 'Miner', rank: 3, abbr: 'M', count: 5 },
        { type: 'Sergeant', rank: 4, abbr: 'Sgt', count: 4 },
        { type: 'Lieutenant', rank: 5, abbr: 'Lt', count: 4 },
        { type: 'Captain', rank: 6, abbr: 'Cpt', count: 4 },
        { type: 'Major', rank: 7, abbr: 'Maj', count: 3 },
        { type: 'Colonel', rank: 8, abbr: 'Col', count: 2 },
        { type: 'General', rank: 9, abbr: 'Gen', count: 1 },
        { type: 'Marshal', rank: 10, abbr: 'Mar', count: 1 },
        { type: 'Bomb', rank: 11, abbr: 'B', count: 6 }
    ],
    blue: [
        { type: 'Flag', rank: 0, abbr: 'F', count: 1 },
        { type: 'Spy', rank: 1, abbr: 'S', count: 1 },
        { type: 'Scout', rank: 2, abbr: 'Sc', count: 8 },
        { type: 'Miner', rank: 3, abbr: 'M', count: 5 },
        { type: 'Sergeant', rank: 4, abbr: 'Sgt', count: 4 },
        { type: 'Lieutenant', rank: 5, abbr: 'Lt', count: 4 },
        { type: 'Captain', rank: 6, abbr: 'Cpt', count: 4 },
        { type: 'Major', rank: 7, abbr: 'Maj', count: 3 },
        { type: 'Colonel', rank: 8, abbr: 'Col', count: 2 },
        { type: 'General', rank: 9, abbr: 'Gen', count: 1 },
        { type: 'Marshal', rank: 10, abbr: 'Mar', count: 1 },
        { type: 'Bomb', rank: 11, abbr: 'B', count: 6 }
    ]
};

let board = Array(boardSize).fill(null).map(() => Array(boardSize).fill(null));
let userSetup = Array(boardSize).fill(null).map(() => Array(boardSize).fill(null));
let selectedPiece = null;
let currentPlayer = 'user';
let gameHistory = [];
let userWins = 0;
let computerWins = 0;
let difficultyLevel = 1; // Initial difficulty level
let userColor = 'red';
let computerColor = 'blue';

chooseRedButton.addEventListener('click', () => chooseColor('red'));
chooseBlueButton.addEventListener('click', () => chooseColor('blue'));

function chooseColor(color) {
    userColor = color;
    computerColor = color === 'red' ? 'blue' : 'red';
    colorSelection.style.display = 'none';
    document.getElementById('setup-container').style.display = 'flex';
    startGameButton.style.display = 'block';
    renderSetupBoard();
    renderPieceSelection();
}

function initializeBoard() {
    placePieces(computerColor, computerColor === 'red' ? 0 : 6);
}

function placePieces(player, rowStart) {
    pieces[player].forEach(piece => {
        for (let i = 0; i < piece.count; i++) {
            let row, col;
            do {
                row = Math.floor(Math.random() * 4) + rowStart;
                col = Math.floor(Math.random() * 10);
            } while (board[row][col] !== null);
            board[row][col] = { ...piece, player };
        }
    });
}

function renderSetupBoard() {
    setupBoard.innerHTML = '';
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener('dragover', onDragOver);
            cell.addEventListener('drop', onDrop);
            cell.addEventListener('contextmenu', onRightClick);
            if (userSetup[row][col]) {
                const piece = document.createElement('div');
                piece.classList.add('piece', userColor);
                piece.textContent = userSetup[row][col].abbr;
                cell.appendChild(piece);
            }
            setupBoard.appendChild(cell);
        }
    }
}

function renderPieceSelection() {
    pieceSelection.innerHTML = '';
    pieces[userColor].forEach(piece => {
        for (let i = 0; i < piece.count; i++) {
            const pieceDiv = document.createElement('div');
            pieceDiv.classList.add('piece', userColor);
            pieceDiv.textContent = piece.abbr;
            pieceDiv.draggable = true;
            pieceDiv.dataset.type = piece.type;
            pieceDiv.dataset.rank = piece.rank;
            pieceDiv.dataset.abbr = piece.abbr;
            pieceDiv.addEventListener('dragstart', onDragStart);
            pieceSelection.appendChild(pieceDiv);
        }
    });
}

function onDragStart(event) {
    event.dataTransfer.setData('text/plain', JSON.stringify({
        type: event.target.dataset.type,
        rank: event.target.dataset.rank,
        abbr: event.target.dataset.abbr
    }));
}

function onDragOver(event) {
    event.preventDefault();
}

function onDrop(event) {
    event.preventDefault();
    const data = JSON.parse(event.dataTransfer.getData('text/plain'));
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);
    if ((userColor === 'red' && row >= 6) || (userColor === 'blue' && row < 4)) {
        userSetup[row][col] = { type: data.type, rank: data.rank, abbr: data.abbr, player: userColor };
        // Remove the piece from the inventory
        pieces[userColor].find(p => p.rank === data.rank).count--;
        renderSetupBoard();
        renderPieceSelection();
    }
}

function startGame() {
    document.getElementById('setup-container').style.display = 'none';
    gameBoard.style.display = 'grid';
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            if ((userColor === 'red' && row >= 6) || (userColor === 'blue' && row < 4)) {
                board[row][col] = userSetup[row][col];
            }
        }
    }
    renderBoard();
}

function renderBoard() {
    gameBoard.innerHTML = '';
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener('click', onCellClick);
            cell.addEventListener('contextmenu', onRightClick);
            if (board[row][col]) {
                const piece = document.createElement('div');
                piece.classList.add('piece', board[row][col].player);
                piece.textContent = (board[row][col].player === userColor || currentPlayer === 'user') ? board[row][col].abbr : '?';
                cell.appendChild(piece);
            }
            gameBoard.appendChild(cell);
        }
    }
}

function onCellClick(event) {
    const cell = event.currentTarget;
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);

    if (selectedPiece && currentPlayer === 'user') {
        const validMove = isValidMove(selectedPiece.row, selectedPiece.col, row, col);
        if (validMove) {
            movePiece(selectedPiece.row, selectedPiece.col, row, col);
            gameHistory.push({ player: 'user', from: [selectedPiece.row, selectedPiece.col], to: [row, col] });
            selectedPiece = null;
            currentPlayer = 'computer';
            setTimeout(computerMove, 1000);
        }
    } else if (board[row][col] && board[row][col].player === userColor) {
        selectedPiece = { row, col };
    }
}

function isValidMove(fromRow, fromCol, toRow, toCol) {
    const piece = board[fromRow][fromCol];
    const rowDiff = Math.abs(fromRow - toRow);
    const colDiff = Math.abs(fromCol - toCol);

    if (piece.rank === 2 && (fromRow === toRow || fromCol === toCol)) {
        if (fromRow === toRow) {
            for (let i = Math.min(fromCol, toCol) + 1; i < Math.max(fromCol, toCol); i++) {
                if (board[fromRow][i] !== null) return false;
            }
        } else {
            for (let i = Math.min(fromRow, toRow) + 1; i < Math.max(fromRow, toRow); i++) {
                if (board[i][fromCol] !== null) return false;
            }
        }
        return true;
    }

    if (rowDiff + colDiff === 1) {
        return true;
    }

    return false;
}

function movePiece(fromRow, fromCol, toRow, toCol) {
    const piece = board[fromRow][fromCol];
    const target = board[toRow][toCol];

    if (target) {
        const result = resolveAttack(piece, target);
        if (result === 'win') {
            board[toRow][toCol] = piece;
        } else if (result === 'lose') {
            board[toRow][toCol] = target;
        } else {
            board[toRow][toCol] = null;
        }
    } else {
        board[toRow][toCol] = piece;
    }
    board[fromRow][fromCol] = null;
    renderBoard();
}

function resolveAttack(attacker, defender) {
    if (defender.rank === 0) {
        alert(`${attacker.player} wins!`);
        if (attacker.player === 'user') {
            userWins++;
        } else {
            computerWins++;
        }
        analyzeGamePerformance();
        resetGame();
        return 'win';
    }
    if (attacker.rank === defender.rank) {
        return 'draw';
    }
    if (attacker.rank === 1 && defender.rank === 10) {
        return 'win';
    }
    if (attacker.rank === 3 && defender.rank === 11) {
        return 'win';
    }
    if (defender.rank === 11 && attacker.rank !== 3) {
        return 'lose';
    }
    return attacker.rank > defender.rank ? 'win' : 'lose';
}

function computerMove() {
    let moved = false;
    const possibleMoves = [];
    for (let fromRow = 0; fromRow < boardSize; fromRow++) {
        for (let fromCol = 0; fromCol < boardSize; fromCol++) {
            if (board[fromRow][fromCol] && board[fromRow][fromCol].player === computerColor) {
                for (let toRow = 0; toRow < boardSize; toRow++) {
                    for (let toCol = 0; toCol < boardSize; toCol++) {
                        if (isValidMove(fromRow, fromCol, toRow, toCol)) {
                            possibleMoves.push({ fromRow, fromCol, toRow, toCol });
                        }
                    }
                }
            }
        }
    }

    if (possibleMoves.length > 0) {
        const move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        movePiece(move.fromRow, move.fromCol, move.toRow, move.toCol);
        gameHistory.push({ player: 'computer', from: [move.fromRow, move.fromCol], to: [move.toRow, move.toCol] });
        moved = true;
        currentPlayer = 'user';
    }
}

function analyzeGamePerformance() {
    const playerMoves = gameHistory.filter(move => move.player === 'user');
    const computerMoves = gameHistory.filter(move => move.player === 'computer');

    // Provide helpful comments to the user
    const userTips = generateTips(playerMoves);
    alert(`Game Over! Tips for improvement:\n${userTips.join('\n')}`);

    updateDifficultyLevel();
    gameHistory = [];
}

function generateTips(moves) {
    const tips = [];

    // Example tips based on moves
    if (moves.some(move => move.to[0] === 0 || move.to[0] === 9)) {
        tips.push("Try to avoid moving pieces to the very edge of the board unless necessary.");
    }
    if (moves.some(move => board[move.to[0]][move.to[1]].rank === 0 && board[move.to[0]][move.to[1]].player === userColor)) {
        tips.push("Protect your Flag better by surrounding it with other pieces.");
    }

    return tips;
}

function updateDifficultyLevel() {
    const totalGames = userWins + computerWins;
    if (totalGames >= 3) {
        const winRate = userWins / totalGames;
        if (winRate > 0.6) {
            difficultyLevel++;
        } else if (winRate < 0.4) {
            difficultyLevel = Math.max(1, difficultyLevel - 1);
        }
    }
}

function resetGame() {
    board = Array(boardSize).fill(null).map(() => Array(boardSize).fill(null));
    userSetup = Array(boardSize).fill(null).map(() => Array(boardSize).fill(null));
    selectedPiece = null;
    currentPlayer = 'user';
    initializeBoard();
}

function onRightClick(event) {
    event.preventDefault();
    const cell = event.currentTarget;
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);

    if (userSetup[row][col]) {
        showContextMenu(event, row, col);
    }
}

function showContextMenu(event, row, col) {
    contextMenu.innerHTML = '';
    const removeItem = document.createElement('div');
    removeItem.classList.add('context-menu__item');
    removeItem.textContent = 'Remove Piece';
    removeItem.addEventListener('click', () => {
        removePiece(row, col);
        contextMenu.style.display = 'none';
    });

    contextMenu.appendChild(removeItem);

    contextMenu.style.top = `${event.clientY}px`;
    contextMenu.style.left = `${event.clientX}px`;
    contextMenu.style.display = 'block';

    document.addEventListener('click', hideContextMenu);
}

function hideContextMenu() {
    contextMenu.style.display = 'none';
    document.removeEventListener('click', hideContextMenu);
}

function removePiece(row, col) {
    const piece = userSetup[row][col];
    userSetup[row][col] = null;
    pieces[userColor].find(p => p.rank === piece.rank).count++;
    renderSetupBoard();
    renderPieceSelection();
}

startGameButton.addEventListener('click', startGame);

initializeBoard();
