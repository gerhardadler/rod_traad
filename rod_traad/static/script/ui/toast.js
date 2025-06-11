import { animateElement } from "../utils.js?2025-06-11T22:00:03";

class Toast {
  constructor(message) {
    this.message = message;
    this.el = document.createElement("div");
    this.el.classList.add("toast");
    this.el.textContent = message;
  }

  animateIn() {
    return animateElement(this.el, "fade-in", 500, "ease-in-out");
  }

  animateOut() {
    return animateElement(this.el, "fade-out", 500, "ease-in-out");
  }
}

export class ToastContainer {
  constructor() {
    this.el = document.createElement("div");
    this.el.classList.add("toast-container");
  }

  async addToast(message) {
    const toast = new Toast(message);
    this.el.appendChild(toast.el);
    await toast.animateIn();

    // let the toast be visible for a while
    await new Promise((resolve) => setTimeout(resolve, 2000));

    await toast.animateOut();
    toast.el.remove();
  }
}
