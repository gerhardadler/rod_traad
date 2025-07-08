import { drawEmail } from "./ui/email.js";
import { WordItem } from "./ui/word.js";

function shuffle(array) {
  // https://stackoverflow.com/a/2450976
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
}

function wordById(puzzleData, wordId) {
  return puzzleData.words.find((w) => w.id === wordId);
}

function wordsByIds(puzzleData, wordIds) {
  return puzzleData.words.filter((w) => wordIds.includes(w.id));
}

function drawGrid(puzzleData) {
  document.querySelector("body").classList.add("no-animate");

  const unsolvedContainer = document.querySelector(".unsolved-container");
  // const wordElements = unsolvedContainer.querySelectorAll(".word");

  const wordsByPositions = [...puzzleData.words].sort(
    (a, b) => a.position > b.position
  );
  unsolvedContainer.innerHTML = "";
  wordsByPositions.forEach((word) => {
    const wordItem = new WordItem(word);
    unsolvedContainer.appendChild(wordItem.el);

    wordItem.scaleText();
  });
  document.querySelector("body").classList.remove("no-animate");
}

function swapSolutions(puzzleData, solutionElement, direction) {
  // chatgpt

  const adjacentSolutionElement =
    direction === "down"
      ? solutionElement.nextElementSibling
      : solutionElement.previousElementSibling;

  if (!adjacentSolutionElement) return;

  const getElements = (el) => ({
    name: el.querySelector(".solution-name"),
    word: el.querySelector(".word-input"),
  });

  const currentElements = getElements(solutionElement);
  const currentSolution = puzzleData.solutions.find(
    (s) => s.difficulty === parseInt(solutionElement.dataset.difficulty)
  );

  const adjacentElements = getElements(adjacentSolutionElement);
  const adjacentSolution = puzzleData.solutions.find(
    (s) => s.difficulty === parseInt(adjacentSolutionElement.dataset.difficulty)
  );

  // Swap values
  [currentElements.name.value, adjacentElements.name.value] = [
    adjacentElements.name.value,
    currentElements.name.value,
  ];
  [currentElements.word.value, adjacentElements.word.value] = [
    adjacentElements.word.value,
    currentElements.word.value,
  ];

  const currentWords = wordsByIds(puzzleData, currentSolution.words);
  const adjacentWords = wordsByIds(puzzleData, adjacentSolution.words);

  currentWords.forEach((currentWord, i) => {
    const adjacentWord = adjacentWords[i];
    [currentWord.position, adjacentWord.position] = [
      adjacentWord.position,
      currentWord.position,
    ];
  });

  // Trigger input events
  [
    currentElements.name,
    currentElements.word,
    adjacentElements.name,
    adjacentElements.word,
  ].forEach((el) => {
    el.dispatchEvent(new Event("input"));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const puzzleData = {
    solutions: [
      { name: "", difficulty: 0, words: [0, 1, 2, 3] },
      { name: "", difficulty: 1, words: [4, 5, 6, 7] },
      { name: "", difficulty: 2, words: [8, 9, 10, 11] },
      { name: "", difficulty: 3, words: [12, 13, 14, 15] },
    ],
    words: [
      { id: 0, name: "", position: 0 },
      { id: 1, name: "", position: 1 },
      { id: 2, name: "", position: 2 },
      { id: 3, name: "", position: 3 },
      { id: 4, name: "", position: 4 },
      { id: 5, name: "", position: 5 },
      { id: 6, name: "", position: 6 },
      { id: 7, name: "", position: 7 },
      { id: 8, name: "", position: 8 },
      { id: 9, name: "", position: 9 },
      { id: 10, name: "", position: 10 },
      { id: 11, name: "", position: 11 },
      { id: 12, name: "", position: 12 },
      { id: 13, name: "", position: 13 },
      { id: 14, name: "", position: 14 },
      { id: 15, name: "", position: 15 },
    ],
  };

  const randomPositions = [...Array(16).keys()];
  shuffle(randomPositions);

  puzzleData.words.forEach((word, i) => {
    word.position = word.position = randomPositions[i];
  });

  drawEmail();
  drawGrid(puzzleData);

  document.querySelector(".content").classList.remove("fade-in");
  document.querySelector("body").classList.remove("no-animate");

  document.querySelectorAll(".solution").forEach((solution) => {
    const solutionNameElement = solution.querySelector(".solution-name");
    const solutionWordInputElement = solution.querySelector(".word-input");
    const arrowDown = solution.querySelector(".arrow-down");
    const arrowUp = solution.querySelector(".arrow-up");

    const difficulty = parseInt(solution.dataset.difficulty);
    const currentSolution = puzzleData.solutions.find(
      (s) => s.difficulty === difficulty
    );

    solutionNameElement.addEventListener("input", (event) => {
      const solutionName = event.target.value;
      currentSolution.name = solutionName;
    });

    solutionWordInputElement.addEventListener("input", (event) => {
      const solutionWords = event.target.value.split(",").map((s) => s.trim());
      const fixedSolutionWords = solutionWords
        .concat(["", "", "", ""])
        .slice(0, 4);

      fixedSolutionWords.slice(0, 4).forEach((word, i) => {
        wordById(puzzleData, currentSolution.words[i]).name = word;
      });
      drawGrid(puzzleData);
    });

    arrowDown.addEventListener("click", () =>
      swapSolutions(puzzleData, solution, "down")
    );

    arrowUp.addEventListener("click", () =>
      swapSolutions(puzzleData, solution, "up")
    );
  });
});
