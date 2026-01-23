// 游戏状态变量
const boardSize = 15;
const board = Array.from({ length: boardSize }, () => Array(boardSize).fill(null));
let currentPlayer = 'black';
let gameOver = false;
let moveHistory = [];

// DOM 元素
const gameBoard = document.getElementById('game-board');
const status = document.getElementById('status');
const restartBtn = document.getElementById('restart-btn');
const undoBtn = document.getElementById('undo-btn');
const blackPlayer = document.querySelector('.player.black');
const whitePlayer = document.querySelector('.player.white');

// 创建棋盘
function createBoard() {
    gameBoard.innerHTML = ''; // 清空棋盘
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.addEventListener('click', handleCellClick);
            gameBoard.appendChild(cell);
        }
    }
    updatePlayerIndicator();
}

// 处理落子
function handleCellClick(event) {
    if (gameOver) return;

    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);

    if (board[row][col] !== null) return;

    // 落子动画
    event.target.classList.add(currentPlayer, 'animate__animated', 'animate__bounceIn');
    
    board[row][col] = currentPlayer;
    moveHistory.push({ row, col, player: currentPlayer });

    if (checkWin(row, col)) {
        gameOver = true;
        status.textContent = `${currentPlayer === 'black' ? '黑棋' : '白棋'} 赢了！`;
        status.classList.add('animate__animated', 'animate__bounceIn');
    } else if (board.flat().every(cell => cell !== null)) {
        gameOver = true;
        status.textContent = '平局！';
    } else {
        currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
        updatePlayerIndicator();
    }
}

// 更新玩家指示器
function updatePlayerIndicator() {
    status.textContent = `${currentPlayer === 'black' ? '黑棋' : '白棋'} 的回合`;
    blackPlayer.classList.toggle('active', currentPlayer === 'black');
    whitePlayer.classList.toggle('active', currentPlayer === 'white');
}

// 检查胜利
function checkWin(row, col) {
    const directions = [
        [1, 0], [0, 1], [1, 1], [1, -1]
    ];

    for (const [dx, dy] of directions) {
        let count = 1;

        // 正向检查
        for (let i = 1; i <= 4; i++) {
            const newRow = row + dx * i;
            const newCol = col + dy * i;
            if (newRow >= 0 && newRow < boardSize && 
                newCol >= 0 && newCol < boardSize && 
                board[newRow][newCol] === currentPlayer) {
                count++;
            } else {
                break;
            }
        }

        // 反向检查
        for (let i = 1; i <= 4; i++) {
            const newRow = row - dx * i;
            const newCol = col - dy * i;
            if (newRow >= 0 && newRow < boardSize && 
                newCol >= 0 && newCol < boardSize && 
                board[newRow][newCol] === currentPlayer) {
                count++;
            } else {
                break;
            }
        }

        if (count >= 5) return true;
    }
    return false;
}

// 重新开始游戏
function restartGame() {
    board.forEach(row => row.fill(null));
    gameOver = false;
    currentPlayer = 'black';
    moveHistory = [];
    createBoard();
    status.textContent = '黑棋的回合';
    status.classList.remove('animate__animated', 'animate__bounceIn');
}

// 悔棋
function undoMove() {
    if (moveHistory.length === 0 || gameOver) return;
    
    const lastMove = moveHistory.pop();
    board[lastMove.row][lastMove.col] = null;
    currentPlayer = lastMove.player;
    gameOver = false;
    
    // 更新视图
    createBoard();
    moveHistory.forEach(move => {
        const cell = gameBoard.children[move.row * boardSize + move.col];
        cell.classList.add(move.player);
    });
    
    updatePlayerIndicator();
}

// 事件监听
restartBtn.addEventListener('click', restartGame);
undoBtn.addEventListener('click', undoMove);

// 主题切换
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('night');
    const icon = themeToggle.querySelector('.theme-icon');
    icon.textContent = document.body.classList.contains('night') ? '☀️' : '🌙';
});

// 初始化游戏
createBoard(); 