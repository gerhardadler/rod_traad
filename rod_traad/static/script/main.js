import { Game, GameState } from "./game.js?2025-06-14T23:32:00";

let game;

function setupGame() {
  let selectedWords = null;
  console.log(document.cookie);
  const preSelected = document.cookie
    .split("; ")
    .find((row) => row.startsWith("preSelected="));

  if (preSelected) {
    selectedWords = preSelected.split("=")[1].split(",");
    document.cookie = `preSelected=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;

    // filter out selected words which are not in puzzle data
    selectedWords = selectedWords.filter((word) =>
      gameSession.puzzle.data.grid.flat().includes(word)
    );
  }

  if (selectedWords == null && localStorage.getItem("hasSeenHelp") !== "true") {
    document.querySelector("#help-dialog").showModal();
    localStorage.setItem("hasSeenHelp", "true");
  }

  const gameState = new GameState(gameSession, selectedWords);

  const game = new Game(gameState);
  game.ui.draw(gameState);
  game.ui.activateAnimations();
  game.ui.show();

  if (selectedWords && selectedWords.length === 4) {
    game.makeGuess(gameState.selected);
  }

  return game;
}

document.addEventListener("DOMContentLoaded", () => {
  game = setupGame();
});

window.addEventListener("beforeinstallprompt", (e) => {
  const deferredPrompt = e;
  game.ui.result.setupInstallAppButton(deferredPrompt);
});
