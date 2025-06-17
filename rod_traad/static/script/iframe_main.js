import { GameState } from "./game.js";
import { Button } from "./ui/button.js";
import { Puzzle } from "./ui/puzzle.js";

function setupGame() {
  const submitButton = Button.fromSelector("#submit-button");

  const gameState = new GameState(gameSession);
  const puzzle = new Puzzle(
    (word) => {
      let out = false;
      if (gameState.selected.includes(word)) {
        gameState.selected = gameState.selected.filter((w) => w !== word);
        out = true;
      } else if (gameState.selected.length < 4) {
        gameState.selected.push(word);
        out = true;
      }
      submitButton.setDisabled(gameState.selected.length !== 4);
      return out;
    },
    () => {}
  );
  puzzle.draw(
    gameState.solved,
    gameState.unsolved,
    gameState.isGameOver(),
    gameState.selected,
    gameSession.puzzle.data.solutions
  );
  document.querySelector(".content").classList.remove("fade-in");
  document.querySelector("body").classList.remove("no-animate");

  submitButton.el.addEventListener("click", async () => {
    const params = new URLSearchParams();
    gameState.selected.forEach((word) => {
      params.append("preSelected", word);
    });

    window.top.location.href = "https://rodtraad.no?" + params.toString();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(setupGame, 100); // small delay to ensure DOM is ready
});
