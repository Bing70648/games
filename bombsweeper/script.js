/**
 * 掃地雷遊戲的核心邏輯
 */
document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const boardSize = 10; // 遊戲板大小 (10x10)
    const numberOfMines = 15; // 地雷數量
    let board = []; // 遊戲板數據
    let minesLocation = []; // 地雷位置

    /**
     * 初始化遊戲板
     * 創建網格並隨機放置地雷
     */
    function initializeGame() {
        gameBoard.innerHTML = ''; // 清空舊的遊戲板
        gameBoard.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;
        board = [];
        minesLocation = [];

        // 創建空的遊戲板
        for (let i = 0; i < boardSize * boardSize; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.setAttribute('data-id', i);
            cell.addEventListener('click', handleClick);
            cell.addEventListener('contextmenu', handleRightClick); // 右鍵標記
            gameBoard.appendChild(cell);
            board.push({
                isMine: false,
                isRevealed: false,
                isFlagged: false,
                surroundingMines: 0
            });
        }

        // 隨機放置地雷
        let minesPlaced = 0;
        while (minesPlaced < numberOfMines) {
            const randomIndex = Math.floor(Math.random() * boardSize * boardSize);
            if (!board[randomIndex].isMine) {
                board[randomIndex].isMine = true;
                minesLocation.push(randomIndex);
                minesPlaced++;
            }
        }

        // 計算每個單元格周圍的地雷數量
        calculateSurroundingMines();
    }

    /**
     * 計算每個單元格周圍的地雷數量
     */
    function calculateSurroundingMines() {
        for (let i = 0; i < boardSize * boardSize; i++) {
            if (!board[i].isMine) {
                let count = 0;
                const row = Math.floor(i / boardSize);
                const col = i % boardSize;

                // 檢查周圍8個方向
                for (let r = -1; r <= 1; r++) {
                    for (let c = -1; c <= 1; c++) {
                        if (r === 0 && c === 0) continue; // 跳過自身

                        const newRow = row + r;
                        const newCol = col + c;
                        const newIndex = newRow * boardSize + newCol;

                        if (newRow >= 0 && newRow < boardSize &&
                            newCol >= 0 && newCol < boardSize &&
                            board[newIndex] && board[newIndex].isMine) {
                            count++;
                        }
                    }
                }
                board[i].surroundingMines = count;
            }
        }
    }

    /**
     * 處理單元格點擊事件
     * @param {Event} event - 點擊事件對象
     */
    function handleClick(event) {
        const cell = event.target;
        const id = parseInt(cell.getAttribute('data-id'));
        const cellData = board[id];

        if (cellData.isRevealed || cellData.isFlagged) return;

        if (cellData.isMine) {
            revealMine(cell);
            alert('遊戲結束！你踩到地雷了！');
            // 遊戲結束邏輯，可以顯示所有地雷
            revealAllMines();
            return;
        }

        revealCell(id);
        checkWin();
    }

    /**
     * 處理右鍵點擊事件 (標記地雷)
     * @param {Event} event - 右鍵點擊事件對象
     */
    function handleRightClick(event) {
        event.preventDefault(); // 阻止默認右鍵菜單
        const cell = event.target;
        const id = parseInt(cell.getAttribute('data-id'));
        const cellData = board[id];

        if (cellData.isRevealed) return;

        cellData.isFlagged = !cellData.isFlagged;
        if (cellData.isFlagged) {
            cell.classList.add('flagged');
            cell.textContent = '🚩';
        } else {
            cell.classList.remove('flagged');
            cell.textContent = '';
        }
        checkWin();
    }

    /**
     * 揭示單元格
     * @param {number} id - 單元格的ID
     */
    function revealCell(id) {
        const cell = gameBoard.children[id];
        const cellData = board[id];

        if (cellData.isRevealed || cellData.isFlagged) return;

        cellData.isRevealed = true;
        cell.classList.add('revealed');

        if (cellData.surroundingMines > 0) {
            cell.textContent = cellData.surroundingMines;
        } else {
            // 如果周圍沒有地雷，則遞歸揭示周圍的單元格
            const row = Math.floor(id / boardSize);
            const col = id % boardSize;

            for (let r = -1; r <= 1; r++) {
                for (let c = -1; c <= 1; c++) {
                    const newRow = row + r;
                    const newCol = col + c;
                    const newIndex = newRow * boardSize + newCol;

                    if (newRow >= 0 && newRow < boardSize &&
                        newCol >= 0 && newCol < boardSize &&
                        !board[newIndex].isRevealed) {
                        revealCell(newIndex);
                    }
                }
            }
        }
    }

    /**
     * 揭示地雷
     * @param {HTMLElement} cell - 地雷單元格的DOM元素
     */
    function revealMine(cell) {
        cell.classList.add('mine');
        cell.textContent = '💣';
    }

    /**
     * 揭示所有地雷 (遊戲結束時)
     */
    function revealAllMines() {
        minesLocation.forEach(id => {
            const cell = gameBoard.children[id];
            revealMine(cell);
        });
    }

    /**
     * 檢查遊戲是否勝利
     */
    function checkWin() {
        let revealedCount = 0;
        let correctFlags = 0;

        for (let i = 0; i < boardSize * boardSize; i++) {
            if (board[i].isRevealed && !board[i].isMine) {
                revealedCount++;
            }
            if (board[i].isFlagged && board[i].isMine) {
                correctFlags++;
            }
        }

        // 勝利條件：所有非地雷單元格都被揭示，或者所有地雷都被正確標記
        if (revealedCount === (boardSize * boardSize - numberOfMines) || correctFlags === numberOfMines) {
            alert('恭喜你，你贏了！');
            // 遊戲勝利邏輯
        }
    }

    // 遊戲開始時初始化
    initializeGame();
});