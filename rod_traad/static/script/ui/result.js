import { animateElement } from "../utils.js?2025-06-11T22:00:03";
import { share } from "./share.js?2025-06-11T22:00:03";

function getGuessesEmojis(guesses, solutions) {
  const emojiRows = [];
  for (const guess of guesses) {
    const emojis = [];
    guess.words.map((word) => {
      const solutionIndex = Object.values(solutions).findIndex(
        (solutionWords) => solutionWords.includes(word)
      );
      switch (solutionIndex) {
        case 0:
          emojis.push("🟩");
          break;
        case 1:
          emojis.push("🟦");
          break;
        case 2:
          emojis.push("🟪");
          break;
        case 3:
          emojis.push("🟥");
          break;
      }
    });
    emojiRows.push(emojis.join(""));
  }
  return emojiRows.join("\n");
}

export class Result {
  constructor() {
    this.el = document.querySelector("#result");

    this.resultActions = this.el.querySelector(".result-actions");

    this.titleEl = this.el.querySelector("h2");
    this.subtitleEl = this.el.querySelector("p");
    this.guessesEl = this.el.querySelector("#guesses");

    this.originalDisplay = getComputedStyle(this.el).display;

    this.shareData = {
      title: document.title,
      text: "",
      url: window.location.href,
    };
    this.copyText = "";

    this.shareButton = this.el.querySelector(".share-button");
    this.shareButton.addEventListener("click", async () =>
      share(this.shareButton, this.shareData)
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

  updateGuesses(guesses, solutions, date) {
    this.guessesEl.innerHTML = ""; // Clear previous guesses

    for (const guess of guesses) {
      for (const word of guess.words) {
        const solutionIndex = Object.values(solutions).findIndex(
          (solutionWords) => solutionWords.includes(word)
        );
        const guessEl = document.createElement("div");
        guessEl.classList.add(`guess-${solutionIndex + 1}`);
        this.guessesEl.appendChild(guessEl);
      }
    }

    this.shareData.text = "";

    if (guesses.filter((g) => g.correct).length >= 4) {
      this.shareData.text = "Jeg vant i Rød Tråd!\n";
    } else if (guesses.length >= 4) {
      this.shareData.text = "Jeg tapte i Rød Tråd...\n";
    }
    this.shareData.text += `${getGuessesEmojis(guesses, solutions)}\n`;
    this.shareData.text += `Prøv selv:`; // url is automatically appended

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
