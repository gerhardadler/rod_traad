// a const with the solutions exists. it is an array of arrays
const selected = new Set();
const solved = [];
let mistakes = 0;
const maxMistakes = 4;

const puzzleElement = document.querySelector("#puzzle");
const wordElements = puzzleElement.querySelectorAll(".word");
const heartsElement = document.querySelector("#mistakes");

function makeGuess() {
  let correct = false;
  Object.entries(solutions).forEach(([solutionName, solution], index) => {
    if (solution.length === selected.size) {
      const isEqual = solution.every((word) => selected.has(word));

      if (isEqual) {
        // correct guess
        selected.clear();

        wordElements.forEach((word) => {
          if (solution.includes(word.innerText)) {
            word.remove();
            // word.style.position = "absolute";
            // solved.push(word.innerText);
            // const checkbox = word.querySelector('input[type="checkbox"]');
            // checkbox.checked = false;
          }
        });
        drawSolved(index + 1, solutionName, solution);
        correct = true;
      }
    }
  });
  if (!correct) {
    mistakes++;
    drawMistakes();
  }
}

function drawMistakes() {
  const hearts = heartsElement.querySelectorAll(".heart");
  hearts.forEach((heart, index) => {
    if (maxMistakes - mistakes <= index) {
      heart.classList.add("heart-lost");
    } else {
      heart.classList.remove("heart-lost");
    }
  });
}

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

  puzzleElement.insertBefore(solvedWord, puzzleElement.querySelector(".word"));
}

wordElements.forEach((word) => {
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

submitButton.addEventListener("click", makeGuess);
