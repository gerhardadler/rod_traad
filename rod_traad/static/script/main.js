import { Game } from "./game.js";
import { GameState } from "./game.js";

function setupGame() {
  const gameState = new GameState();
  const game = new Game(gameState);
}

document.addEventListener("DOMContentLoaded", () => {
  setupGame();
});
