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
    document.cookie = `preSelected=${gameState.selected.join(",")}; path=/;`;
    window.top.location.href = window.top.location.origin + "/";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupGame();
});
