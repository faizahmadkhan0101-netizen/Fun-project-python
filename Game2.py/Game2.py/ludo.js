// Game State
const gameState = {
    players: [],
    currentPlayerIndex: 0,
    diceValue: 0,
    selectedPiece: null,
    gameStarted: false,
    movablePieces: [],
    pathCells: []
};

// Game Configuration
const COLORS = ['red', 'green', 'yellow', 'blue'];
const START_POSITIONS = {
    green: 0,   // Green start - arrow pointing RIGHT (→)
    yellow: 13, // Yellow start - arrow pointing DOWN (↓)
    blue: 26,   // Blue start - arrow pointing LEFT (←)
    red: 39     // Red start - arrow pointing UP (↑)
};

const SAFE_POSITIONS = [0, 9, 13, 22, 26, 35, 39, 48]; // Star positions on board
const HOME_STRETCH_ENTRY = {
    green: 51,  // Entry before position 0
    yellow: 12, // Entry before position 13
    blue: 25,   // Entry before position 26
    red: 38     // Entry before position 39
};

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    setupPlayerSelection();
    createBoard();
});

// Player Selection
function setupPlayerSelection() {
    const playerCountBtns = document.querySelectorAll('.player-count-btn');
    const colorSelection = document.getElementById('colorSelection');
    const startGameBtn = document.getElementById('startGameBtn');
    
    playerCountBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            playerCountBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            const playerCount = parseInt(btn.dataset.players);
            showColorSelection(playerCount);
            colorSelection.style.display = 'block';
        });
    });
    
    startGameBtn.addEventListener('click', startGame);
}

function showColorSelection(playerCount) {
    const container = document.getElementById('colorSelectionContainer');
    container.innerHTML = '';
    
    for (let i = 0; i < playerCount; i++) {
        const row = document.createElement('div');
        row.className = 'player-color-row';
        row.innerHTML = `
            <label>Player ${i + 1}:</label>
            ${COLORS.map(color => `
                <div class="color-option ${color}" data-player="${i}" data-color="${color}"></div>
            `).join('')}
        `;
        container.appendChild(row);
    }
    
    // Add click handlers for color selection
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', (e) => {
            const playerIndex = e.target.dataset.player;
            const color = e.target.dataset.color;
            selectColor(playerIndex, color);
        });
    });
}

function selectColor(playerIndex, color) {
    // Remove previous selection for this player
    const playerOptions = document.querySelectorAll(`.color-option[data-player="${playerIndex}"]`);
    playerOptions.forEach(opt => opt.classList.remove('selected'));
    
    // Check if color is already taken
    const allSelected = document.querySelectorAll('.color-option.selected');
    const colorTaken = Array.from(allSelected).some(opt => 
        opt.dataset.color === color && opt.dataset.player !== playerIndex
    );
    
    if (colorTaken) {
        showMessage('This color is already taken!');
        return;
    }
    
    // Select the color
    const selectedOption = document.querySelector(`.color-option[data-player="${playerIndex}"][data-color="${color}"]`);
    selectedOption.classList.add('selected');
    
    // Update disabled states
    updateColorAvailability();
}

function updateColorAvailability() {
    const allOptions = document.querySelectorAll('.color-option');
    const selected = document.querySelectorAll('.color-option.selected');
    const selectedColors = Array.from(selected).map(opt => opt.dataset.color);
    
    allOptions.forEach(opt => {
        if (!opt.classList.contains('selected')) {
            if (selectedColors.includes(opt.dataset.color)) {
                opt.classList.add('disabled');
            } else {
                opt.classList.remove('disabled');
            }
        }
    });
}

function startGame() {
    const selectedColors = document.querySelectorAll('.color-option.selected');
    const playerCount = document.querySelectorAll('.player-color-row').length;
    
    if (selectedColors.length !== playerCount) {
        showMessage('Please select a color for each player!');
        return;
    }
    
    // Create players
    gameState.players = [];
    const colorsByPlayer = {};
    
    selectedColors.forEach(opt => {
        const playerIndex = parseInt(opt.dataset.player);
        colorsByPlayer[playerIndex] = opt.dataset.color;
    });
    
    for (let i = 0; i < playerCount; i++) {
        gameState.players.push({
            id: i,
            color: colorsByPlayer[i],
            pieces: [
                { id: 0, position: -1, isHome: true, inHomeStretch: false, homeStretchPosition: -1, finished: false },
                { id: 1, position: -1, isHome: true, inHomeStretch: false, homeStretchPosition: -1, finished: false },
                { id: 2, position: -1, isHome: true, inHomeStretch: false, homeStretchPosition: -1, finished: false },
                { id: 3, position: -1, isHome: true, inHomeStretch: false, homeStretchPosition: -1, finished: false }
            ],
            needsSix: true
        });
    }
    
    // Hide selection, show board
    document.getElementById('playerSelection').style.display = 'none';
    document.getElementById('gameBoard').style.display = 'block';
    
    gameState.gameStarted = true;
    gameState.currentPlayerIndex = 0;
    
    updateCurrentPlayerDisplay();
    showMessage(`${getCurrentPlayer().color.toUpperCase()}'s turn! Roll the dice.`);
    
    // Setup dice roll
    document.getElementById('rollDiceBtn').addEventListener('click', rollDice);
    document.getElementById('resetGameBtn').addEventListener('click', resetGame);
}

// Board Creation
function createBoard() {
    const pathGrid = document.querySelector('.path-grid');
    
    // Create 15x15 grid
    for (let row = 0; row < 15; row++) {
        for (let col = 0; col < 15; col++) {
            const cell = document.createElement('div');
            cell.className = 'path-cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            // Determine if this cell is part of the path
            const pathInfo = getPathInfo(row, col);
            if (pathInfo) {
                cell.classList.add('path');
                cell.dataset.position = pathInfo.position;
                if (pathInfo.safe) cell.classList.add('safe');
                if (pathInfo.start) cell.classList.add(`start-${pathInfo.color}`);
                if (pathInfo.type === 'homeStretch') {
                    cell.classList.add(`home-stretch-${pathInfo.color}`);
                    cell.dataset.homeStretch = pathInfo.color;
                    cell.dataset.homePosition = pathInfo.homePosition;
                }
            }
            
            pathGrid.appendChild(cell);
            gameState.pathCells.push(cell);
        }
    }
}

function getPathInfo(row, col) {
    // Ludo board is 15x15 grid (matching reference image exactly)
    // Main path: 52 positions around the board (0-51)
    // GREEN (top-left), YELLOW (top-right), RED (bottom-left), BLUE (bottom-right)
    
    // Complete path based on reference image
    const pathMap = [
        // GREEN section - starts with arrow pointing RIGHT (→)
        [6, 1],   // 0 - GREEN START (arrow →)
        [6, 2],   // 1
        [6, 3],   // 2
        [6, 4],   // 3
        [6, 5],   // 4
        [5, 5],   // 5 - going up
        [4, 5],   // 6
        [3, 5],   // 7
        [2, 5],   // 8
        [1, 5],   // 9 - STAR (safe)
        [0, 5],   // 10
        [0, 6],   // 11 - corner, turn right
        [0, 7],   // 12
        
        // YELLOW section - starts with arrow pointing DOWN (↓)
        [1, 7],   // 13 - YELLOW START (arrow ↓)
        [2, 7],   // 14
        [3, 7],   // 15
        [4, 7],   // 16
        [5, 7],   // 17
        [5, 8],   // 18 - going right
        [5, 9],   // 19
        [5, 10],  // 20
        [5, 11],  // 21
        [5, 12],  // 22 - STAR (safe)
        [5, 13],  // 23
        [6, 13],  // 24 - corner, turn down
        [7, 13],  // 25
        
        // BLUE section - starts with arrow pointing LEFT (←)
        [7, 12],  // 26 - BLUE START (arrow ←)
        [7, 11],  // 27
        [7, 10],  // 28
        [7, 9],   // 29
        [7, 8],   // 30
        [8, 8],   // 31 - going down
        [9, 8],   // 32
        [10, 8],  // 33
        [11, 8],  // 34
        [12, 8],  // 35 - STAR (safe)
        [13, 8],  // 36
        [13, 7],  // 37 - corner, turn left
        [13, 6],  // 38
        
        // RED section - starts with arrow pointing UP (↑)
        [12, 6],  // 39 - RED START (arrow ↑)
        [11, 6],  // 40
        [10, 6],  // 41
        [9, 6],   // 42
        [8, 6],   // 43
        [8, 5],   // 44 - going left
        [8, 4],   // 45
        [8, 3],   // 46
        [8, 2],   // 47
        [8, 1],   // 48 - STAR (safe)
        [8, 0],   // 49
        [7, 0],   // 50 - corner, turn up
        [6, 0]    // 51 - connects back to position 0
    ];
    
    // Check if current cell is in the main path
    for (let i = 0; i < pathMap.length; i++) {
        const [pathRow, pathCol] = pathMap[i];
        if (row === pathRow && col === pathCol) {
            const info = {
                position: i,
                safe: false,
                start: false,
                color: null
            };
            
            // Mark starting positions based on reference image
            if (i === 0) {  // Green start (→)
                info.start = true;
                info.color = 'green';
            } else if (i === 13) {  // Yellow start (↓)
                info.start = true;
                info.color = 'yellow';
            } else if (i === 26) {  // Blue start (←)
                info.start = true;
                info.color = 'blue';
            } else if (i === 39) {  // Red start (↑)
                info.start = true;
                info.color = 'red';
            }
            
            // Mark safe positions (stars)
            if (i === 9 || i === 22 || i === 35 || i === 48) {
                info.safe = true;
            }
            
            return info;
        }
    }
    
    // Home stretches (colored paths to center) - based on reference image
    // Green home stretch (row 6, columns 6-10) - going RIGHT towards center
    if (row === 6 && col >= 6 && col <= 10) {
        return { 
            type: 'homeStretch', 
            color: 'green', 
            homePosition: col - 6 
        };
    }
    
    // Yellow home stretch (column 6, rows 6-10) - going DOWN towards center
    if (col === 6 && row >= 6 && row <= 10) {
        return { 
            type: 'homeStretch', 
            color: 'yellow', 
            homePosition: row - 6 
        };
    }
    
    // Blue home stretch (row 7, columns 3-7) - going LEFT towards center
    if (row === 7 && col >= 3 && col <= 7) {
        return { 
            type: 'homeStretch', 
            color: 'blue', 
            homePosition: 7 - col 
        };
    }
    
    // Red home stretch (column 7, rows 3-7) - going UP towards center
    if (col === 7 && row >= 3 && row <= 7) {
        return { 
            type: 'homeStretch', 
            color: 'red', 
            homePosition: 7 - row 
        };
    }
    
    return null;
}

// Game Logic
function getCurrentPlayer() {
    return gameState.players[gameState.currentPlayerIndex];
}

function updateCurrentPlayerDisplay() {
    const player = getCurrentPlayer();
    document.getElementById('currentPlayerName').textContent = player.color.toUpperCase();
    const indicator = document.getElementById('currentPlayerIndicator');
    indicator.style.backgroundColor = player.color;
}

function rollDice() {
    const diceBtn = document.getElementById('rollDiceBtn');
    const dice = document.getElementById('dice');
    const diceFace = dice.querySelector('.dice-face');
    
    diceBtn.disabled = true;
    dice.classList.add('rolling');
    
    // Simulate rolling animation
    let rolls = 0;
    const rollInterval = setInterval(() => {
        const randomValue = Math.floor(Math.random() * 6) + 1;
        diceFace.textContent = randomValue;
        rolls++;
        
        if (rolls >= 10) {
            clearInterval(rollInterval);
            const finalValue = Math.floor(Math.random() * 6) + 1;
            diceFace.textContent = finalValue;
            gameState.diceValue = finalValue;
            dice.classList.remove('rolling');
            
            document.getElementById('diceResult').textContent = `You rolled a ${finalValue}!`;
            
            handleDiceRoll(finalValue);
        }
    }, 100);
}

function handleDiceRoll(value) {
    const player = getCurrentPlayer();
    
    // Check if player needs a 6 to unlock pieces
    if (player.needsSix && value !== 6) {
        const allHome = player.pieces.every(p => p.isHome);
        if (allHome) {
            showMessage(`${player.color.toUpperCase()} needs a 6 to start! Next player's turn.`);
            setTimeout(() => nextTurn(), 2000);
            return;
        }
    }
    
    // Find movable pieces
    gameState.movablePieces = getMovablePieces(player, value);
    
    if (gameState.movablePieces.length === 0) {
        showMessage(`${player.color.toUpperCase()} has no valid moves! Next player's turn.`);
        setTimeout(() => nextTurn(), 2000);
        return;
    }
    
    // Highlight movable pieces
    highlightMovablePieces();
    showMessage(`${player.color.toUpperCase()}, select a piece to move!`);
}

function getMovablePieces(player, diceValue) {
    const movable = [];
    
    player.pieces.forEach((piece, index) => {
        // If piece is at home and rolled a 6, can move out
        if (piece.isHome && diceValue === 6) {
            movable.push(index);
        }
        // If piece is on board and not finished
        else if (!piece.isHome && !piece.finished) {
            // Check if move is valid
            if (piece.inHomeStretch) {
                if (piece.homeStretchPosition + diceValue <= 5) {
                    movable.push(index);
                }
            } else {
                movable.push(index);
            }
        }
    });
    
    return movable;
}

function highlightMovablePieces() {
    const player = getCurrentPlayer();
    
    // Remove previous highlights
    document.querySelectorAll('.piece').forEach(p => {
        p.classList.remove('selectable');
        p.onclick = null;
        p.ontouchstart = null;
    });
    
    // Highlight movable pieces
    gameState.movablePieces.forEach(pieceIndex => {
        const pieceElement = document.querySelector(`[data-piece="${player.color}-${pieceIndex}"]`);
        if (pieceElement) {
            pieceElement.classList.add('selectable');
            
            // Handle both click and touch events
            const handleMove = (e) => {
                e.preventDefault();
                e.stopPropagation();
                movePiece(pieceIndex);
            };
            
            pieceElement.onclick = handleMove;
            pieceElement.ontouchstart = handleMove;
        }
    });
}

function movePiece(pieceIndex) {
    const player = getCurrentPlayer();
    const piece = player.pieces[pieceIndex];
    const diceValue = gameState.diceValue;
    
    // Remove highlights
    document.querySelectorAll('.piece').forEach(p => {
        p.classList.remove('selectable');
        p.onclick = null;
        p.ontouchstart = null;
    });
    
    // Get the piece element for animation
    const pieceElement = document.querySelector(`[data-piece="${player.color}-${pieceIndex}"]`);
    
    // Add jumping animation
    if (pieceElement) {
        pieceElement.classList.add('jumping');
        setTimeout(() => pieceElement.classList.remove('jumping'), 500);
    }
    
    // If piece is at home, move to start position
    if (piece.isHome) {
        piece.isHome = false;
        piece.position = START_POSITIONS[player.color];
        player.needsSix = false;
        showMessage(`${player.color.toUpperCase()} piece enters the board!`);
        
        // Animate piece movement with delay
        setTimeout(() => {
            updateBoard();
        }, 300);
    } else {
        // Move piece on board step by step for animation
        animatePieceMovement(player, piece, pieceIndex, diceValue);
        return; // Exit here as animation will handle the rest
    }
    
    // Check for captures
    if (!piece.inHomeStretch && !piece.finished) {
        checkForCapture(player, piece);
    }
    
    // Check if player gets another turn (rolled a 6)
    if (diceValue === 6) {
        showMessage(`${player.color.toUpperCase()} rolled a 6! Roll again!`);
        setTimeout(() => {
            document.getElementById('rollDiceBtn').disabled = false;
            document.getElementById('diceResult').textContent = '';
        }, 1500);
    } else {
        setTimeout(() => nextTurn(), 1500);
    }
}

function animatePieceMovement(player, piece, pieceIndex, diceValue) {
    let stepsRemaining = diceValue;
    const stepDelay = 300;
    
    const moveStep = () => {
        if (stepsRemaining <= 0) {
            // Movement complete
            // Check for captures
            if (!piece.inHomeStretch && !piece.finished) {
                checkForCapture(player, piece);
            }
            
            // Update final display
            updateBoard();
            
            // Check if player won
            if (piece.finished && player.pieces.every(p => p.finished)) {
                showMessage(`🏆 ${player.color.toUpperCase()} WINS THE GAME! 🏆`);
                document.getElementById('rollDiceBtn').disabled = true;
                return;
            }
            
            // Check if player gets another turn (rolled a 6)
            if (diceValue === 6) {
                showMessage(`${player.color.toUpperCase()} rolled a 6! Roll again!`);
                setTimeout(() => {
                    document.getElementById('rollDiceBtn').disabled = false;
                    document.getElementById('diceResult').textContent = '';
                }, 1500);
            } else {
                setTimeout(() => nextTurn(), 1500);
            }
            return;
        }
        
        // Move one step
        if (!piece.inHomeStretch && !piece.finished) {
            const homeEntry = HOME_STRETCH_ENTRY[player.color];
            let newPosition = piece.position + 1;
            
            // Check if entering home stretch
            if (piece.position <= homeEntry && newPosition > homeEntry) {
                piece.inHomeStretch = true;
                piece.homeStretchPosition = 0;
            } else if (newPosition > 51) {
                newPosition = 0;
                piece.position = newPosition;
            } else {
                piece.position = newPosition;
            }
        } else if (piece.inHomeStretch) {
            piece.homeStretchPosition += 1;
            
            // Check if reached center (finished)
            if (piece.homeStretchPosition >= 5) {
                piece.finished = true;
                showMessage(`${player.color.toUpperCase()} piece reached home! 🎉`);
            }
        }
        
        // Update display
        updateBoard();
        
        // Add animation class
        const pieceElement = document.querySelector(`.path-cell [data-piece="${player.color}-${pieceIndex}"]`) || 
                            document.querySelector(`[data-piece="${player.color}-${pieceIndex}"]`);
        if (pieceElement) {
            pieceElement.classList.add('moving');
            setTimeout(() => pieceElement.classList.remove('moving'), 400);
        }
        
        stepsRemaining--;
        
        // Continue to next step
        setTimeout(moveStep, stepDelay);
    };
    
    // Start the animation
    moveStep();
}

function checkForCapture(currentPlayer, movedPiece) {
    // Check if any opponent piece is on the same position
    const position = movedPiece.position;
    
    // Safe positions cannot capture
    if (SAFE_POSITIONS.includes(position)) return;
    
    gameState.players.forEach(player => {
        if (player.id !== currentPlayer.id) {
            player.pieces.forEach(piece => {
                if (!piece.isHome && !piece.inHomeStretch && piece.position === position) {
                    // Capture!
                    piece.position = -1;
                    piece.isHome = true;
                    piece.inHomeStretch = false;
                    piece.homeStretchPosition = -1;
                    showMessage(`${currentPlayer.color.toUpperCase()} captured ${player.color.toUpperCase()}'s piece!`);
                }
            });
        }
    });
}

function updateBoard() {
    // Clear all pieces from path cells
    document.querySelectorAll('.path-cell .piece').forEach(p => p.remove());
    
    // Reset all home pieces to visible first
    document.querySelectorAll('.home-pieces .piece').forEach(p => {
        p.style.display = 'block';
    });
    
    // Place all pieces
    gameState.players.forEach(player => {
        player.pieces.forEach((piece, index) => {
            const homeElement = document.querySelector(`.${player.color}-home [data-piece="${player.color}-${index}"]`);
            
            if (!homeElement) return;
            
            if (piece.finished) {
                // Hide finished pieces
                homeElement.style.display = 'none';
            } else if (piece.isHome) {
                // Keep in home area
                homeElement.style.display = 'block';
            } else if (piece.inHomeStretch) {
                // Move to home stretch
                const homeStretchCell = document.querySelector(`[data-home-stretch="${player.color}"][data-home-position="${piece.homeStretchPosition}"]`);
                if (homeStretchCell) {
                    const clone = homeElement.cloneNode(true);
                    clone.classList.remove('selectable');
                    homeElement.style.display = 'none';
                    homeStretchCell.appendChild(clone);
                }
            } else {
                // Move to path position
                const pathCell = document.querySelector(`.path-cell[data-position="${piece.position}"]`);
                if (pathCell) {
                    const clone = homeElement.cloneNode(true);
                    clone.classList.remove('selectable');
                    homeElement.style.display = 'none';
                    pathCell.appendChild(clone);
                } else {
                    console.log(`Path cell not found for position ${piece.position}`);
                }
            }
        });
    });
}

function nextTurn() {
    gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
    updateCurrentPlayerDisplay();
    showMessage(`${getCurrentPlayer().color.toUpperCase()}'s turn! Roll the dice.`);
    document.getElementById('rollDiceBtn').disabled = false;
    document.getElementById('diceResult').textContent = '';
}

function showMessage(message) {
    document.getElementById('gameMessage').textContent = message;
}

function resetGame() {
    location.reload();
}
