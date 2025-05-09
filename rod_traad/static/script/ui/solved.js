export class Solved {
  constructor(game, ui, index, name, words) {
    this.game = game;
    this.ui = ui;

    this.el = document.createElement("div");
    this.el.classList.add("solved", `solution-${index}`);

    this.h3 = document.createElement("h3");
    this.h3.innerText = name;

    this.p = document.createElement("p");
    this.p.innerText = words.join(", ");

    this.el.appendChild(this.h3);
    this.el.appendChild(this.p);
  }
}
