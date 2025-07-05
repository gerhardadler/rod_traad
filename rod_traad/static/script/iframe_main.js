import { GameState } from "./game.js";
import { Button } from "./ui/button.js";
import { Puzzle } from "./ui/puzzle.js";

function setupGame() {
  const submitButton = Button.fromSelector("#submit-button");

  const gameState = new GameState(gameSession);
  console.log(gameState.unsolved);
  const puzzle = new Puzzle(
    (wordId) => {
      let out = false;
      let word = gameState.unsolvedFromId(wordId);
      if (word.selected) {
        word.selected = false;
        out = true;
      } else if (gameState.selected.length < 4) {
        word.selected = true;
        out = true;
      }
      submitButton.setDisabled(gameState.selected.length !== 4);
      return out;
    },
    () => {}
  );
  puzzle.draw(gameState);
  document.querySelector(".content").classList.remove("fade-in");
  document.querySelector("body").classList.remove("no-animate");

  submitButton.el.addEventListener("click", async () => {
    const params = new URLSearchParams();
    gameState.selected.forEach((word) => {
      params.append("preSelected", word.id);
    });

    window.top.location.href = "https://rodtraad.no?" + params.toString();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(setupGame, 100); // small delay to ensure DOM is ready
});
