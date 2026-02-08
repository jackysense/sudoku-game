// 数独游戏 JavaScript

class SudokuGame {
    constructor() {
        this.board = [];
        this.solution = [];
        this.initialBoard = [];
        this.selectedCell = null;
        this.errors = 0;
        this.maxErrors = 3;
        this.timer = null;
        this.seconds = 0;
        this.isNoteMode = false;
        this.history = [];
        this.notes = Array(81).fill(null).map(() => new Set());
        
        this.difficulty = {
            easy: 38,    // 挖掉的数量
            medium: 47,
            hard: 56,
            expert: 61
        };
        
        this.init();
    }
    
    init() {
        this.createBoard();
        this.bindEvents();
        this.newGame();
    }
    
    // 创建数独棋盘DOM
    createBoard() {
        const boardEl = document.getElementById('board');
        boardEl.innerHTML = '';
        
        for (let i = 0; i < 81; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.index = i;
            boardEl.appendChild(cell);
        }
    }
    
    // 绑定事件
    bindEvents() {
        // 单元格点击
        document.getElementById('board').addEventListener('click', (e) => {
            const cell = e.target.closest('.cell');
            if (cell) {
                this.selectCell(parseInt(cell.dataset.index));
            }
        });
        
        // 数字键盘点击
        document.querySelectorAll('.num-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const num = parseInt(btn.dataset.num);
                this.enterNumber(num);
            });
        });
        
        // 键盘输入
        document.addEventListener('keydown', (e) => {
            if (e.key >= '1' && e.key <= '9') {
                this.enterNumber(parseInt(e.key));
            } else if (e.key === 'Backspace' || e.key === 'Delete') {
                this.erase();
            } else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
                this.undo();
            } else if (e.key === 'ArrowUp' && this.selectedCell !== null) {
                e.preventDefault();
                this.selectCell(Math.max(0, this.selectedCell - 9));
            } else if (e.key === 'ArrowDown' && this.selectedCell !== null) {
                e.preventDefault();
                this.selectCell(Math.min(80, this.selectedCell + 9));
            } else if (e.key === 'ArrowLeft' && this.selectedCell !== null) {
                e.preventDefault();
                this.selectCell(Math.max(0, this.selectedCell - 1));
            } else if (e.key === 'ArrowRight' && this.selectedCell !== null) {
                e.preventDefault();
                this.selectCell(Math.min(80, this.selectedCell + 1));
            }
        });
        
        // 控制按钮
        document.getElementById('undo-btn').addEventListener('click', () => this.undo());
        document.getElementById('erase-btn').addEventListener('click', () => this.erase());
        document.getElementById('note-btn').addEventListener('click', () => this.toggleNoteMode());
        document.getElementById('hint-btn').addEventListener('click', () => this.hint());
        document.getElementById('new-game-btn').addEventListener('click', () => this.newGame());
        
        // 难度选择
        document.getElementById('difficulty').addEventListener('change', () => this.newGame());
        
        // 弹窗按钮
        document.getElementById('play-again-btn').addEventListener('click', () => {
            this.hideModal('win-modal');
            this.newGame();
        });
        
        document.getElementById('try-again-btn').addEventListener('click', () => {
            this.hideModal('game-over-modal');
            this.newGame();
        });
    }
    
    // 生成完整数独
    generateSudoku() {
        // 初始化空棋盘
        this.board = Array(81).fill(0);
        
        // 填充对角线上的三个3x3宫格（互相独立）
        for (let box = 0; box < 9; box += 3) {
            this.fillBox(box * 9 + box % 3 * 3 + Math.floor(box / 3) * 27);
        }
        
        // 求解填充剩余格子
        this.solve();
        this.solution = [...this.board];
        
        // 挖空
        this.puzzle = [...this.board];
        this.removeCells();
    }
    
    // 填充一个3x3宫格
    fillBox(startIndex) {
        const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        this.shuffleArray(nums);
        
        const row = Math.floor(startIndex / 9);
        const col = startIndex % 9;
        
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const idx = (row + i) * 9 + (col + j);
                this.board[idx] = nums[i * 3 + j];
            }
        }
    }
    
    // 洗牌数组
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    // 求解数独
    solve() {
        const emptyIndex = this.board.findIndex(cell => cell === 0);
        if (emptyIndex === -1) return true;
        
        const row = Math.floor(emptyIndex / 9);
        const col = emptyIndex % 9;
        const used = this.getUsedNumbers(row, col);
        
        for (let num = 1; num <= 9; num++) {
            if (!used.has(num)) {
                this.board[emptyIndex] = num;
                if (this.solve()) return true;
                this.board[emptyIndex] = 0;
            }
        }
        
        return false;
    }
    
    // 获取已使用的数字
    getUsedNumbers(row, col) {
        const used = new Set();
        
        // 检查行
        for (let c = 0; c < 9; c++) {
            const val = this.board[row * 9 + c];
            if (val !== 0) used.add(val);
        }
        
        // 检查列
        for (let r = 0; r < 9; r++) {
            const val = this.board[r * 9 + col];
            if (val !== 0) used.add(val);
        }
        
        // 检查3x3宫格
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                const val = this.board[(boxRow + r) * 9 + (boxCol + c)];
                if (val !== 0) used.add(val);
            }
        }
        
        return used;
    }
    
    // 挖空
    removeCells() {
        const difficulty = document.getElementById('difficulty').value;
        const removeCount = this.difficulty[difficulty];
        
        const indices = Array.from({ length: 81 }, (_, i) => i);
        this.shuffleArray(indices);
        
        for (let i = 0; i < removeCount; i++) {
            this.puzzle[indices[i]] = 0;
        }
    }
    
    // 新游戏
    newGame() {
        this.generateSudoku();
        this.initialBoard = [...this.puzzle];
        this.errors = 0;
        this.seconds = 0;
        this.history = [];
        this.notes = Array(81).fill(null).map(() => new Set());
        this.isNoteMode = false;
        this.selectedCell = null;
        
        this.renderBoard();
        this.updateNumberCounts();
        this.updateErrors();
        this.updateTimer();
        this.startTimer();
        this.updateNoteButton();
        this.updateCoordinates();
    }
    
    // 渲染棋盘
    renderBoard() {
        const cells = document.querySelectorAll('.cell');
        const selectedNum = this.selectedCell !== null ? 
            (this.selectedCell !== null && this.puzzle[this.selectedCell] !== 0 ? this.puzzle[this.selectedCell] : null) : null;
        
        cells.forEach((cell, index) => {
            const value = this.puzzle[index];
            const isFixed = this.initialBoard[index] !== 0;
            const isSelected = this.selectedCell === index;
            const row = Math.floor(index / 9);
            const col = index % 9;
            const isSameNumber = selectedNum && value === selectedNum;
            
            cell.className = 'cell';
            cell.innerHTML = '';
            
            if (value !== 0) {
                cell.textContent = value;
                cell.classList.add(isFixed ? 'fixed' : 'user-input');
            } else if (this.notes[index].size > 0) {
                // 显示备注
                for (let n = 1; n <= 9; n++) {
                    if (this.notes[index].has(n)) {
                        const span = document.createElement('span');
                        span.className = 'note-num';
                        span.textContent = n;
                        cell.appendChild(span);
                    }
                }
                cell.classList.add('note');
            }
            
            if (isSelected) {
                cell.classList.add('selected');
            }
            
            // 高亮行列和相同数字
            if (this.selectedCell !== null) {
                const selectedRow = Math.floor(this.selectedCell / 9);
                const selectedCol = this.selectedCell % 9;
                
                if (row === selectedRow || col === selectedCol || isSameNumber) {
                    cell.classList.add('highlighted');
                }
            }
        });
    }
    
    // 选择单元格
    selectCell(index) {
        this.selectedCell = index;
        this.renderBoard();
        this.updateCoordinates();
    }
    
    // 更新坐标显示
    updateCoordinates() {
        const coordEl = document.getElementById('coordinates');
        if (this.selectedCell !== null) {
            const row = String.fromCharCode(65 + Math.floor(this.selectedCell / 9));
            const col = (this.selectedCell % 9) + 1;
            coordEl.textContent = row + col;
        } else {
            coordEl.textContent = '-';
        }
    }
    
    // 输入数字
    enterNumber(num) {
        if (this.selectedCell === null) return;
        if (this.initialBoard[this.selectedCell] !== 0) return; // 固定格子不能修改
        if (this.errors >= this.maxErrors) return;
        
        const index = this.selectedCell;
        const prevValue = this.puzzle[index];
        const prevNote = new Set(this.notes[index]);
        
        if (this.isNoteMode) {
            // 备注模式
            if (prevValue === 0) {
                this.history.push({ index, prevValue, prevNote: new Set(prevNote) });
                if (this.notes[index].has(num)) {
                    this.notes[index].delete(num);
                } else {
                    this.notes[index].add(num);
                }
            }
        } else {
            // 普通模式
            if (prevValue !== 0 || this.notes[index].size > 0) {
                this.history.push({ index, prevValue, prevNote: new Set(prevNote) });
            }
            
            this.puzzle[index] = num;
            this.notes[index].clear();
            
            // 检查错误
            const solution = this.solution[index];
            if (num !== solution) {
                this.errors++;
                this.updateErrors();
                this.showError(index);
                
                if (this.errors >= this.maxErrors) {
                    this.gameOver();
                    return;
                }
            }
            
            // 检查胜利
            this.checkWin();
        }
        
        this.renderBoard();
        this.updateNumberCounts();
    }
    
    // 擦除
    erase() {
        if (this.selectedCell === null) return;
        if (this.initialBoard[this.selectedCell] !== 0) return;
        
        const index = this.selectedCell;
        const prevValue = this.puzzle[index];
        const prevNote = new Set(this.notes[index]);
        
        if (prevValue !== 0 || prevNote.size > 0) {
            this.history.push({ index, prevValue, prevNote });
            this.puzzle[index] = 0;
            this.notes[index].clear();
            
            this.renderBoard();
            this.updateNumberCounts();
        }
    }
    
    // 撤销
    undo() {
        if (this.history.length === 0) return;
        
        const lastAction = this.history.pop();
        this.puzzle[lastAction.index] = lastAction.prevValue;
        this.notes[lastAction.index] = new Set(lastAction.prevNote);
        
        this.renderBoard();
        this.updateNumberCounts();
    }
    
    // 切换备注模式
    toggleNoteMode() {
        this.isNoteMode = !this.isNoteMode;
        this.updateNoteButton();
    }
    
    // 更新备注按钮状态
    updateNoteButton() {
        const noteBtn = document.getElementById('note-btn');
        if (this.isNoteMode) {
            noteBtn.classList.add('active');
        } else {
            noteBtn.classList.remove('active');
        }
    }
    
    // 提示
    hint() {
        if (this.selectedCell === null) return;
        if (this.initialBoard[this.selectedCell] !== 0) return;
        
        const solution = this.solution[this.selectedCell];
        if (solution !== 0) {
            this.history.push({ 
                index: this.selectedCell, 
                prevValue: this.puzzle[this.selectedCell],
                prevNote: new Set(this.notes[this.selectedCell])
            });
            
            this.puzzle[this.selectedCell] = solution;
            this.notes[this.selectedCell].clear();
            
            this.renderBoard();
            this.updateNumberCounts();
            this.checkWin();
        }
    }
    
    // 显示错误
    showError(index) {
        const cells = document.querySelectorAll('.cell');
        cells[index].classList.add('error');
        setTimeout(() => {
            cells[index].classList.remove('error');
        }, 500);
    }
    
    // 更新错误计数
    updateErrors() {
        document.getElementById('errors').textContent = this.errors;
    }
    
    // 更新数字计数
    updateNumberCounts() {
        const countEl = document.getElementById('number-counts');
        countEl.innerHTML = '';
        
        for (let num = 1; num <= 9; num++) {
            const count = this.puzzle.filter(v => v === num).length;
            const total = this.solution.filter(v => v === num).length;
            
            const countDiv = document.createElement('div');
            countDiv.className = 'number-count';
            countDiv.textContent = `${num}:${count}`;
            countDiv.title = `数字 ${num} 已填 ${count}/9`;
            
            if (count === 9) {
                countDiv.classList.add('complete');
            } else if (count > 0) {
                countDiv.classList.add('partial');
            }
            
            countEl.appendChild(countDiv);
        }
    }
    
    // 计时器
    startTimer() {
        if (this.timer) clearInterval(this.timer);
        this.timer = setInterval(() => {
            this.seconds++;
            this.updateTimer();
        }, 1000);
    }
    
    updateTimer() {
        const mins = Math.floor(this.seconds / 60).toString().padStart(2, '0');
        const secs = (this.seconds % 60).toString().padStart(2, '0');
        document.getElementById('timer').textContent = `${mins}:${secs}`;
    }
    
    // 检查胜利
    checkWin() {
        const isComplete = this.puzzle.every((val, idx) => val === this.solution[idx]);
        if (isComplete) {
            clearInterval(this.timer);
            document.getElementById('final-time').textContent = document.getElementById('timer').textContent;
            this.showModal('win-modal');
        }
    }
    
    // 游戏结束
    gameOver() {
        clearInterval(this.timer);
        this.showModal('game-over-modal');
    }
    
    // 显示弹窗
    showModal(id) {
        document.getElementById(id).classList.remove('hidden');
    }
    
    // 隐藏弹窗
    hideModal(id) {
        document.getElementById(id).classList.add('hidden');
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new SudokuGame();
});
