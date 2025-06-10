import { animateElement } from "../utils.js";
import { share } from "./share.js";

function getGuessesEmojis(guesses) {
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
    this.titleEl = this.el.querySelector("h2");
    this.subtitleEl = this.el.querySelector("p");
    this.guessesEl = this.el.querySelector("#guesses");

    this.originalDisplay = getComputedStyle(this.el).display;

    this.shareData = {
      title: document.title,
      text: "",
      url: window.location.href,
    };

    this.shareButton = this.el.querySelector(".share-button");
    this.shareButton.addEventListener("click", async () =>
      share(this.shareButton, this.shareData)
    );
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

  updateGuesses(guesses) {
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
    this.shareData.text += `${getGuessesEmojis(guesses)}\n`;
    this.shareData.text += `Prøv selv:`; // url is automatically appended
  }

  draw(isGameWon, isGameLost, guesses) {
    if (isGameWon) {
      this.setWinContent();
      this.el.style.display = this.originalDisplay;
    } else if (isGameLost) {
      this.setLoseContent();
      this.el.style.display = this.originalDisplay;
    } else {
      this.el.style.display = "none";
    }

    this.updateGuesses(guesses);
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
