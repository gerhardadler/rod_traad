import { Puzzle } from "./puzzle.js?2025-06-11T22:00:03";
import { Result } from "./result.js?2025-06-18T23:57:00";
import { GameBottom } from "./game-bottom.js?2025-06-11T22:00:03";
import { sharePage } from "./share.js?2025-06-18T23:58:00";
import { drawEmail } from "./email.js";

export class UI {
  constructor(
    makeGuessCallback,
    toggleWordCallback,
    deselectWordCallback,
    gameState
  ) {
    this.body = document.querySelector("body");
    this.content = document.querySelector(".content");

    this.animationsActive = false;

    this.puzzle = new Puzzle(toggleWordCallback, deselectWordCallback);

    this.gameBottom = new GameBottom(
      makeGuessCallback,
      gameState,
      this.temporarilyDisableButtons.bind(this),
      () =>
        this.puzzle.shuffle(gameState.unsolved).then(() => {
          this.draw(gameState);
        }),
      this.puzzle.deselectAll.bind(this.puzzle)
    );

    this.helpButton = document.querySelector("#help-button");
    this.helpButton.addEventListener("click", () => {
      document.querySelector("#help-dialog").showModal();
    });
    this.shareButton = document.querySelector(".share-button");
    this.shareButton.addEventListener("click", () => {
      sharePage(this.shareButton);
    });

    this.result = new Result();

    drawEmail();
  }

  activateAnimations() {
    this.animationsActive = true;
    this.body.classList.remove("no-animate");
  }

  deactivateAnimations() {
    this.animationsActive = false;
    this.body.classList.add("no-animate");
  }

  draw(gameState) {
    this.puzzle.draw(
      gameState.solved,
      gameState.unsolved,
      gameState.isGameOver(),
      gameState.selected,
      gameState.gameSession.puzzle.data.solutions
    );
    this.gameBottom.draw(gameState);
    this.result.draw(
      gameState.isGameWon(),
      gameState.isGameLost(),
      gameState.gameSession.guesses,
      gameState.gameSession.puzzle.data.solutions
    );
  }

  async animateError(words, mistakes, toastMessage = undefined) {
    await this.puzzle.animateJump(words);
    this.puzzle.animateError(words);

    return new Promise((resolve) =>
      setTimeout(async () => {
        // after the shake is done, show toast and animate lost hearts
        if (toastMessage) {
          this.addToast(toastMessage);
        }
        await this.gameBottom.mistakes.animateLostHearts(mistakes);
        resolve();
      }, 500)
    );
  }

  temporarilyDisableButtons(promise) {
    this.gameBottom.temporarilyDisableButtons(promise);
    this.puzzle.temporarilyDisableButtons(promise);
  }

  async animateGameLose(gameState) {
    this.puzzle.deselectAll();
    await this.gameBottom.animateHide();
    this.gameBottom.el.style.display = "none";

    const fakeGameState = gameState.clone();
    // animate all solutions
    let i = 0;
    for (const [name, solution] of Object.entries(
      fakeGameState.gameSession.puzzle.data.solutions
    )) {
      if (!fakeGameState.solved.some((s) => s.name === name)) {
        fakeGameState.gameSession.guesses.push({
          words: solution,
          correct: true,
        });
        await this.puzzle.animateSolve(fakeGameState.unsolved, {
          index: i + 1,
          name: name,
          words: solution,
        });
        this.puzzle.draw(
          fakeGameState.solved,
          fakeGameState.unsolved,
          false,
          [],
          fakeGameState.gameSession.puzzle.data.solutions
        );
      }
      i++;
    }

    this.result.updateGuesses(
      gameState.gameSession.guesses,
      gameState.gameSession.puzzle.data.solutions
    );
    this.result.setLoseContent();
    await this.result.animateShow();
  }

  async animateGameWin(gameState) {
    this.puzzle.deselectAll();
    await this.gameBottom.animateHide();
    this.gameBottom.el.style.display = "none";

    this.result.updateGuesses(
      gameState.gameSession.guesses,
      gameState.gameSession.puzzle.data.solutions
    );
    this.result.setWinContent();
    await this.result.animateShow();
  }

  addToast(message) {
    return this.puzzle.toastContainer.addToast(message);
  }

  show() {
    this.content.classList.remove("fade-in");
  }
}
