export class Button {
  constructor(el) {
    this.el = el;
  }

  static fromSelector(selector) {
    const el = document.querySelector(selector);
    return new Button(el);
  }

  setDisabled(disabled) {
    if (disabled) {
      this.el.classList.add("disabled");
      this.el.disabled = true;
    } else {
      this.el.classList.remove("disabled");
      this.el.disabled = false;
    }
  }

  temporarilyDisable(promise) {
    const wasDisabled = this.el.disabled;
    this.setDisabled(true);
    return promise.finally(() => {
      this.setDisabled(wasDisabled);
    });
  }
}
