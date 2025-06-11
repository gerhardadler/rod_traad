import { Game } from "./game.js";
import { GameState } from "./game.js";

function setupGame() {
  const gameState = new GameState(gameSession);

  const game = new Game(gameState);
  game.ui.draw(gameState);
  game.ui.activateAnimations();
  game.ui.show();
}

document.addEventListener("DOMContentLoaded", () => {
  setupGame();
});
