import { Game, GameState } from "./game.js?2025-06-12T18:57:00";

let game;

function setupGame() {
  const gameState = new GameState(gameSession);

  const game = new Game(gameState);
  game.ui.draw(gameState);
  game.ui.activateAnimations();
  game.ui.show();

  return game;
}

document.addEventListener("DOMContentLoaded", () => {
  game = setupGame();
});

window.addEventListener("beforeinstallprompt", (e) => {
  const deferredPrompt = e;
  game.ui.result.setupInstallAppButton(deferredPrompt);
});
