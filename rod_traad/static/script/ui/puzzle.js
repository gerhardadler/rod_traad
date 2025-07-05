import { WordItem } from "./word.js?2025-06-11T22:00:03";
import { Solved } from "./solved.js?2025-06-14T23:32:00";
import { ToastContainer } from "./toast.js?2025-06-11T22:00:03";
import { ensureShuffle } from "../utils.js?2025-06-11T22:00:03";

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

  draw(gameState) {
    this.solvedItems = [];
    this.wordItems = [];
    this.solvedContainer.innerHTML = "";
    this.unsolvedContainer.innerHTML = "";

    gameState.solved.forEach((solution) => {
      const solvedItem = new Solved(gameState, solution);
      this.solvedContainer.appendChild(solvedItem.el);
    });

    if (gameState.isGameOver()) {
      // draw the rest of the solutions as solved items
      gameState.gameSession.puzzle.data.solutions.forEach((solution) => {
        if (gameState.solved.some((s) => s.difficulty === solution.difficulty))
          return;
        const solvedItem = new Solved(gameState, solution);
        this.solvedContainer.appendChild(solvedItem.el);
      });
    } else {
      gameState.unsolved.forEach((word) => {
        const wordItem = new WordItem(
          word,
          this.toggleWordCallback,
          this.deselectWordCallback
        );
        this.wordItems.push(wordItem);
        this.unsolvedContainer.appendChild(wordItem.el);
        wordItem.scaleText();
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

  async animateJump(wordIds) {
    const selectedWordItems = this.wordItems.filter((w) =>
      wordIds.includes(w.word.id)
    );
    for (const wordItem of selectedWordItems) {
      await wordItem.animateJump();
    }
  }

  async animateMove(wordId, toIndex) {
    const wordItem = this.wordItems.find((w) => w.word.id === wordId);
    const originalIndex = this.wordItems.indexOf(wordItem);

    // insert placeholder
    const placeholder = document.createElement("div");
    this.unsolvedContainer.insertBefore(placeholder, wordItem.el);

    const gridSize = [4, this.wordItems.length / 4];

    await wordItem.animateMove(gridSize, this.gap, originalIndex, toIndex);
  }

  async animateSolved(gameState, solution) {
    const solvedItem = new Solved(gameState, solution);
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

  async animateSolve(gameState, solution) {
    // make items jump
    await this.animateJump(solution.words);

    await new Promise((resolve) => setTimeout(resolve, 300));

    const moves = [];
    const wordsToMove = JSON.parse(
      JSON.stringify(gameState.unsolvedFromIds(solution.words))
    );

    const topRow = gameState.unsolved.slice(0, 4);
    // create moves
    topRow.forEach((topWord, i) => {
      // skip if the word is already in the top row
      if (solution.words.includes(topWord.id)) return;

      const firstMissingWordIndex = wordsToMove.findIndex(
        (word) => !topRow.map((w) => w.id).includes(word.id)
      );
      const wordToMove = wordsToMove.splice(firstMissingWordIndex, 1)[0];

      moves.push({ word: wordToMove, index: i });
      moves.push({
        word: topWord,
        index: gameState.unsolved.findIndex(
          (unsolved) => unsolved.id == wordToMove.id
        ),
      });

      gameState.unsolved[
        gameState.unsolved.findIndex((unsolved) => unsolved.id == wordToMove.id)
      ] = topWord;
      gameState.unsolved[i] = wordToMove;
    });

    await Promise.all(
      moves.map((move) => this.animateMove(move.word.id, move.index))
    );

    // animate adding solved item
    solution.words.forEach((wordId) => {
      const wordItem = this.wordItems.find((w) => w.word.id === wordId);
      wordItem.animateFadeOut();
    });

    await this.animateSolved(gameState, solution);

    gameState.unsolved.splice(0, 4);
  }

  async shuffle(unsolved) {
    ensureShuffle(unsolved);

    // create moves and wait for them to finish
    await Promise.all(
      unsolved.map((word, i) => {
        return this.animateMove(word.id, i);
      })
    );
  }
}
