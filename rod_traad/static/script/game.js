import { areArraysEqual } from "./utils.js";
import { UI } from "./ui/ui.js";
import { MAX_MISTAKES } from "./config.js";
import { updateGameSession } from "./api.js";

export class GameState {
  constructor(gameSession, selected = null, unsolved = null) {
    this.gameSession = gameSession;

    // not part of the saved state, used for UI interactions
    this.selected = selected || [];
    this.unsolved =
      unsolved ||
      gameSession.puzzle.data.grid
        .flat()
        .filter(
          (word) => !this.solved.some((solved) => solved.words.includes(word))
        );
  }

  async updateGameSession() {
    let response;
    try {
      response = await updateGameSession(this.gameSession.id, this.gameSession);
    } catch (error) {
      console.error("Failed to update game session:", error);
      return;
    }
    // success
    this.gameSession = response;
  }

  clone() {
    return new GameState(
      JSON.parse(JSON.stringify(this.gameSession)),
      [...this.selected],
      [...this.unsolved]
    );
  }

  get mistakes() {
    let out = 0;
    for (const guess of this.gameSession.guesses) {
      if (!guess.correct) {
        out++;
      }
    }
    return out;
  }

  get solved() {
    const solved = [];
    for (const guess of this.gameSession.guesses) {
      for (const [index, [name, solution]] of Object.entries(
        this.gameSession.puzzle.data.solutions
      ).entries()) {
        if (areArraysEqual(guess.words, solution)) {
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
    return (
      this.solved.length ===
      Object.keys(this.gameSession.puzzle.data.solutions).length
    );
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
      this.gameState.gameSession.guesses.some((guess) =>
        areArraysEqual(guess.words, this.gameState.selected)
      ) ||
      this.gameState.selected.length !== 4
    ) {
      this.ui.addToast("Allerede gjettet.");
      return;
    }
    let correct = false;
    let oneAway = false;

    for (const [index, [name, solution]] of Object.entries(
      this.gameState.gameSession.puzzle.data.solutions
    ).entries()) {
      const difference = solution.filter(
        (item) => !this.gameState.selected.includes(item)
      );

      if (difference.length === 0) {
        correct = true;
        this.gameState.selected = [];
        this.gameState.gameSession.guesses.push({
          words: solution,
          correct: true,
        });
        this.gameState.updateGameSession();
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
      this.gameState.gameSession.guesses.push({
        words: this.gameState.selected,
        correct: false,
      });
      this.gameState.updateGameSession();

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
