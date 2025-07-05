import { areArraysEqual } from "./utils.js?2025-06-11T22:00:03";
import { UI } from "./ui/ui.js?2025-06-18T23:58:00";
import { MAX_MISTAKES } from "./config.js?2025-06-11T22:00:03";
import { updateGameSession } from "./api.js?2025-06-11T22:00:03";

export class GameState {
  constructor(gameSession, preSelected = null, unsolved = null) {
    this.gameSession = gameSession;

    this.unsolved =
      unsolved ||
      JSON.parse(JSON.stringify(this.gameSession.puzzle.data.words))
        .filter(
          (word) =>
            !this.solved.some((solution) => solution.words.includes(word.id))
        )
        .map((word) => ({
          ...word,
          selected: preSelected == null ? false : preSelected.includes(word.id),
        }));
  }

  async updateGameSession() {
    return;
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
      null,
      JSON.parse(JSON.stringify(this.unsolved))
    );
  }

  get mistakes() {
    let out = 0;
    for (const guess of this.gameSession.guesses) {
      if (guess.solution == null) {
        out++;
      }
    }
    return out;
  }

  get solved() {
    const solved = [];
    for (const solution of this.gameSession.puzzle.data.solutions) {
      if (
        this.gameSession.guesses.some(
          (guess) => guess.solution == solution.difficulty
        )
      )
        solved.push(solution);
    }
    return solved;
  }

  unsolvedFromId(id) {
    return this.unsolved.find((word) => word.id == id);
  }

  unsolvedFromIds(ids) {
    return this.unsolved.filter((word) => ids.includes(word.id));
  }

  wordFromId(id) {
    return this.gameSession.puzzle.data.words.find((word) => word.id == id);
  }

  wordsFromIds(ids) {
    return this.gameSession.puzzle.data.words.filter((word) =>
      ids.includes(word.id)
    );
  }

  get selected() {
    return this.unsolved.filter((word) => word.selected);
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

  toggleWord(wordId) {
    let out = false;
    let word = this.gameState.unsolvedFromId(wordId);
    if (word.selected) {
      word.selected = false;
      out = true;
    } else if (this.gameState.selected.length < 4) {
      word.selected = 4;
      out = true;
    }

    this.ui.gameBottom.submitButton.setDisabled(
      this.gameState.selected.length !== 4
    );
    return out;
  }

  deselectWord(wordId) {
    let word = this.gameState.unsolvedFromId(wordId);
    if (word) word.selected = false;
    this.ui.gameBottom.submitButton.setDisabled(
      this.gameState.selected.length !== 4
    );
  }

  async makeGuess() {
    if (
      this.gameState.gameSession.guesses.some((guess) =>
        areArraysEqual(
          guess.words,
          this.gameState.selected.map((s) => s.id)
        )
      ) ||
      this.gameState.selected.length !== 4
    ) {
      this.ui.addToast("Allerede gjettet.");
      return;
    }
    let correct = false;
    let oneAway = false;

    for (const solution of this.gameState.gameSession.puzzle.data.solutions) {
      const difference = solution.words.filter(
        (wordId) => !this.gameState.selected.map((s) => s.id).includes(wordId)
      );

      if (difference.length === 0) {
        correct = true;
        this.ui.gameBottom.submitButton.setDisabled(true);
        this.gameState.gameSession.guesses.push({
          words: solution.words,
          solution: solution.difficulty,
        });
        this.gameState.updateGameSession();
        await this.ui.puzzle.animateSolve(this.gameState, solution);
        break; // assuming only one correct match is possible
      } else if (difference.length === 1) {
        oneAway = true;
      }
    }
    if (!correct) {
      this.gameState.gameSession.guesses.push({
        words: this.gameState.selected.map((s) => s.id),
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
