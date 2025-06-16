document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.querySelector('.grid-container');
    const scoreDisplay = document.getElementById('score');
    const gameOverOverlay = document.querySelector('.game-over-overlay');
    const restartButton = document.getElementById('restart-button');
    const gridSize = 4;
    let board = [];
    let score = 0;
    let isGameOver = false;

    // Initialize the game board
    function initializeBoard() {
        board = Array(gridSize).fill(0).map(() => Array(gridSize).fill(0));
        score = 0;
        scoreDisplay.textContent = score;
        isGameOver = false;
        gameOverOverlay.style.display = 'none';
        renderBoard();
        addRandomTile();
        addRandomTile();
    }

    // Render the board in the DOM
    function renderBoard() {
        gridContainer.innerHTML = '';
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                const cell = document.createElement('div');
                cell.classList.add('grid-cell');
                gridContainer.appendChild(cell);

                if (board[r][c] !== 0) {
                    const tile = document.createElement('div');
                    tile.classList.add('tile', `tile-${board[r][c]}`);
                    tile.textContent = board[r][c];
                    // Calculate position based on grid layout
                    const gameContainerPadding = 10; // From style.css .game-container padding
                    const gridGap = 10; // From style.css .grid-container gap
                    const gameContainerWidth = 400; // From style.css .game-container width
                    const effectiveGridWidth = gameContainerWidth - (2 * gameContainerPadding); // 400 - 20 = 380
                    const cellSize = (effectiveGridWidth - (gridSize - 1) * gridGap) / gridSize; // (380 - 3 * 10) / 4 = 87.5

                    tile.style.left = `${c * (cellSize + gridGap) + gameContainerPadding}px`;
                    tile.style.top = `${r * (cellSize + gridGap) + gameContainerPadding}px`;
                    tile.style.width = `${cellSize}px`;
                    tile.style.height = `${cellSize}px`;
                    gridContainer.appendChild(tile);
                }
            }
        }
    }

    // Add a random tile (2 or 4) to an empty spot
    function addRandomTile() {
        const emptyCells = [];
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                if (board[r][c] === 0) {
                    emptyCells.push({ r, c });
                }
            }
        }

        if (emptyCells.length > 0) {
            const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            board[r][c] = Math.random() < 0.9 ? 2 : 4;
            renderBoard();
        } else if (!canMove()) {
            isGameOver = true;
            gameOverOverlay.style.display = 'flex';
        }
    }

    // Handle keyboard input for movements
    document.addEventListener('keydown', handleKeyPress);

    function handleKeyPress(event) {
        if (isGameOver) return;

        let moved = false;
        switch (event.key) {
            case 'ArrowUp':
                moved = moveUp();
                break;
            case 'ArrowDown':
                moved = moveDown();
                break;
            case 'ArrowLeft':
                moved = moveLeft();
                break;
            case 'ArrowRight':
                moved = moveRight();
                break;
        }

        if (moved) {
            addRandomTile();
            checkGameOver();
        }
    }

    // Helper function to slide tiles
    // Helper function to slide tiles to the end (for Down and Right moves)
    function slideToEnd(row) {
        let newRow = row.filter(val => val !== 0);
        let missing = gridSize - newRow.length;
        let zeros = Array(missing).fill(0);
        return zeros.concat(newRow);
    }

    // Helper function to slide tiles to the start (for Up and Left moves)
    function slideToStart(row) {
        let newRow = row.filter(val => val !== 0);
        let missing = gridSize - newRow.length;
        let zeros = Array(missing).fill(0);
        return newRow.concat(zeros);
    }

    // Helper function to combine tiles from the end (for Down and Right moves)
    function combineFromEnd(row) {
        for (let i = row.length - 1; i > 0; i--) {
            if (row[i] === row[i - 1] && row[i] !== 0) {
                row[i] *= 2;
                score += row[i];
                row[i - 1] = 0;
            }
        }
        scoreDisplay.textContent = score;
        return row;
    }

    // Helper function to combine tiles from the start (for Up and Left moves)
    function combineFromStart(row) {
        for (let i = 0; i < row.length - 1; i++) {
            if (row[i] === row[i + 1] && row[i] !== 0) {
                row[i] *= 2;
                score += row[i];
                row[i + 1] = 0;
            }
        }
        scoreDisplay.textContent = score;
        return row;
    }

    // Move functions
    function moveUp() {
        let moved = false;
        let originalBoard = JSON.parse(JSON.stringify(board)); // Deep copy

        for (let c = 0; c < gridSize; c++) {
            let column = [];
            for (let r = 0; r < gridSize; r++) {
                column.push(board[r][c]);
            }
            let newColumn = slideToStart(column);
            newColumn = combineFromStart(newColumn);
            newColumn = slideToStart(newColumn);

            for (let r = 0; r < gridSize; r++) {
                board[r][c] = newColumn[r];
            }
        }
        moved = JSON.stringify(originalBoard) !== JSON.stringify(board);
        renderBoard();
        return moved;
    }

    function moveDown() {
        let moved = false;
        let originalBoard = JSON.parse(JSON.stringify(board));

        for (let c = 0; c < gridSize; c++) {
            let column = [];
            for (let r = 0; r < gridSize; r++) {
                column.push(board[r][c]);
            }
            let newColumn = slideToEnd(column);
            newColumn = combineFromEnd(newColumn);
            newColumn = slideToEnd(newColumn);
            for (let r = 0; r < gridSize; r++) {
                board[r][c] = newColumn[r];
            }
        }
        moved = JSON.stringify(originalBoard) !== JSON.stringify(board);
        renderBoard();
        return moved;
    }

    function moveLeft() {
        let moved = false;
        let originalBoard = JSON.parse(JSON.stringify(board));

        for (let r = 0; r < gridSize; r++) {
            let row = board[r];
            let newRow = slideToStart(row);
            newRow = combineFromStart(newRow);
            newRow = slideToStart(newRow);
            board[r] = newRow;
        }
        moved = JSON.stringify(originalBoard) !== JSON.stringify(board);
        renderBoard();
        return moved;
    }

    function moveRight() {
        let moved = false;
        let originalBoard = JSON.parse(JSON.stringify(board));

        for (let r = 0; r < gridSize; r++) {
            let row = board[r];
            let newRow = slideToEnd(row);
            newRow = combineFromEnd(newRow);
            newRow = slideToEnd(newRow);
            board[r] = newRow;
        }
        moved = JSON.stringify(originalBoard) !== JSON.stringify(board);
        renderBoard();
        return moved;
    }

    // Check if any moves are possible
    function canMove() {
        // Check for empty cells
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                if (board[r][c] === 0) {
                    return true;
                }
            }
        }

        // Check for possible merges horizontally
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize - 1; c++) {
                if (board[r][c] === board[r][c + 1]) {
                    return true;
                }
            }
        }

        // Check for possible merges vertically
        for (let c = 0; c < gridSize; c++) {
            for (let r = 0; r < gridSize - 1; r++) {
                if (board[r][c] === board[r + 1][c]) {
                    return true;
                }
            }
        }
        return false;
    }

    // Check if game is over
    function checkGameOver() {
        if (!canMove()) {
            isGameOver = true;
            gameOverOverlay.style.display = 'flex';
        }
    }

    // Restart game
    restartButton.addEventListener('click', initializeBoard);

    // Initial game setup
    initializeBoard();
});