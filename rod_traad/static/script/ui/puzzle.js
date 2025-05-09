import { WordItem } from "./word.js";
import { Solved } from "./solved.js";

export class Puzzle {
  constructor(game, ui, solved, unselected) {
    this.game = game;
    this.ui = ui;
    this.el = document.querySelector("#puzzle");
    this.animationsActive = false;

    this.solved = solved;
    this.unselected = unselected;

    this.solvedItems = [];
    this.wordItems = [];
  }

  draw() {
    this.el.innerHTML = "";

    this.solved.forEach(({ index, name, words }) => {
      const solvedItem = new Solved(this.game, this.ui, index, name, words);
      this.el.appendChild(solvedItem.el);
    });

    this.unselected.forEach((word) => {
      if (
        this.game.gameState.solved.some((solved) => solved.words.includes(word))
      ) {
        return;
      }
      const wordItem = new WordItem(this.game, this.ui, word);
      this.wordItems.push(wordItem);
      this.el.appendChild(wordItem.el);
    });
  }

  animateSolve({ index, name, words }) {
    words.forEach((word, i) => {
      const wordItem = this.wordItems.find((w) => w.word === word);
      const index = this.wordItems.indexOf(wordItem);

      if (index < 4) {
        return;
      }

      // insert placeholder
      const placeholder = document.createElement("div");
      this.el.insertBefore(placeholder, wordItem.el);

      // const startPosition = [index % 4, Math.floor(index / 4)];
      // const endPosition = [0, 0];
      const gridSize = [4, this.wordItems.length / 4];
      const gap = window.getComputedStyle(this.el).getPropertyValue("gap");

      wordItem.animateMove(gridSize, gap, index, i);
    });
  }
}
