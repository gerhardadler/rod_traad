import { animateElement } from "../utils.js";

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

  addToast(message) {
    const toast = new Toast(message);
    this.el.appendChild(toast.el);
    toast.animateIn().then(() => {
      // Automatically remove the toast after a delay
      setTimeout(() => {
        toast.animateOut().then(() => {
          toast.el.remove();
        });
      }, 3000);
    });
  }
}
