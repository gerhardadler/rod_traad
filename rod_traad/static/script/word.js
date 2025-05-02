export class WordItem {
  constructor(el, game, ui) {
    this.el = el;
    this.game = game;
    this.ui = ui;
    this.checkbox = el.querySelector("input[type='checkbox']");

    this.el.addEventListener("mousedown", () => {
      const wordText = this.el.innerText;
      const alreadySelected = this.checkbox.checked;

      if (!this.game.toggleWord(wordText)) return;

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
}
