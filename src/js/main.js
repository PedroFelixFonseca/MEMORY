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
let mode = "free";
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

const revealCard = (card) => {
  card.classList.remove("hidden");
};
const hideCard = (card) => {
  card.classList.add("hidden");
};

// GSAP : animation quand deux cartes ne correspondent pas
//   1. petite pause pour mémoriser les cartes
//   2. secousse gauche/droite
//   3. la carte pivote jusqu'à 90° (de profil), se cache, puis finit de pivoter
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
      onComplete: () => cards.forEach(hideCard),
    })
    .to(cards, {
      rotationY: 0,
      duration: 0.2,
      ease: "power1.out",
    });
};

// GSAP : stoppe proprement une animation en cours (restart, menu, fin de partie)
const cancelMismatchAnimation = () => {
  if (mismatchTimeline) {
    mismatchTimeline.kill();
    mismatchTimeline = null;
    gsap.set(mismatchCards, { clearProps: "transform" });
    mismatchCards.forEach(hideCard);
    mismatchCards = [];
  }
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
  cancelMismatchAnimation(); // GSAP : remplace clearTimeout(mismatchTimeoutId)
  isBoardLocked = true;

  const message = document.createElement("div");
  message.classList.add("win-message");
  if (hasWon) {
    message.textContent = "tu as gagné le boss";
  } else {
    message.classList.add("lose-message");
    message.textContent = "Temps écoulé  Tu as perdu le boss";
  }
  board.appendChild(message);
};

const checkForMatch = () => {
  if (firstChoice.dataset.emoji === secondChoice.dataset.emoji) {
    cardsLeftToMatch = cardsLeftToMatch - 1;
    resetChoices();
    if (cardsLeftToMatch === 0) {
      endGame(true);
    }
  } else {
    // GSAP : remplace le setTimeout + hideCard + resetChoices
    flipBackCards([firstChoice, secondChoice], resetChoices);
  }
};

const startRound = () => {
  stopTimer();
  cancelMismatchAnimation(); // GSAP : remplace clearTimeout(mismatchTimeoutId)
  moves = 0;
  secondsElapsed = 0;
  cardsLeftToMatch = pairsCount;
  movesDisplay.textContent = moves;
  updateTimerDisplay();
  resetChoices();
  board.innerHTML = "";

  const totalCards = pairsCount * 2;
  const columns = totalCards <= 16 ? 4 : totalCards % 6 === 0 ? 6 : 8;
  board.style.setProperty("--columns", columns);

  const pool = shuffle([...emojis]);
  const selected = Array.from({ length: pairsCount }, (_, i) => pool[i % pool.length]);
  const deck = shuffle([...selected, ...selected]);

  deck.forEach((emoji) => {
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

const showMenu = () => {
  stopTimer();
  cancelMismatchAnimation(); // GSAP : remplace clearTimeout(mismatchTimeoutId)
  game.hidden = true;
  menu.hidden = false;
  challengeSettings.hidden = true;
  modeChoice.hidden = false;
};

const launchGame = (selectedMode) => {
  mode = selectedMode;
  if (mode === "challenge") {
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
      container
        .querySelectorAll(".option")
        .forEach((b) => b.classList.toggle("selected", b === button));
    });
    container.appendChild(button);
  });
};

buildOptions(
  difficultyOptions,
  DIFFICULTIES,
  (d) => `${d.label} (${d.pairs} paires)`,
  (d) => d === challengeDifficulty,
  (d) => (challengeDifficulty = d)
);

buildOptions(
  timeOptions,
  TIME_LIMITS,
  (t) => t.label,
  (t) => t === challengeTime,
  (t) => (challengeTime = t)
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