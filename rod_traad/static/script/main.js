import { Game } from "./game.js?2025-06-11T22:00:03";
import { GameState } from "./game.js?2025-06-11T22:00:03";

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
