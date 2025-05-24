import { areArraysEqual } from "./utils.js";
import { UI } from "./ui/ui.js";

export class GameState {
  constructor(puzzleDate, solved, guesses) {
    this.puzzleDate = puzzleDate || null;
    this.solved = solved || [];
    this.guesses = guesses || [];
  }

  static fromLocalStorage() {
    try {
      const savedState = localStorage.getItem("gameState");
      if (!savedState) return new GameState();

      const parsed = JSON.parse(savedState);
      const { puzzleDate = null, solved = {}, guesses = [] } = parsed;

      return new GameState(puzzleDate, solved, guesses);
    } catch (error) {
      console.warn("Failed to parse game state from localStorage:", error);
      return new GameState();
    }
  }

  saveToLocalStorage() {
    try {
      const state = JSON.stringify({
        puzzleDate: this.puzzleDate,
        solved: this.solved,
        guesses: this.guesses,
      });
      localStorage.setItem("gameState", state);
    } catch (error) {
      console.error("Failed to save game state to localStorage:", error);
    }
  }

  get mistakes() {
    return this.guesses.length;
  }
}

export class Game {
  constructor(gameState) {
    this.gameState = gameState;
    this.selected = [];
    this.maxMistakes = 4;
    this.ui = new UI(this);
  }

  toggleWord(word) {
    if (this.selected.includes(word)) {
      this.selected = this.selected.filter((w) => w !== word);
      return true;
    } else if (this.selected.length < 4) {
      this.selected.push(word);
      return true;
    }
    return false;
  }

  async makeGuess() {
    if (
      this.gameState.guesses.some((guess) =>
        areArraysEqual(guess, this.selected)
      ) ||
      this.selected.length !== 4
    ) {
      this.ui.addToast("Allerede gjettet.");
      return;
    }

    let correct = false;
    let oneAway = false;

    Object.entries(solutions).forEach(([name, solution], index) => {
      const arrayDifference = this.selected.filter(
        (item) => !solution.includes(item)
      );
      if (arrayDifference.length === 0) {
        correct = true;
        this.selected = [];
        this.gameState.solved.push({
          index: index + 1,
          name: name,
          words: solution,
        });
        this.gameState.saveToLocalStorage();
        this.ui.puzzle.animateSolve({
          index: index + 1,
          name: name,
          words: solution,
        });
        this.ui.draw();
      } else if (arrayDifference.length === 1) {
        oneAway = true;
      }
    });

    if (!correct) {
      this.gameState.guesses.push(this.selected);
      this.gameState.saveToLocalStorage();

      const toastMessage = oneAway ? "Én unna!" : undefined;
      await this.ui.animateError(this.selected, toastMessage);

      this.ui.draw();
    }
  }

  get isGameOver() {
    return this.isGameWon || this.isGameLost;
  }

  get isGameWon() {
    return this.gameState.solved.length === Object.keys(solutions).length;
  }

  get isGameLost() {
    return this.gameState.mistakes >= this.maxMistakes;
  }
}
