import { animateElement } from "../utils.js";

export class Result {
  constructor() {
    this.el = document.querySelector("#result");
    this.titleEl = this.el.querySelector("h2");
    this.subtitleEl = this.el.querySelector("p");
    this.guessesEl = this.el.querySelector("#guesses");

    this.originalDisplay = getComputedStyle(this.el).display;
  }

  setTitle(title) {
    this.titleEl.textContent = title;
  }

  setText(subtitle) {
    this.subtitleEl.textContent = subtitle;
  }

  setWinContent() {
    this.setTitle("Du vant!");
    this.setText("Klarer du det igjen i morgen?");
  }

  setLoseContent() {
    this.setTitle("Du tapte...");
    this.setText("Prøv igjen i morgen!");
  }

  updateGuesses(guesses) {
    this.guessesEl.innerHTML = ""; // Clear previous guesses

    for (const guess of guesses) {
      for (const word of guess) {
        const solutionIndex = Object.values(solutions).findIndex(
          (solutionWords) => solutionWords.includes(word)
        );
        const guessEl = document.createElement("div");
        guessEl.classList.add(`guess-${solutionIndex + 1}`);
        this.guessesEl.appendChild(guessEl);
      }
    }
  }

  draw(isGameWon, isGameLost, guesses) {
    if (isGameWon) {
      this.setWinContent();
      this.el.style.display = this.originalDisplay;
    } else if (isGameLost) {
      this.setLoseContent();
      this.el.style.display = this.originalDisplay;
    } else {
      this.el.style.display = "none";
    }

    this.updateGuesses(guesses);
  }

  async animateShow() {
    this.el.style.display = this.originalDisplay;
    return animateElement(this.el, "fade-in", 500, "ease-in-out");
  }

  async hide() {
    if (getComputedStyle(this.el).display === "none") return;
    return animateElement(this.el, "fade-out", 500, "ease-in-out").then(() => {
      this.el.style.display = "none";
    });
  }
}
