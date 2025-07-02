import { drawEmail } from "./ui/email.js";

document.addEventListener("DOMContentLoaded", () => {
  const puzzleData = {
    grid: [
      ["", "", "", ""],
      ["", "", "", ""],
      ["", "", "", ""],
      ["", "", "", ""],
    ],
    solutions: {
      "": ["", "", "", ""],
      1: ["", "", "", ""],
      2: ["", "", "", ""],
      3: ["", "", "", ""],
    },
  };
  drawEmail();

  document.querySelector(".content").classList.remove("fade-in");
  document.querySelector("body").classList.remove("no-animate");

  document.querySelectorAll(".solution").forEach((solution) => {
    const solutionNameElement = solution.querySelector("#solution-name");
    // const solutionWordInputElement = solution.querySelector("word-input");
    solutionNameElement.addEventListener("input", (event) => {
      const solutionName = event.target.value;
      const solutionId = parseInt(solution.dataset.solutionId);
      Object.keys(puzzleData.solutions)[solutionId] = solutionName;
      console.log(puzzleData);
    });
  });
});
