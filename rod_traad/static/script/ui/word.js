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
    this.el.style.transition = "1s ease";
    this.el.style.opacity = "0";

    await new Promise((resolve) => setTimeout(resolve, 1005));
  }

  async animateJump() {
    this.el.style.transition = "0.15s ease-in-out";
    this.el.style.transform = "translateY(-5px)";

    // Force reflow
    void this.el.offsetHeight;

    await new Promise((resolve) => setTimeout(resolve, 155));

    this.el.style.transform = "translateY(0px)";

    await new Promise((resolve) => setTimeout(resolve, 155));

    this.el.style.transition = "0s";
  }

  async animateError() {
    this.el.style.transition =
      "transform 0.15s ease-in-out, opacity 0.465s ease-in-out";
    this.el.style.transform = "translateX(-5px)";
    this.el.style.opacity = "0.5";

    // Force reflow
    void this.el.offsetHeight;

    await new Promise((resolve) => setTimeout(resolve, 155));

    this.el.style.transform = "translateX(5px)";

    // Force reflow
    void this.el.offsetHeight;

    await new Promise((resolve) => setTimeout(resolve, 155));

    this.el.style.transform = "translateX(0px)";

    await new Promise((resolve) => setTimeout(resolve, 155));

    this.el.style.opacity = "1";

    await new Promise((resolve) => setTimeout(resolve, 465));
    this.el.style.transition = "0s";
  }
}
