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

  setWinContent() {
    this.setTitle("Du vant!");
    this.setText("Klarer du det igjen i morgen?");
  }

  setLoseContent() {
    this.setTitle("Du tapte...");
    this.setText("Prøv igjen i morgen!");
  }

  draw(isGameWon, isGameLost) {
    if (isGameWon) {
      this.setWinContent();
      this.el.style.display = "flex";
    } else if (isGameLost) {
      this.setLoseContent();
      this.el.style.display = "flex";
    } else {
      this.el.style.display = "none";
    }
  }

  async animateShow() {
    this.el.style.display = "flex";
    return animateElement(this.el, "fade-in", 500, "ease-in-out");
  }

  async hide() {
    if (getComputedStyle(this.el).display === "none") return;
    return animateElement(this.el, "fade-out", 500, "ease-in-out").then(() => {
      this.el.style.display = "none";
    });
  }
}
