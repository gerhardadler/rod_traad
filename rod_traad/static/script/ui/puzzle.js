import { WordItem } from "./word.js";
import { Solved } from "./solved.js";
import { ToastContainer } from "./toast.js";
import { ensureShuffle } from "../utils.js";

export class Puzzle {
  constructor(toggleWordCallback, deselectWordCallback) {
    this.toggleWordCallback = toggleWordCallback;
    this.deselectWordCallback = deselectWordCallback;

    this.el = document.querySelector("#puzzle");
    this.solvedContainer = this.el.querySelector(".solved-container");
    this.unsolvedContainer = this.el.querySelector(".unsolved-container");

    this.toastContainer = new ToastContainer();
    this.el.appendChild(this.toastContainer.el);

    this.animationsActive = false;

    this.solvedItems = [];
    this.wordItems = [];

    this.gap = window
      .getComputedStyle(this.unsolvedContainer)
      .getPropertyValue("gap");
  }

  draw(solved, unsolved, isGameOver, selected) {
    this.solvedItems = [];
    this.wordItems = [];
    this.solvedContainer.innerHTML = "";
    this.unsolvedContainer.innerHTML = "";

    solved.forEach(({ index, name, words }) => {
      const solvedItem = new Solved(index, name, words);
      this.solvedContainer.appendChild(solvedItem.el);
    });

    if (isGameOver) {
      // draw the rest of the solutions as solved items
      Object.entries(solutions).forEach(([name, solutionWords], index) => {
        if (solved.some((s) => s.name === name)) return;
        const solvedItem = new Solved(index + 1, name, solutionWords);
        this.solvedContainer.appendChild(solvedItem.el);
      });
    } else {
      unsolved.forEach((word) => {
        const wordItem = new WordItem(
          word,
          this.toggleWordCallback,
          this.deselectWordCallback,
          selected.includes(word)
        );
        this.wordItems.push(wordItem);
        this.unsolvedContainer.appendChild(wordItem.el);
      });
    }
  }

  deselectAll() {
    this.wordItems.forEach((wordItem) => wordItem.deselect());
  }

  temporarilyDisableButtons(promise) {
    this.wordItems.forEach((wordItem) => {
      wordItem.checkbox.temporarilyDisable(promise);
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
    const solvedItem = new Solved(index, name, words);
    this.unsolvedContainer.insertBefore(
      solvedItem.el,
      this.unsolvedContainer.firstChild
    );
    solvedItem.hide();
    await solvedItem.animateSolve();
  }

  async animateError(words) {
    const selectedWordItems = this.wordItems.filter((w) =>
      words.includes(w.word)
    );

    await Promise.all(
      selectedWordItems.map((wordItem) => wordItem.animateError())
    );
  }

  async animateSolve(unsolved, { index, name, words }) {
    // make items jump
    await this.animateJump(words);

    await new Promise((resolve) => setTimeout(resolve, 300));

    const moves = [];
    const wordsToMove = [...words];

    const topRow = unsolved.slice(0, 4);
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
        index: unsolved.indexOf(wordToMove),
      });

      unsolved[unsolved.indexOf(wordToMove)] = topWord;
      unsolved[i] = wordToMove;
    });

    await Promise.all(
      moves.map((move) => this.animateMove(move.word, move.index))
    );

    // animate adding solved item
    words.forEach((word) => {
      const wordItem = this.wordItems.find((w) => w.word === word);
      wordItem.animateFadeOut();
    });

    await this.animateSolved({ index, name, words });

    unsolved.splice(0, 4);
  }

  async shuffle(unsolved) {
    ensureShuffle(unsolved);

    // create moves and wait for them to finish
    await Promise.all(
      unsolved.map((word, i) => {
        return this.animateMove(word, i);
      })
    );
  }
}
