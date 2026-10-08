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
  "u"
];

const DIFFICULTIES = [
  { label: "Facile", pairs: 4 },
  { label: "Moyen", pairs: 8 },
  { label: "Difficile", pairs: 16 },
  { label: "Expert", pairs: 24 },
];

const TIME_LIMITS = [
  { label: "1 min", seconds: 60 },
  { label: "2 min", seconds: 120 },
  { label: "5 min", seconds: 300 },
  { label: "10 min", seconds: 600 },
];

let firstChoice = null;
let secondChoice = null;
let cardsLeftToMatch = 0;
let isBoardLocked = false;
let moves = 0;
let secondsElapsed = 0;
let timerId = null;
let pairsCount = 12;
let timeLimit = null;
let challengeDifficulty = DIFFICULTIES[0];
let challengeTime = TIME_LIMITS[1];
let mismatchTimeline = null;
let mismatchCards = [];

const board = document.querySelector("#board");
const movesDisplay = document.querySelector("#moves");
const timerDisplay = document.querySelector("#timer");
const restartButton = document.querySelector("#restart");
const menu = document.querySelector("#menu");
const modeChoice = document.querySelector("#mode-choice");
const challengeSettings = document.querySelector("#challenge-settings");
const difficultyOptions = document.querySelector("#difficulty-options");
const timeOptions = document.querySelector("#time-options");
const game = document.querySelector("#game");

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
};

const updateTimerDisplay = () => {
  const value = timeLimit !== null ? timeLimit - secondsElapsed : secondsElapsed;
  timerDisplay.textContent = formatTime(Math.max(value, 0));
};

const shuffle = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const setCardVisibility = (card, visible) => {
  card.classList.toggle("hidden", !visible);
};

const startTimer = () => {
  if (timerId !== null) return;

  timerId = setInterval(() => {
    secondsElapsed++;
    updateTimerDisplay();

    if (timeLimit !== null && secondsElapsed >= timeLimit) {
      endGame(false);
    }
  }, 1000);
};

const stopTimer = () => {
  clearInterval(timerId);
  timerId = null;
};

const flipBackCards = (cards, onDone) => {
  mismatchCards = cards;
  mismatchTimeline = gsap.timeline({
    delay: 0.6,
    onComplete: () => {
      gsap.set(cards, { clearProps: "transform" });
      mismatchTimeline = null;
      mismatchCards = [];
      onDone();
    },
  });

  mismatchTimeline
    .to(cards, {
      x: -8,
      duration: 0.05,
      repeat: 5,
      yoyo: true,
      ease: "power1.inOut",
    })
    .to(cards, {
      rotationY: 90,
      transformPerspective: 600,
      duration: 0.2,
      ease: "power1.in",
      onComplete: () => cards.forEach((card) => setCardVisibility(card, false)),
    })
    .to(cards, {
      rotationY: 0,
      duration: 0.2,
      ease: "power1.out",
    });
};

const cancelMismatchAnimation = () => {
  if (!mismatchTimeline) return;

  mismatchTimeline.kill();
  mismatchTimeline = null;
  gsap.set(mismatchCards, { clearProps: "transform" });
  mismatchCards.forEach((card) => setCardVisibility(card, false));
  mismatchCards = [];
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

const endGame = (hasWon) => {
  stopTimer();
  cancelMismatchAnimation();
  isBoardLocked = true;

  const message = document.createElement("div");
  message.classList.add(hasWon ? "win-message" : "lose-message");
  message.textContent = hasWon ? "tu as gagné le boss" : "Temps écoulé  Tu as perdu le boss";
  board.appendChild(message);
};

const checkForMatch = () => {
  if (firstChoice.dataset.emoji === secondChoice.dataset.emoji) {
    cardsLeftToMatch -= 1;
    resetChoices();

    if (cardsLeftToMatch === 0) {
      endGame(true);
    }
    return;
  }

  flipBackCards([firstChoice, secondChoice], resetChoices);
};

const handleCardClick = (card) => {
  if (!card.classList.contains("hidden") || isBoardLocked || firstChoice === card) {
    return;
  }

  startTimer();
  setCardVisibility(card, true);

  if (firstChoice === null) {
    firstChoice = card;
    return;
  }

  secondChoice = card;
  isBoardLocked = true;
  moves += 1;
  movesDisplay.textContent = moves;
  checkForMatch();
};

const createDeck = () => {
  const selected = Array.from({ length: pairsCount }, (_, index) => emojis[index % emojis.length]);
  return shuffle(selected.flatMap((emoji) => [emoji, emoji]));
};

const startRound = () => {
  stopTimer();
  cancelMismatchAnimation();
  moves = 0;
  secondsElapsed = 0;
  cardsLeftToMatch = pairsCount;
  movesDisplay.textContent = moves;
  updateTimerDisplay();
  resetChoices();
  board.innerHTML = "";

  const totalCards = pairsCount * 2;
  board.style.setProperty("--columns", totalCards <= 16 ? 4 : totalCards % 6 === 0 ? 6 : 8);

  createDeck().forEach((emoji) => {
    const card = createCard(emoji);
    card.addEventListener("click", () => handleCardClick(card));
    board.appendChild(card);
  });
};

const showMenu = () => {
  stopTimer();
  cancelMismatchAnimation();
  game.hidden = true;
  menu.hidden = false;
  challengeSettings.hidden = true;
  modeChoice.hidden = false;
};

const launchGame = (selectedMode) => {
  if (selectedMode === "challenge") {
    pairsCount = challengeDifficulty.pairs;
    timeLimit = challengeTime.seconds;
  } else {
    pairsCount = 24;
    timeLimit = null;
  }

  menu.hidden = true;
  game.hidden = false;
  startRound();
};

const buildOptions = (container, items, getLabel, isSelected, onSelect) => {
  container.innerHTML = "";

  items.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.classList.add("option");
    button.textContent = getLabel(item);
    button.classList.toggle("selected", isSelected(item));

    button.addEventListener("click", () => {
      onSelect(item);
      container.querySelectorAll(".option").forEach((option) => {
        option.classList.toggle("selected", option === button);
      });
    });

    container.appendChild(button);
  });
};

buildOptions(
  difficultyOptions,
  DIFFICULTIES,
  (difficulty) => `${difficulty.label} (${difficulty.pairs} paires)`,
  (difficulty) => difficulty === challengeDifficulty,
  (difficulty) => {
    challengeDifficulty = difficulty;
  }
);

buildOptions(
  timeOptions,
  TIME_LIMITS,
  (time) => time.label,
  (time) => time === challengeTime,
  (time) => {
    challengeTime = time;
  }
);

document.querySelector("#mode-free").addEventListener("click", () => launchGame("free"));
document.querySelector("#mode-challenge").addEventListener("click", () => {
  modeChoice.hidden = true;
  challengeSettings.hidden = false;
});
document.querySelector("#start-challenge").addEventListener("click", () => launchGame("challenge"));
document.querySelector("#back").addEventListener("click", showMenu);
document.querySelector("#menu-btn").addEventListener("click", showMenu);
restartButton.addEventListener("click", startRound);

showMenu();