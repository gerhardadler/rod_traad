import { animateElement } from "../utils.js";

export class Result {
  constructor() {
    this.el = document.querySelector("#result");
  }

  setTitle(title) {
    const titleEl = this.el.querySelector("h2");
    titleEl.textContent = title;
  }

  setText(subtitle) {
    const subtitleEl = this.el.querySelector("p");
    subtitleEl.textContent = subtitle;
  }

  draw(isGameWon, isGameLost) {
    if (isGameWon) {
      this.setTitle("Gratulerer!");
      this.setText("Du har løst oppgaven!");
      this.show();
    } else if (isGameLost) {
      this.setTitle("Du tapte!");
      this.setText("Prøv igjen neste gang.");
      this.show();
    } else {
      this.hide();
    }
  }

  async show() {
    if (getComputedStyle(this.el).display !== "none") return;
    this.el.style.display = "block";

    return animateElement(this.el, "fade-in", 500, "ease-in-out");
  }

  async hide() {
    if (getComputedStyle(this.el).display === "none") return;
    return animateElement(this.el, "fade-out", 500, "ease-in-out").then(() => {
      this.el.style.display = "none";
    });
  }
}
