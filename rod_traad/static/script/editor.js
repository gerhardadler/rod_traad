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
  return puzzleData.data.words.find((w) => w.id === wordId);
}

function wordsByIds(puzzleData, wordIds) {
  return puzzleData.data.words.filter((w) => wordIds.includes(w.id));
}

function drawGrid(puzzleData) {
  document.querySelector("body").classList.add("no-animate");

  const unsolvedContainer = document.querySelector(".unsolved-container");

  const wordsByPositions = [...puzzleData.data.words].sort(
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

function drawMoveGrid(puzzleData, selectWordCallback) {
  const unsolvedContainer = document.querySelector(".unsolved-container");
  unsolvedContainer.classList.add("no-animate");
  const wordsByPositions = [...puzzleData.data.words].sort(
    (a, b) => a.position > b.position
  );

  const gapSize = window
    .getComputedStyle(unsolvedContainer)
    .getPropertyValue("gap");

  let wordItems = [];

  unsolvedContainer.innerHTML = "";
  wordsByPositions.forEach((word) => {
    const wordItem = new WordItem(word, () => {
      selectWordCallback(word);
    });
    wordItems.push(wordItem);
    unsolvedContainer.appendChild(wordItem.el);

    wordItem.scaleText();
  });
  unsolvedContainer.classList.remove("no-animate");

  async function animateMove(wordFrom, wordTo) {
    const fromWordItem = wordItems.find((wi) => wi.word.id == wordFrom.id);
    const toWordItem = wordItems.find((wi) => wi.word.id == wordTo.id);

    if (fromWordItem === toWordItem) return;

    unsolvedContainer.insertBefore(
      document.createElement("div"),
      fromWordItem.el
    );
    fromWordItem.animateMove(
      [4, 4],
      gapSize,
      wordFrom.position,
      wordTo.position
    );

    unsolvedContainer.insertBefore(
      document.createElement("div"),
      toWordItem.el
    );
    await toWordItem.animateMove(
      [4, 4],
      gapSize,
      wordTo.position,
      wordFrom.position
    );
  }
  return animateMove;
}

function drawSolutions(puzzleData) {
  const solutions = document.querySelectorAll(".solution");
  solutions.forEach((solution) => {
    const difficulty = parseInt(solution.dataset.difficulty);
    const currentSolution = puzzleData.data.solutions.find(
      (s) => s.difficulty === difficulty
    );

    const solutionNameElement = solution.querySelector(".solution-name");
    const solutionWordInputElement = solution.querySelector(".word-input");

    solutionNameElement.value = currentSolution.name;
    solutionWordInputElement.value = currentSolution.words
      .map((id) => wordById(puzzleData, id).name)
      .filter((w) => w)
      .join(", ");
  });
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
  const currentSolution = puzzleData.data.solutions.find(
    (s) => s.difficulty === parseInt(solutionElement.dataset.difficulty)
  );

  const adjacentElements = getElements(adjacentSolutionElement);
  const adjacentSolution = puzzleData.data.solutions.find(
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

function savePuzzleData(puzzleData) {
  localStorage.setItem("puzzleData", JSON.stringify(puzzleData));
}

function loadPuzzleData() {
  const data = localStorage.getItem("puzzleData");
  if (data) {
    return JSON.parse(data);
  }
  const puzzleData = {
    name: "",
    author: "",
    data: {
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
    },
  };

  const randomPositions = [...Array(16).keys()];
  shuffle(randomPositions);

  puzzleData.data.words.forEach((word, i) => {
    word.position = word.position = randomPositions[i];
  });

  return puzzleData;
}

document.addEventListener("DOMContentLoaded", () => {
  const puzzleNameElement = document.querySelector("#puzzle-name");
  const puzzleAuthorElement = document.querySelector("#puzzle-author");
  const solutions = document.querySelectorAll(".solution");
  const moveButton = document.querySelector("#move-button");
  const moveTooltip = document.querySelector("#move-tooltip");
  const publishButton = document.querySelector("#publish-button");

  const puzzleData = loadPuzzleData();

  drawEmail();
  drawGrid(puzzleData);
  drawSolutions(puzzleData);

  document.querySelector(".content").classList.remove("fade-in");
  document.querySelector("body").classList.remove("no-animate");

  puzzleNameElement.value = puzzleData.name;
  puzzleAuthorElement.value = puzzleData.author;

  puzzleNameElement.addEventListener("input", (event) => {
    puzzleData.name = event.target.value;
    savePuzzleData(puzzleData);
  });
  puzzleAuthorElement.addEventListener("input", (event) => {
    puzzleData.author = event.target.value;
    savePuzzleData(puzzleData);
  });

  solutions.forEach((solution) => {
    const solutionNameElement = solution.querySelector(".solution-name");
    const solutionWordInputElement = solution.querySelector(".word-input");
    const arrowDown = solution.querySelector(".arrow-down");
    const arrowUp = solution.querySelector(".arrow-up");

    const difficulty = parseInt(solution.dataset.difficulty);
    const currentSolution = puzzleData.data.solutions.find(
      (s) => s.difficulty === difficulty
    );

    solutionNameElement.addEventListener("input", (event) => {
      const solutionName = event.target.value;
      currentSolution.name = solutionName;
      savePuzzleData(puzzleData);
    });

    solutionWordInputElement.addEventListener("input", (event) => {
      const solutionWords = event.target.value.split(",").map((s) => s.trim());
      const fixedSolutionWords = solutionWords
        .concat(["", "", "", ""])
        .slice(0, 4);

      fixedSolutionWords.slice(0, 4).forEach((word, i) => {
        wordById(puzzleData, currentSolution.words[i]).name = word;
      });
      savePuzzleData(puzzleData);
      drawGrid(puzzleData);
    });

    arrowDown.addEventListener("click", () => {
      swapSolutions(puzzleData, solution, "down");
      savePuzzleData(puzzleData);
    });

    arrowUp.addEventListener("click", () => {
      swapSolutions(puzzleData, solution, "up");
      savePuzzleData(puzzleData);
    });
  });

  let isMoving = false;
  moveButton.addEventListener("click", () => {
    function stopMove() {
      puzzleData.data.words.forEach((w) => {
        delete w.selected;
      });
      savePuzzleData(puzzleData);
      drawGrid(puzzleData);
      isMoving = false;
      moveButton.classList.remove("moving");
      moveTooltip.classList.remove("moving");
    }
    if (isMoving) {
      stopMove();
      return;
    }

    isMoving = true;
    moveButton.classList.add("moving");
    moveTooltip.classList.add("moving");

    document.onkeydown = function (evt) {
      evt = evt;
      var isEscape = false;
      if ("key" in evt) {
        isEscape = evt.key === "Escape" || evt.key === "Esc";
      } else {
        isEscape = evt.keyCode === 27;
      }
      if (isEscape) {
        stopMove();
      }
    };

    void moveButton.offsetHeight; // Trigger reflow

    let firstWord = null;

    async function selectWord(word) {
      if (firstWord == null) {
        firstWord = word;
        firstWord.selected = true;
        drawMoveGrid(puzzleData, selectWord);
        return;
      }
      const animateMove = drawMoveGrid(puzzleData, () => {});
      await animateMove(firstWord, word);
      [firstWord.position, word.position] = [word.position, firstWord.position];
      stopMove();
    }
    drawMoveGrid(puzzleData, selectWord);
  });

  publishButton.addEventListener("click", () => {
    fetch("/api/puzzle/unofficial", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(puzzleData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        alert("Puzzle published successfully!");
        console.log("Puzzle data:", data);
      })
      .catch((error) => {
        console.error("Error publishing puzzle:", error);
        alert("Failed to publish puzzle. Please try again.");
      });
  });
});
