import { heartSvg } from "./svg.js?2025-06-11T22:00:03";
import { animateElement } from "../utils.js?2025-06-11T22:00:03";
import { MAX_MISTAKES } from "../config.js?2025-06-11T22:00:03";

class Heart {
  constructor(index) {
    this.index = index;
    this.el = document.createElement("span");
    this.el.classList.add("heart");
    this.el.id = `heart-${index + 1}`;
    this.el.innerHTML = heartSvg;
  }

  animateHide() {
    animateElement(this.el, "scale-out", 500, "ease-in-out");
    return animateElement(this.el, "fade-out", 500, "ease-in-out");
  }
}

export class Mistakes {
  constructor() {
    this.el = document.querySelector("#mistakes");

    this.mistakesText = document.createElement("span");
    this.mistakesText.innerText = "Liv: ";

    this.heartsContainer = document.createElement("span");
    this.heartsContainer.classList.add("hearts");

    this.hearts = [];

    this.el.appendChild(this.mistakesText);
    this.el.appendChild(this.heartsContainer);
  }

  draw(mistakes) {
    this.hearts = [];
    this.heartsContainer.innerHTML = "";
    for (let i = 0; i < MAX_MISTAKES - mistakes; i++) {
      const heart = new Heart(i);
      this.hearts.push(heart);
      this.heartsContainer.appendChild(heart.el);
    }
  }

  async animateLostHearts(mistakes) {
    const lostHearts = this.hearts.slice(MAX_MISTAKES - mistakes);
    await Promise.all(lostHearts.map((heart) => heart.animateHide()));
  }
}
