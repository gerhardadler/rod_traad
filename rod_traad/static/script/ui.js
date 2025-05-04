import { WordItem as Word } from "./word.js";

export class UI {
  constructor(game) {
    this.game = game;
    this.body = document.querySelector("body");
    this.puzzle = document.querySelector("#puzzle");
    this.mistakes = document.querySelector("#mistakes");
    this.hearts = this.mistakes.querySelectorAll(".heart");

    this.animationsActive = false;

    this.words = Array.from(document.querySelectorAll(".word")).map((word) => {
      new Word(word, this.game, this);
    });

    document.querySelector("#submit").addEventListener("click", () => {
      this.game.makeGuess();
    });

    this.updateMistakes();
    this.updateSolved();
    this.activateAnimations();
    this.showPuzzle();
  }

  activateAnimations() {
    this.animationsActive = true;
    this.body.classList.remove("no-animate");
  }

  deactivateAnimations() {
    this.animationsActive = false;
    this.body.classList.add("no-animate");
  }

  showPuzzle() {
    this.puzzle.classList.add("fade-in-show");
    this.mistakes.classList.add("fade-in-show");
  }

  updateMistakes() {
    this.hearts.forEach((heart, i) => {
      if (this.game.maxMistakes - this.game.gameState.mistakes <= i) {
        heart.classList.add("heart-lost");
      } else {
        heart.classList.remove("heart-lost");
      }
    });
  }

  updateSolved() {
    const solved = this.game.gameState.solved;
    solved.forEach(({ index, name, words }) => {
      this.markSolved(index, name, words);
    });
  }

  markSolved(index, name, words) {
    const matchingWordElements = Array.from(
      this.puzzle.querySelectorAll(".word")
    ).filter((wordEl) => words.includes(wordEl.innerText));

    if (matchingWordElements.length === 0) {
      return;
    }

    matchingWordElements.forEach((wordEl) => {
      wordEl.remove();
    });

    const div = document.createElement("div");
    div.classList.add("solved", `solution-${index}`);
    div.innerHTML = `<h3>${name}</h3><p>${words.join(", ")}</p>`;
    this.puzzle.insertBefore(div, this.puzzle.querySelector(".word"));
  }
}
