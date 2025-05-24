import { animateElement } from "../utils.js";

export class WordItem {
  constructor(game, ui, word) {
    this.game = game;
    this.ui = ui;
    this.word = word;

    this.el = document.createElement("label");
    this.el.setAttribute("for", word);
    this.el.classList.add("word");

    this.checkbox = document.createElement("input");
    this.checkbox.type = "checkbox";
    this.checkbox.classList.add("visually-hidden");
    this.checkbox.id = word;
    this.checkbox.checked = this.game.selected.includes(word);
    this.checkbox.setAttribute("autocomplete", "off");

    this.span = document.createElement("span");
    this.span.innerText = word;

    this.el.appendChild(this.checkbox);
    this.el.appendChild(this.span);

    this.el.addEventListener("mousedown", () => {
      const alreadySelected = this.checkbox.checked;

      if (!this.game.toggleWord(word)) return;

      this.checkbox.checked = !alreadySelected;

      this.el.classList.add("shrink");
      document.addEventListener(
        "mouseup",
        () => {
          this.el.classList.remove("shrink");
        },
        { once: true }
      );
    });

    this.el.addEventListener("click", (e) => e.preventDefault());
  }

  deselect() {
    this.checkbox.checked = false;
    this.el.classList.remove("selected");
    this.game.deselectWord(this.word);
  }

  async animateMove(gridSize, gapSize, startIndex, endIndex) {
    const calculatePosition = (index) => {
      const column = index % gridSize[0];
      const row = Math.floor(index / gridSize[0]);

      const x = `calc(${column * 100}% + ${gapSize} * ${column})`;
      const y = `calc(${row * 100}% + ${gapSize} * ${row})`;

      return [x, y];
    };

    const startPosition = calculatePosition(startIndex);
    const endPosition = calculatePosition(endIndex);

    const size = this.el.getBoundingClientRect();

    this.el.style.width = `${size.width}px`;
    this.el.style.height = `${size.height}px`;

    this.el.style.transform = `translate(${startPosition[0]}, ${startPosition[1]})`;
    this.el.style.position = "absolute";

    // Force reflow
    void this.el.offsetHeight;

    this.el.style.transition = "0.6s ease-in-out";
    this.el.style.transform = `translate(${endPosition[0]}, ${endPosition[1]})`;

    await new Promise((resolve) => setTimeout(resolve, 605));
  }

  async animateFadeOut() {
    return animateElement(this.el, "fadeOut", 1000, "ease");
  }

  animateJump() {
    return animateElement(this.el, "jump", 300, "ease-in-out");
  }

  async animateError() {
    animateElement(this.el, "shake", 500, "ease-in-out");
    await animateElement(this.el, "fade-out-half", 500, "ease-in-out");
    return animateElement(this.el, "fade-in-half", 500, "ease-in-out");
  }
}
