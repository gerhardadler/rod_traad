import { animateElement } from "../utils.js";
import { Button } from "./button.js";

export class WordItem {
  constructor(word, toggleWordCallback, deselectWordCallback, checked) {
    this.word = word;
    this.toggleWordCallback = toggleWordCallback;
    this.deselectWordCallback = deselectWordCallback;

    this.el = document.createElement("label");
    this.el.setAttribute("for", word);
    this.el.classList.add("word");

    const checkboxEl = document.createElement("input");
    checkboxEl.type = "checkbox";
    checkboxEl.classList.add("visually-hidden");
    checkboxEl.id = word;
    checkboxEl.checked = checked;
    checkboxEl.setAttribute("autocomplete", "off");
    this.checkbox = new Button(checkboxEl);

    this.span = document.createElement("span");
    this.span.innerText = word;

    this.el.appendChild(this.checkbox.el);
    this.el.appendChild(this.span);

    this.el.addEventListener("mousedown", () => {
      if (this.checkbox.el.disabled) return;
      const alreadySelected = this.checkbox.el.checked;

      if (!this.toggleWordCallback(word)) return;

      this.checkbox.el.checked = !alreadySelected;

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
    this.checkbox.el.checked = false;
    this.el.classList.remove("selected");
    this.deselectWordCallback(this.word);
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
