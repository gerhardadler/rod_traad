import { heartSvg } from "./svg.js";

class Heart {
  constructor(index) {
    this.index = index;
    this.el = document.createElement("span");
    this.el.classList.add("heart");
    this.el.id = `heart-${index + 1}`;
    this.el.innerHTML = heartSvg;
  }

  hide() {
    this.el.classList.add("heart-lost");
  }
}

export class Mistakes {
  constructor(game, ui) {
    this.game = game;
    this.ui = ui;
    this.el = document.querySelector("#mistakes");

    this.mistakesText = document.createElement("span");
    this.mistakesText.innerText = "Liv: ";

    this.heartsContainer = document.createElement("span");
    this.heartsContainer.classList.add("hearts");
    this.hearts = [];
    for (let i = 0; i < this.game.maxMistakes; i++) {
      const heart = new Heart(i);
      this.hearts.push(heart);
      this.heartsContainer.appendChild(heart.el);
    }

    this.el.appendChild(this.mistakesText);
    this.el.appendChild(this.heartsContainer);
  }

  draw() {
    this.hearts.forEach((heart, i) => {
      if (this.game.maxMistakes - this.game.gameState.mistakes <= i) {
        console.log(this.game.maxMistakes - this.game.gameState.mistakes);
        heart.hide();
      }
    });
  }
}
