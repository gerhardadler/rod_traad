import { Game, GameState } from "./game.js?2025-06-12T18:57:00";

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
