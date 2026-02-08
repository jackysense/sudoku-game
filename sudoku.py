#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Sudoku Game - A text-based Sudoku puzzle game
Features:
- Generate complete Sudoku puzzles
- Support for multiple difficulty levels
- Input numbers
- Validate Sudoku rules
"""

import random
import copy

class SudokuGenerator:
    """Generate and manipulate Sudoku puzzles"""
    
    def __init__(self):
        self.base_grid = None
        
    def generate_base_grid(self):
        """Generate a valid solved Sudoku grid"""
        # Generate a valid base pattern
        base = list(range(1, 10))
        random.shuffle(base)
        
        # Create a valid grid using backtracking
        self.base_grid = [[0] * 9 for _ in range(9)]
        self._fill_grid(self.base_grid)
        return self.base_grid
    
    def _fill_grid(self, grid, row=0, col=0):
        """Fill grid with valid numbers using backtracking"""
        if row == 9:
            return True
        
        next_row = row if col < 8 else row + 1
        next_col = (col + 1) % 9
        
        numbers = list(range(1, 10))
        random.shuffle(numbers)
        
        for num in numbers:
            if self._is_valid(grid, row, col, num):
                grid[row][col] = num
                if self._fill_grid(grid, next_row, next_col):
                    return True
                grid[row][col] = 0
        
        return False
    
    def _is_valid(self, grid, row, col, num):
        """Check if placing num at (row, col) is valid"""
        # Check row
        if num in grid[row]:
            return False
        
        # Check column
        for i in range(9):
            if grid[i][col] == num:
                return False
        
        # Check 3x3 box
        box_row, box_col = 3 * (row // 3), 3 * (col // 3)
        for i in range(box_row, box_row + 3):
            for j in range(box_col, box_col + 3):
                if grid[i][j] == num:
                    return False
        
        return True
    
    def create_puzzle(self, difficulty='medium'):
        """Create a puzzle by removing numbers from solved grid"""
        if self.base_grid is None:
            self.generate_base_grid()
        
        # Copy the solved grid
        puzzle = copy.deepcopy(self.base_grid)
        
        # Number of cells to remove based on difficulty
        difficulty_map = {
            'easy': 30,
            'medium': 45,
            'hard': 55,
            'expert': 65
        }
        
        cells_to_remove = difficulty_map.get(difficulty, 45)
        
        # Remove cells
        positions = [(i, j) for i in range(9) for j in range(9)]
        random.shuffle(positions)
        
        for i in range(cells_to_remove):
            if positions:
                row, col = positions.pop()
                puzzle[row][col] = 0
        
        return puzzle


class SudokuGame:
    """Main Sudoku game class"""
    
    def __init__(self):
        self.generator = SudokuGenerator()
        self.solution = None
        self.puzzle = None
        self.player_grid = None
    
    def start(self):
        """Start the game"""
        print("=" * 50)
        print("     🧩 Welcome to Sudoku! 🧩")
        print("=" * 50)
        print()
        
        while True:
            print("\nMain Menu:")
            print("1. New Game")
            print("2. Rules")
            print("3. Exit")
            print()
            
            choice = input("Enter your choice (1-3): ").strip()
            
            if choice == '1':
                self.new_game()
            elif choice == '2':
                self.show_rules()
            elif choice == '3':
                print("\n👋 Thanks for playing! Goodbye!")
                break
            else:
                print("\n❌ Invalid choice. Please try again.")
    
    def new_game(self):
        """Start a new game"""
        print("\nSelect Difficulty:")
        print("1. Easy")
        print("2. Medium")
        print("3. Hard")
        print("4. Expert")
        print()
        
        difficulty_map = {
            '1': 'easy',
            '2': 'medium',
            '3': 'hard',
            '4': 'expert'
        }
        
        difficulty_choice = input("Enter difficulty (1-4): ").strip()
        difficulty = difficulty_map.get(difficulty_choice, 'medium')
        
        print(f"\n🎮 Starting new game with {difficulty.capitalize()} difficulty...")
        
        # Generate puzzle
        self.puzzle = self.generator.create_puzzle(difficulty)
        self.solution = copy.deepcopy(self.generator.base_grid)
        self.player_grid = copy.deepcopy(self.puzzle)
        
        self.play_game()
    
    def play_game(self):
        """Main game loop"""
        while True:
            self.display_grid()
            
            if self.check_win():
                print("\n🎉 Congratulations! You solved the Sudoku!")
                print("=" * 50)
                return
            
            print("\nCommands:")
            print("- Enter 'r c v' to place value v at row r, column c")
            print("- Enter 's' to show solution (gives up)")
            print("- Enter 'n' for new game")
            print("- Enter 'm' for main menu")
            print()
            
            command = input("Enter command: ").strip().lower()
            
            if command == 'm':
                return
            
            elif command == 'n':
                self.new_game()
                return
            
            elif command == 's':
                print("\nSolution:")
                self.display_grid(show_solution=True)
                print("\n💡 Better luck next time!")
                return
            
            else:
                # Try to parse as "r c v"
                parts = command.split()
                if len(parts) == 3:
                    try:
                        r, c, v = map(int, parts)
                        if 1 <= r <= 9 and 1 <= c <= 9 and 1 <= v <= 9:
                            if self.puzzle[r-1][c-1] == 0:  # Can only modify empty cells
                                self.player_grid[r-1][c-1] = v
                                print(f"\n✅ Placed {v} at ({r}, {c})")
                            else:
                                print("\n❌ This cell is fixed and cannot be changed!")
                        else:
                            print("\n❌ Invalid input! Rows, columns, and values must be 1-9.")
                    except ValueError:
                        print("\n❌ Invalid command format! Use 'r c v' format.")
                else:
                    print("\n❌ Invalid command! Use 'r c v' format or menu commands.")
    
    def display_grid(self, show_solution=False):
        """Display the Sudoku grid"""
        print("\n   " + " ".join([str(i) for i in range(1, 10)]))
        print("  " + "─" * 19)
        
        for i in range(9):
            if i > 0 and i % 3 == 0:
                print("  " + "─" * 19)
            
            row_display = []
            for j in range(9):
                if j % 3 == 0:
                    row_display.append("│")
                
                value = self.solution[i][j] if show_solution else self.puzzle[i][j]
                player_value = self.player_grid[i][j]
                
                if show_solution:
                    display_val = value if value != 0 else "."
                else:
                    if value != 0:
                        display_val = str(value)
                    elif player_value != 0:
                        display_val = f"\033[92m{player_value}\033[0m"  # Green for player input
                    else:
                        display_val = "."
                
                row_display.append(display_val)
            
            row_display.append("│")
            print(f"{i+1} " + " ".join(row_display))
        
        print("  " + "─" * 19)
        print("\nLegend: Numbers = Fixed, \033[92mGreen\033[0m = Your input, . = Empty")
    
    def check_win(self):
        """Check if the player has won"""
        for i in range(9):
            for j in range(9):
                if self.player_grid[i][j] != self.solution[i][j]:
                    return False
        return True
    
    def show_rules(self):
        """Show Sudoku rules"""
        print("\n" + "=" * 50)
        print("     📖 Sudoku Rules 📖")
        print("=" * 50)
        print("""
The objective is to fill a 9×9 grid with digits 
so that each column, each row, and each of the 
nine 3×3 subgrids that compose the grid contain 
all of the digits from 1 to 9 without repetition.

How to Play:
- Enter row number, column number, and value
  (e.g., "1 5 9" places 9 in row 1, column 5)
- Use only empty cells (marked with .)
- Press Enter after each move
- Complete the puzzle without breaking the rules!

Good luck! 🍀
""")
        print("=" * 50)


if __name__ == "__main__":
    game = SudokuGame()
    game.start()
