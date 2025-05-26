import { Puzzle } from "./puzzle.js";
import { Mistakes } from "./mistakes.js";
import { Button } from "./button.js";
import { Result } from "./result.js";

export class UI {
  constructor(game) {
    this.game = game;
    this.body = document.querySelector("body");
    this.content = document.querySelector(".content");

    this.animationsActive = false;

    this.solved = this.game.gameState.solved;
    this.unselected = puzzleData.grid
      .flat()
      .filter(
        (word) => !this.solved.some((solved) => solved.words.includes(word))
      );

    this.puzzle = new Puzzle(this.game, this, this.solved, this.unselected);

    this.gameBottom = document.querySelector("#game-bottom");
    this.result = new Result(this.game);

    this.mistakes = new Mistakes(this.game, this);

    this.submitButton = Button.fromSelector("#submit");
    this.submitButton.el.addEventListener("click", () => {
      const makeGuessPromise = this.game.makeGuess();
      this.temporarilyDisableButtons(makeGuessPromise);
    });
    this.submitButton.setDisabled(true);

    this.shuffleButton = Button.fromSelector("#shuffle");
    this.shuffleButton.el.addEventListener("click", async () => {
      const shufflePromise = this.puzzle.shuffle();
      this.temporarilyDisableButtons(shufflePromise);
    });

    this.deselectButton = Button.fromSelector("#deselect");
    this.deselectButton.el.addEventListener("click", () => {
      this.puzzle.deselectAll();
    });

    this.draw();
    this.activateAnimations();
    this.show();
  }

  activateAnimations() {
    this.animationsActive = true;
    this.body.classList.remove("no-animate");
  }

  deactivateAnimations() {
    this.animationsActive = false;
    this.body.classList.add("no-animate");
  }

  draw() {
    this.puzzle.draw();
    this.mistakes.draw();
    this.result.draw();
  }

  async animateError(words, toastMessage = undefined) {
    await this.puzzle.animateJump(words);
    this.puzzle.animateError(words);

    return new Promise((resolve) =>
      setTimeout(async () => {
        // after the shake is done, show toast and animate lost hearts
        if (toastMessage) {
          this.addToast(toastMessage);
        }
        await this.mistakes.animateLostHearts();
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

  async animateGameOver() {
    this.puzzle.deselectAll();

    // animate all solutions
    let i = 0;
    for (const [name, solution] of Object.entries(solutions)) {
      if (!this.game.gameState.solved.some((s) => s.name === name)) {
        this.game.gameState.solved.push({
          index: i + 1,
          name: name,
          words: solution,
        });
        await this.puzzle.animateSolve({
          index: i + 1,
          name: name,
          words: solution,
        });
      }
      i++;
    }
    this.draw();
  }

  addToast(message) {
    return this.puzzle.toastContainer.addToast(message);
  }

  show() {
    this.content.classList.remove("fade-in");
  }
}
