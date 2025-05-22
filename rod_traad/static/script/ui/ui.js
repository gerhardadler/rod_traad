import { Puzzle } from "./puzzle.js";
import { Mistakes } from "./mistakes.js";

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

    this.draw();
    this.activateAnimations();
    this.show();

    document.querySelector("#submit").addEventListener("click", () => {
      this.game.makeGuess();
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

  draw() {
    this.puzzle.draw();
    this.mistakes.draw();
  }

  async animateError(words) {
    await this.puzzle.animateJump(words);
    this.puzzle.animateError(words);

    return new Promise((resolve) =>
      setTimeout(async () => {
        // after the shake is done, animate the hearts
        await this.mistakes.animateLostHearts();
        resolve();
      }, 500)
    );
  }

  show() {
    this.content.classList.remove("fade-in");
  }
}
