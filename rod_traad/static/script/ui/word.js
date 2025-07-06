import { animateElement } from "../utils.js?2025-06-11T22:00:03";
import { Button } from "./button.js?2025-06-11T22:00:03";

const cachedFontSize = {};

export class WordItem {
  constructor(word, toggleWordCallback = null, deselectWordCallback = null) {
    this.word = word;
    this.toggleWordCallback = toggleWordCallback;
    this.deselectWordCallback = deselectWordCallback;
    this.isInteractive =
      toggleWordCallback !== null || deselectWordCallback !== null;

    this.el = document.createElement(this.isInteractive ? "label" : "div");
    this.el.setAttribute("for", word.name);
    this.el.classList.add("word");

    if (this.isInteractive) {
      const checkboxEl = document.createElement("input");
      checkboxEl.type = "checkbox";
      checkboxEl.classList.add("visually-hidden");
      checkboxEl.checked = word.selected;
      checkboxEl.setAttribute("autocomplete", "off");
      this.checkbox = new Button(checkboxEl);
      this.el.appendChild(this.checkbox.el);

      this.el.addEventListener("mousedown", () => {
        if (this.checkbox.el.disabled) return;
        const alreadySelected = this.checkbox.el.checked;

        if (!this.toggleWordCallback(word.id)) return;

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

    this.span = document.createElement("span");
    this.span.innerHTML = word.name;

    this.el.appendChild(this.span);
  }

  scaleText() {
    const getTextWidth = () => {
      const range = document.createRange();
      range.selectNodeContents(this.span);

      const rect = range.getBoundingClientRect();
      return rect.width;
    };

    if (cachedFontSize[this.word.name]) {
      this.span.style.fontSize = cachedFontSize[this.word.name];
      return;
    }

    // Get computed font size and unit
    const computedStyle = window.getComputedStyle(this.span);
    const fontSizeMatch = computedStyle.fontSize.match(/^([\d.]+)([a-z%]+)$/i);

    if (!fontSizeMatch) return;

    let currentSize = parseFloat(fontSizeMatch[1]);
    const unit = fontSizeMatch[2];

    // Scale factor (e.g., 0.95 for 95%)
    const scaleFactor = 0.95;

    // Try reducing font size until it fits
    while (getTextWidth() > this.span.clientWidth && currentSize > 5) {
      currentSize *= scaleFactor;
      this.span.style.fontSize = `${currentSize}${unit}`;
    }

    if (Math.abs(getTextWidth() / this.span.clientWidth) > 0.9) {
      // add padding to ensure it fits well
      currentSize *= 0.85;
    }

    this.span.style.fontSize = `${currentSize}${unit}`;
    cachedFontSize[this.word.name] = this.span.style.fontSize;
  }

  deselect() {
    this.checkbox.el.checked = false;
    this.el.classList.remove("selected");
    this.deselectWordCallback(this.word.id);
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
