import { GameState } from "./game.js";
import { drawEmail } from "./ui/email.js";
import { shareGameResult, sharePage } from "./ui/share.js?2025-06-18T20:08:00";

document.addEventListener("DOMContentLoaded", () => {
  const gameState = new GameState(gameSession);

  const actionShareButton = document.querySelector(".actions .share-button");
  actionShareButton.addEventListener("click", () => {
    sharePage(actionShareButton, {
      title: document.title,
      text: "Sjekk ut Rød tråd!",
      url: window.location.href,
    });
  });

  const mainShareButton = document.querySelector(".statistics .share-button");
  mainShareButton.addEventListener("click", () => {
    shareGameResult(
      mainShareButton,
      gameState.gameSession.guesses,
      gameState.gameSession.puzzle.data.solutions
    );
  });

  drawEmail();
});
