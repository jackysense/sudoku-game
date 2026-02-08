# Sudoku Game
A text-based Sudoku puzzle game with multiple difficulty levels.

## Features
- 🧩 Generate complete Sudoku puzzles
- 🎯 Multiple difficulty levels (Easy, Medium, Hard, Expert)
- ✅ Real-time validation
- 🎮 Interactive command-line interface
- 💡 Hint system (show solution)

## Requirements
- Python 3.6+

## Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/sudoku.git
cd sudoku

# Run the game
python sudoku.py
```

## How to Play
1. Select a difficulty level
2. Enter coordinates and value in the format: `row column value`
   - Example: `1 5 9` places the number 9 at row 1, column 5
3. Complete the puzzle by filling all empty cells with valid numbers
4. Use `s` to reveal the solution and give up
5. Use `n` for a new game

## Controls
- `r c v` - Place value v at row r, column c
- `s` - Show solution (give up)
- `n` - New game
- `m` - Return to main menu

## Rules
The objective is to fill a 9×9 grid with digits so that:
- Each column contains digits 1-9 without repetition
- Each row contains digits 1-9 without repetition
- Each of the nine 3×3 subgrids contains digits 1-9 without repetition

## License
MIT License
