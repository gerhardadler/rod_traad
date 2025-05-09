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

  animateMove(gridSize, gapSize, startIndex, endIndex) {
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

    this.el.style.transition = "0.5s ease-in-out";
    this.el.style.transform = `translate(${endPosition[0]}, ${endPosition[1]})`;
  }
}
