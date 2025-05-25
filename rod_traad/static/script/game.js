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
    let out = false;
    if (this.selected.includes(word)) {
      this.selected = this.selected.filter((w) => w !== word);
      out = true;
    } else if (this.selected.length < 4) {
      this.selected.push(word);
      out = true;
    }
    this.ui.submitButton.setDisabled(this.selected.length !== 4);
    return out;
  }

  deselectWord(word) {
    this.selected = this.selected.filter((w) => w !== word);
    this.ui.submitButton.setDisabled(this.selected.length !== 4);
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

    for (const [index, [name, solution]] of Object.entries(
      solutions
    ).entries()) {
      const difference = solution.filter(
        (item) => !this.selected.includes(item)
      );

      if (difference.length === 0) {
        correct = true;
        this.selected = [];
        const solvedGroup = { index: index + 1, name, words: solution };
        this.gameState.solved.push(solvedGroup);
        this.gameState.saveToLocalStorage();
        await this.ui.puzzle.animateSolve(solvedGroup);
        break; // assuming only one correct match is possible
      } else if (difference.length === 1) {
        oneAway = true;
      }
    }
    if (!correct) {
      this.gameState.guesses.push(this.selected);
      this.gameState.saveToLocalStorage();

      const toastMessage =
        oneAway && !this.isGameLost() ? "Én unna!" : undefined;
      await this.ui.animateError(this.selected, toastMessage);

      this.ui.draw();

      if (this.isGameLost()) {
        this.ui.addToast("Du har tapt!");
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await this.ui.animateGameOver();
      }
    }
  }

  isGameOver() {
    return this.isGameWon() || this.isGameLost();
  }

  isGameWon() {
    return this.gameState.solved.length === Object.keys(solutions).length;
  }

  isGameLost() {
    return this.gameState.mistakes >= this.maxMistakes;
  }
}
