import { areArraysEqual } from "./utils.js";
import { UI } from "./ui/ui.js";
import { MAX_MISTAKES } from "./config.js";

export class GameState {
  constructor(puzzleDate, guesses, selected = null, unsolved = null) {
    this.puzzleDate = puzzleDate || null;
    this.guesses = guesses || [];

    // not part of the saved state, used for UI interactions
    this.selected = selected || [];
    this.unsolved =
      unsolved ||
      puzzleData.grid
        .flat()
        .filter(
          (word) => !this.solved.some((solved) => solved.words.includes(word))
        );
  }

  static fromLocalStorage() {
    try {
      const savedState = localStorage.getItem("gameState");
      if (!savedState) return new GameState();

      const parsed = JSON.parse(savedState);
      const { puzzleDate = null, guesses = [] } = parsed;

      return new GameState(puzzleDate, guesses);
    } catch (error) {
      console.warn("Failed to parse game state from localStorage:", error);
      return new GameState();
    }
  }

  saveToLocalStorage() {
    try {
      const state = JSON.stringify({
        puzzleDate: this.puzzleDate,
        guesses: this.guesses,
      });
      localStorage.setItem("gameState", state);
    } catch (error) {
      console.error("Failed to save game state to localStorage:", error);
    }
  }

  clone() {
    return new GameState(
      this.puzzleDate,
      JSON.parse(JSON.stringify(this.guesses)),
      [...this.selected],
      [...this.unsolved]
    );
  }

  get mistakes() {
    let out = 0;
    for (const guess of this.guesses) {
      const isCorrectGuess = Object.values(solutions).some((solution) =>
        areArraysEqual(guess, solution)
      );
      if (!isCorrectGuess) {
        out++;
      }
    }
    return out;
  }

  get solved() {
    const solved = [];
    for (const guess of this.guesses) {
      for (const [index, [name, solution]] of Object.entries(
        solutions
      ).entries()) {
        if (areArraysEqual(guess, solution)) {
          solved.push({ index: index + 1, name, words: solution });
        }
      }
    }
    return solved;
  }

  isGameOver() {
    return this.isGameWon() || this.isGameLost();
  }

  isGameWon() {
    return this.solved.length === Object.keys(solutions).length;
  }

  isGameLost() {
    return this.mistakes >= MAX_MISTAKES;
  }
}

export class Game {
  constructor(gameState) {
    this.gameState = gameState;
    this.ui = new UI(
      this.makeGuess.bind(this),
      this.toggleWord.bind(this),
      this.deselectWord.bind(this),
      this.gameState
    );
  }

  toggleWord(word) {
    let out = false;
    if (this.gameState.selected.includes(word)) {
      this.gameState.selected = this.gameState.selected.filter(
        (w) => w !== word
      );
      out = true;
    } else if (this.gameState.selected.length < 4) {
      this.gameState.selected.push(word);
      out = true;
    }
    this.ui.gameBottom.submitButton.setDisabled(
      this.gameState.selected.length !== 4
    );
    return out;
  }

  deselectWord(word) {
    this.gameState.selected = this.gameState.selected.filter((w) => w !== word);
    this.ui.gameBottom.submitButton.setDisabled(
      this.gameState.selected.length !== 4
    );
  }

  async makeGuess() {
    if (
      this.gameState.guesses.some((guess) =>
        areArraysEqual(guess, this.gameState.selected)
      ) ||
      this.gameState.selected.length !== 4
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
        (item) => !this.gameState.selected.includes(item)
      );

      if (difference.length === 0) {
        correct = true;
        this.gameState.selected = [];
        this.gameState.guesses.push(solution);
        this.gameState.saveToLocalStorage();
        await this.ui.puzzle.animateSolve(this.gameState.unsolved, {
          index: parseInt(index) + 1,
          name: name,
          words: solution,
        });
        break; // assuming only one correct match is possible
      } else if (difference.length === 1) {
        oneAway = true;
      }
    }
    if (!correct) {
      this.gameState.guesses.push(this.gameState.selected);
      this.gameState.saveToLocalStorage();

      const toastMessage =
        oneAway && !this.gameState.isGameLost() ? "Én unna!" : undefined;
      await this.ui.animateError(
        this.gameState.selected,
        this.gameState.mistakes,
        toastMessage
      );
      this.ui.gameBottom.mistakes.draw(this.gameState.mistakes);
    }
    if (this.gameState.isGameLost()) {
      this.ui.addToast("Du tapte!");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await this.ui.animateGameLose(this.gameState);
    }
    if (this.gameState.isGameWon()) {
      await this.ui.animateGameWin(this.gameState);
    }
    this.ui.draw(this.gameState);
  }
}
