export class Button {
  constructor(selector) {
    this.el = document.querySelector(selector);
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
