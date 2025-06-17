import { Game, GameState } from "./game.js?2025-06-17T00:22:00";

let game;

function setupGame() {
  let preSelected = new URLSearchParams(window.location.search).getAll(
    "preSelected"
  );

  if (preSelected) {
    // remove from address bar
    const url = new URL(window.location.href);
    url.searchParams.delete("preSelected");
    window.history.replaceState({}, "", url.toString());

    // filter out selected words which are not in puzzle data
    preSelected = preSelected.filter((word) =>
      gameSession.puzzle.data.grid.flat().includes(word)
    );
  }

  if (
    preSelected.length === 0 &&
    localStorage.getItem("hasSeenHelp") !== "true"
  ) {
    document.querySelector("#help-dialog").showModal();
    localStorage.setItem("hasSeenHelp", "true");
  }

  const gameState = new GameState(gameSession, preSelected);

  const game = new Game(gameState);
  game.ui.draw(gameState);
  game.ui.activateAnimations();
  game.ui.show();

  if (preSelected && preSelected.length === 4) {
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
