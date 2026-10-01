import { gsap } from "gsap";
const emojis = [
  "1",
  "3",
  "4",
  "5",
  "6",
  "7",
  "f",
  "9",
  "0",
  "q",
  "w",
  "u",
  "1",
  "3",
  "4",
  "5",
  "6",
  "7",
  "f",
  "9",
  "0",
  "q",
  "w",
  "u",
];

let firstChoice = null;
let secondChoice = null;
let cardsLeftToMatch = emojis.length / 2;
let isBoardLocked = false;
let moves = 0;
let secondsElapsed = 0;
let timerId = null;
const board = document.querySelector("#board");

const shuffle = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }

  return array;
};

const startTimer = () => {
  if (timerId !== null) return;
  timerId = setInterval(() => {
    secondsElapsed++;
    timerDisplay.textContent = formatTime(secondsElapsed);
  }, 1000);
};

const stopTimer = () => {
  clearInterval(timerId);
  timerId = null;
};

const revealCard = (card) => {
  card.classList.remove("hidden");
};
const hideCard = (card) => {
  card.classList.add("hidden");
};

const createCard = (emoji) => {
  const card = document.createElement("div");
  card.dataset.emoji = emoji;
  card.classList.add("card", "hidden");

  return card;
};

const resetChoices = () => {
  firstChoice = null;
  secondChoice = null;
  isBoardLocked = false;
};

const checkForMatch = () => {
  if (firstChoice.dataset.emoji === secondChoice.dataset.emoji) {
    cardsLeftToMatch = cardsLeftToMatch - 1;
    if (cardsLeftToMatch === 0) {
      const winMessage = document.createElement("div");
      winMessage.classList.add("win-message");
      winMessage.textContent = "t'y as gagné le boss";
      board.appendChild(winMessage);
    }
    resetChoices();
  } else {
    setTimeout(() => {
      hideCard(firstChoice);
      hideCard(secondChoice);
      resetChoices();
    }, 1000);
  }
};

const startRound = () => {
  stopTimer();
  moves = 0;
  secondsElapsed = 0;
  cardsLeftToMatch = emojis.length / 2;
  movesDisplay.textContent = moves;
  timerDisplay.textContent = formatTime(secondsElapsed);
  resetChoices();
  board.innerHTML = "";

  shuffle([...emojis]).forEach((emoji) => {
    const card = createCard(emoji);

    card.addEventListener("click", () => {
      if (!card.classList.contains("hidden") || isBoardLocked || firstChoice === card) {
        return;
      }

      startTimer();
      revealCard(card);

      if (firstChoice === null) {
        firstChoice = card;
        return;
      }

      secondChoice = card;
      isBoardLocked = true;
      moves++;
      movesDisplay.textContent = moves;
      checkForMatch();
    });

    board.appendChild(card);
  });
};
  
restartButton.addEventListener("click", startRound);
startRound();