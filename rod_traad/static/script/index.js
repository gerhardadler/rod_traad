// a const with the solutions exists. it is an array of arrays
const selected = new Set();
const solved = [];
let mistakes = 0;
const maxMistakes = 4;

const puzzle = document.querySelector("#puzzle");
const words = puzzle.querySelectorAll(".word");

function drawSolved(solutionNumber, solutionName, words) {
  const solvedWord = document.createElement("div");
  solvedWord.classList.add("solved");
  solvedWord.classList.add(`solution-${solutionNumber}`);
  const solvedWordTitle = document.createElement("h3");
  const solvedWordText = document.createElement("p");
  solvedWordTitle.innerText = solutionName;
  solvedWordText.innerText = words.join(", ");
  solvedWord.appendChild(solvedWordTitle);
  solvedWord.appendChild(solvedWordText);

  puzzle.insertBefore(solvedWord, puzzle.querySelector(".word"));
}

words.forEach((word) => {
  const checkbox = word.querySelector('input[type="checkbox"]');

  function shrinkCheckbox() {
    word.classList.add("shrink");

    function removeShrink() {
      word.classList.remove("shrink");
      document.removeEventListener("mouseup", removeShrink);
    }

    document.addEventListener("mouseup", removeShrink);
  }

  word.addEventListener("mousedown", () => {
    if (checkbox.checked) {
      selected.delete(word.innerText);
      checkbox.checked = !checkbox.checked;
      shrinkCheckbox();
      return;
    }

    if (selected.size >= 4) {
      return;
    }

    selected.add(word.innerText);
    checkbox.checked = !checkbox.checked;
    shrinkCheckbox();
  });
  word.addEventListener("click", (e) => {
    e.preventDefault();
  });
});

const submitButton = document.querySelector("#submit");

submitButton.addEventListener("click", (e) => {
  Object.entries(solutions).forEach(([solutionName, solution], index) => {
    if (solution.length === selected.size) {
      const isEqual = solution.every((word) => selected.has(word));

      if (isEqual) {
        selected.clear();

        words.forEach((word) => {
          if (solution.includes(word.innerText)) {
            word.remove();
            // word.style.position = "absolute";
            // solved.push(word.innerText);
            // const checkbox = word.querySelector('input[type="checkbox"]');
            // checkbox.checked = false;
          }
        });
        drawSolved(index + 1, solutionName, solution);
        return;
      }
    }
  });
});
