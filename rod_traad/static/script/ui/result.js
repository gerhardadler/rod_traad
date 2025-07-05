import { animateElement } from "../utils.js?2025-06-11T22:00:03";
import {
  shareGameResult,
  getGuessesEmojis,
} from "./share.js?2025-06-18T23:58:00";

export class Result {
  constructor() {
    this.el = document.querySelector("#result");

    this.resultActions = this.el.querySelector(".result-actions");

    this.titleEl = this.el.querySelector("h2");
    this.subtitleEl = this.el.querySelector("p");
    this.guessesEl = this.el.querySelector("#guesses");

    this.originalDisplay = getComputedStyle(this.el).display;

    this.guesses = [];
    this.solutions = {};
    this.copyText = "";

    this.shareButton = this.el.querySelector(".share-button");
    this.shareButton.addEventListener("click", async () =>
      shareGameResult(this.shareButton, this.guesses, this.solutions)
    );

    this.copyButton = this.el.querySelector("#copy-button");
    this.copyButtonTooltip = this.copyButton.querySelector(".tooltip");

    this.copyButton.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(this.copyText);

        // Show tooltip
        this.copyButtonTooltip.style.visibility = "visible";
        this.copyButtonTooltip.style.opacity = "1";

        // Hide after 2 seconds
        setTimeout(() => {
          this.copyButtonTooltip.style.opacity = "0";
          this.copyButtonTooltip.style.visibility = "hidden";
        }, 2000);
      } catch (err) {
        console.error("Failed to copy text: ", err);
      }
    });
    this.installAppButton = null;
    this.deferredPrompt = null;
  }

  setTitle(title) {
    this.titleEl.textContent = title;
  }

  setText(subtitle) {
    this.subtitleEl.textContent = subtitle;
  }

  setWinContent() {
    this.setTitle("Du vant!");
    this.setText("Klarer du det igjen i morgen?");
  }

  setLoseContent() {
    this.setTitle("Du tapte...");
    this.setText("Prøv igjen i morgen!");
  }

  setupInstallAppButton(deferredPrompt) {
    this.deferredPrompt = deferredPrompt;
    if (this.installAppButton) {
      return;
    }
    this.installAppButton = document.createElement("button");
    this.installAppButton.textContent = "Installer app";
    this.installAppButton.classList.add("button");
    this.installAppButton.addEventListener("click", async () => {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      if (outcome === "accepted") {
        console.log("User accepted the A2HS prompt");
      } else {
        console.log("User dismissed the A2HS prompt");
      }
      this.deferredPrompt = null; // Clear the prompt
    });
    this.resultActions.appendChild(this.installAppButton);
  }

  updateGuesses(guesses, solutions) {
    this.guessesEl.innerHTML = ""; // Clear previous guesses

    for (const guess of guesses) {
      for (const word of guess.words) {
        const solution = solutions.find((solution) =>
          solution.words.includes(word)
        );
        const guessEl = document.createElement("div");
        guessEl.classList.add(`guess-${solution.difficulty}`);
        this.guessesEl.appendChild(guessEl);
      }
    }

    this.guesses = guesses;
    this.solutions = solutions;

    this.copyText = `Rød tråd ${prettyDate}\n`;
    this.copyText += `${getGuessesEmojis(guesses, solutions)}`;
  }

  draw(isGameWon, isGameLost, guesses, solutions) {
    if (isGameWon) {
      this.setWinContent();
      this.el.style.display = this.originalDisplay;
    } else if (isGameLost) {
      this.setLoseContent();
      this.el.style.display = this.originalDisplay;
    } else {
      this.el.style.display = "none";
    }

    this.updateGuesses(guesses, solutions);
  }

  async animateShow() {
    this.el.style.display = this.originalDisplay;
    return animateElement(this.el, "fade-in", 500, "ease-in-out");
  }

  async hide() {
    if (getComputedStyle(this.el).display === "none") return;
    return animateElement(this.el, "fade-out", 500, "ease-in-out").then(() => {
      this.el.style.display = "none";
    });
  }
}
