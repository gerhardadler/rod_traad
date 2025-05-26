import { Puzzle } from "./puzzle.js";
import { Mistakes } from "./mistakes.js";
import { Button } from "./button.js";
import { Result } from "./result.js";

export class UI {
  constructor(
    makeGuessCallback,
    toggleWordCallback,
    deselectWordCallback,
    gameState
  ) {
    this.makeGuessCallback = makeGuessCallback;
    this.toggleWordCallback = toggleWordCallback;
    this.deselectWordCallback = deselectWordCallback;

    this.body = document.querySelector("body");
    this.content = document.querySelector(".content");

    this.animationsActive = false;

    this.puzzle = new Puzzle(toggleWordCallback, deselectWordCallback);

    this.gameBottom = document.querySelector("#game-bottom");
    this.result = new Result();

    this.mistakes = new Mistakes();

    this.submitButton = Button.fromSelector("#submit");
    this.submitButton.el.addEventListener("click", () => {
      const makeGuessPromise = this.makeGuessCallback();
      this.temporarilyDisableButtons(makeGuessPromise);
    });
    this.submitButton.setDisabled(true);

    this.shuffleButton = Button.fromSelector("#shuffle");
    this.shuffleButton.el.addEventListener("click", async () => {
      const shufflePromise = this.puzzle
        .shuffle(gameState.unsolved)
        .then(() => this.draw(gameState));

      this.temporarilyDisableButtons(shufflePromise);
    });

    this.deselectButton = Button.fromSelector("#deselect");
    this.deselectButton.el.addEventListener("click", () => {
      this.puzzle.deselectAll();
    });
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
    this.puzzle.draw(gameState.solved, gameState.unsolved, gameState.selected);
    this.mistakes.draw(gameState.mistakes);
    this.result.draw(gameState.isGameWon(), gameState.isGameLost());
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
        await this.mistakes.animateLostHearts(mistakes);
        resolve();
      }, 500)
    );
  }

  temporarilyDisableButtons(promise) {
    this.submitButton.temporarilyDisable(promise);
    this.shuffleButton.temporarilyDisable(promise);
    this.deselectButton.temporarilyDisable(promise);
    this.puzzle.temporarilyDisableButtons(promise);
  }

  async animateGameOver(gameState) {
    this.puzzle.deselectAll();

    const fakeGameState = structuredClone(gameState);
    // animate all solutions
    let i = 0;
    for (const [name, solution] of Object.entries(solutions)) {
      if (!fakeGameState.solved.some((s) => s.name === name)) {
        fakeGameState.solved.push({
          index: i + 1,
          name: name,
          words: solution,
        });
        await this.puzzle.animateSolve(fakeGameState.unsolved, {
          index: i + 1,
          name: name,
          words: solution,
        });
        this.puzzle.draw(
          fakeGameState.solved,
          fakeGameState.unsolved,
          fakeGameState.selected
        );
      }
      i++;
    }
    this.draw(fakeGameState);
  }

  addToast(message) {
    return this.puzzle.toastContainer.addToast(message);
  }

  show() {
    this.content.classList.remove("fade-in");
  }
}
