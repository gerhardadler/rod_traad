export class SubmitButton {
  constructor() {
    this.el = document.querySelector("#submit");
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
}
