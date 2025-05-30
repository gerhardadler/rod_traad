import { animateElement } from "../utils.js";
import { Button } from "./button.js";
import { Mistakes } from "./mistakes.js";

export class GameBottom {
  constructor(
    makeGuessCallback,
    gameState,
    temporarilyDisableButtonsCallback,
    shuffleCallback,
    deselectAllCallback
  ) {
    this.el = document.querySelector("#game-bottom");

    this.mistakes = new Mistakes();

    this.submitButton = Button.fromSelector("#submit");
    this.submitButton.el.addEventListener("click", () => {
      const makeGuessPromise = makeGuessCallback();
      temporarilyDisableButtonsCallback(makeGuessPromise);
    });
    this.submitButton.setDisabled(true);

    this.shuffleButton = Button.fromSelector("#shuffle");
    this.shuffleButton.el.addEventListener("click", async () => {
      const shufflePromise = shuffleCallback();

      temporarilyDisableButtonsCallback(shufflePromise);
    });

    this.deselectButton = Button.fromSelector("#deselect");
    this.deselectButton.el.addEventListener("click", () => {
      deselectAllCallback();
    });
  }

  temporarilyDisableButtons(promise) {
    this.submitButton.temporarilyDisable(promise);
    this.shuffleButton.temporarilyDisable(promise);
    this.deselectButton.temporarilyDisable(promise);
  }

  draw(gameState) {
    if (!gameState.isGameOver()) {
      this.el.style.display = "block";
      this.mistakes.draw(gameState.mistakes);
    } else {
      this.el.style.display = "none";
    }
  }

  async animateShow() {
    this.el.style.display = "block";
    return animateElement(this.el, "fade-in", 500, "ease-in-out");
  }

  async animateHide() {
    return animateElement(this.el, "fade-out", 500, "ease-in-out");
  }
}
