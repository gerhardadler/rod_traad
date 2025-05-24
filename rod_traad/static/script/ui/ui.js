import { Puzzle } from "./puzzle.js";
import { Mistakes } from "./mistakes.js";
import { SubmitButton } from "./submit-button.js";

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
    this.mistakes = new Mistakes(this.game, this);

    this.submitButton = new SubmitButton();
    this.submitButton.el.addEventListener("click", () => {
      this.game.makeGuess();
    });
    this.submitButton.setDisabled(true);

    this.shuffleButton = document.querySelector("#shuffle");
    this.shuffleButton.addEventListener("click", () => {
      this.puzzle.shuffle();
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

  addToast(message) {
    this.puzzle.toastContainer.addToast(message);
  }

  show() {
    this.content.classList.remove("fade-in");
  }
}
