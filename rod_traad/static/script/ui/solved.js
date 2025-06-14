export class Solved {
  constructor(index, name, words) {
    this.el = document.createElement("div");
    this.el.classList.add("solved", `solution-${index}`);

    this.h3 = document.createElement("h3");
    this.h3.innerText = name;

    this.p = document.createElement("p");
    this.p.innerHTML = words.join(", ");

    this.el.appendChild(this.h3);
    this.el.appendChild(this.p);
  }

  hide() {
    this.el.style.opacity = "0";
    this.el.style.width = "0px";

    this.h3.style.opacity = "0";
    this.p.style.opacity = "0";
    this.h3.style.scale = "0.7";
    this.p.style.scale = "0.7";
    this.h3.style.whiteSpace = "nowrap";
    this.p.style.whiteSpace = "nowrap";
  }

  async animateSolve() {
    // Force reflow
    void this.el.offsetHeight;
    this.el.style.transition = "1s ease";
    this.el.style.opacity = "1";
    this.el.style.width = "100%";
    this.el.style.position = "absolute";
    this.el.style.zIndex = "1";

    this.h3.style.transition = "1s ease";
    this.p.style.transition = "1s ease";
    this.h3.style.opacity = "1";
    this.p.style.opacity = "1";
    this.h3.style.scale = "1";
    this.p.style.scale = "1";

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}
