import { Game } from "./game.js";
import { GameState } from "./game.js";

function setupGame() {
  const gameState = GameState.fromLocalStorage();
  const game = new Game(gameState);
}

document.addEventListener("DOMContentLoaded", () => {
  setupGame();
});
