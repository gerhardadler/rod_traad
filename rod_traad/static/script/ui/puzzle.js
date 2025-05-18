import { WordItem } from "./word.js";
import { Solved } from "./solved.js";

export class Puzzle {
  constructor(game, ui, solved, unselected) {
    this.game = game;
    this.ui = ui;

    this.el = document.querySelector("#puzzle");
    this.solvedContainer = this.el.querySelector(".solved-container");
    this.unsolvedContainer = this.el.querySelector(".unsolved-container");

    this.animationsActive = false;

    this.solved = solved;
    this.unselected = unselected;

    this.solvedItems = [];
    this.wordItems = [];

    this.gap = window
      .getComputedStyle(this.unsolvedContainer)
      .getPropertyValue("gap");
  }

  draw() {
    this.solvedItems = [];
    this.wordItems = [];
    this.solvedContainer.innerHTML = "";
    this.unsolvedContainer.innerHTML = "";

    this.solved.forEach(({ index, name, words }) => {
      const solvedItem = new Solved(this.game, this.ui, index, name, words);
      this.solvedContainer.appendChild(solvedItem.el);
    });

    this.unselected.forEach((word) => {
      const wordItem = new WordItem(this.game, this.ui, word);
      this.wordItems.push(wordItem);
      this.unsolvedContainer.appendChild(wordItem.el);
    });
  }

  async animateJump(words) {
    const selectedWordItems = this.wordItems.filter((w) =>
      words.includes(w.word)
    );
    for (const wordItem of selectedWordItems) {
      await wordItem.animateJump();
    }
  }

  async animateMove(word, toIndex) {
    const wordItem = this.wordItems.find((w) => w.word === word);
    const originalIndex = this.wordItems.indexOf(wordItem);

    // insert placeholder
    const placeholder = document.createElement("div");
    this.unsolvedContainer.insertBefore(placeholder, wordItem.el);

    const gridSize = [4, this.wordItems.length / 4];

    await wordItem.animateMove(gridSize, this.gap, originalIndex, toIndex);
  }

  async animateSolved({ index, name, words }) {
    const solvedItem = new Solved(this.game, this.ui, index, name, words);
    this.unsolvedContainer.insertBefore(
      solvedItem.el,
      this.unsolvedContainer.firstChild
    );
    solvedItem.hide();
    await solvedItem.animateSolve();
  }

  async animateSolve({ index, name, words }) {
    // make items jump

    await this.animateJump(words);

    await new Promise((resolve) => setTimeout(resolve, 200));

    const moves = [];
    const wordsToMove = [...words];

    const topRow = this.unselected.slice(0, 4);
    // create moves
    topRow.forEach((topWord, i) => {
      // skip if the word is already in the top row
      if (words.includes(topWord)) return;

      const firstMissingWordIndex = wordsToMove.findIndex(
        (word) => !topRow.includes(word)
      );
      const wordToMove = wordsToMove.splice(firstMissingWordIndex, 1)[0];

      moves.push({ word: wordToMove, index: i });
      moves.push({
        word: topWord,
        index: this.unselected.indexOf(wordToMove),
      });

      this.unselected[this.unselected.indexOf(wordToMove)] = topWord;
      this.unselected[i] = wordToMove;
    });

    console.log(this.unselected);

    await Promise.all(
      moves.map((move) => this.animateMove(move.word, move.index))
    );

    // animate adding solved item
    words.forEach((word) => {
      const wordItem = this.wordItems.find((w) => w.word === word);
      wordItem.animateFadeOut();
    });

    await this.animateSolved({ index, name, words });

    this.unselected.splice(0, 4);

    this.draw();
  }
}
