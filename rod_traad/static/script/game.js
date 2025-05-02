import { areArraysEqual } from "./utils.js";
import { UI } from "./ui.js";

export class GameState {
  constructor() {
    this.solved = {};
    this.guesses = [];
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

  makeGuess() {
    if (
      this.gameState.guesses.some((guess) =>
        areArraysEqual(guess, this.selected)
      )
    ) {
      return;
    }
    let correct = false;

    Object.entries(solutions).forEach(([name, solution], index) => {
      if (areArraysEqual(this.selected, solution)) {
        correct = true;
        this.selected = [];
        this.ui.markSolved(index + 1, name, solution);
      }
    });

    if (!correct) {
      this.gameState.guesses.push(this.selected);
      this.ui.updateMistakes();
    }
  }
}
