import { Game } from "./game.js";
import { GameState } from "./game.js";

function setupGame() {
  let gameState = GameState.fromLocalStorage();
  if (gameState.puzzleDate != puzzleDate) {
    gameState = new GameState(puzzleDate);
    gameState.saveToLocalStorage();
  }
  const game = new Game(gameState);
  game.ui.draw(gameState);
  game.ui.activateAnimations();
  game.ui.show();
}

document.addEventListener("DOMContentLoaded", () => {
  setupGame();
});
