const emojis = [
  "👄",
  "🧚‍♀️",
  "💩",
  "🐢",
  "🤡",
  "👁️",
  "🐤",
  "🙊",
  "🌽",
  "🌵",
  "🌻",
  "🐝",
  "👄",
  "🧚‍♀️",
  "💩",
  "🐢",
  "🤡",
  "👁️",
  "🐤",
  "🙊",
  "🌽",
  "🌵",
  "🌻",
  "🐝",
];

let firstChoice = null;
let secondChoice = null;
let cardsLeftToMatch = emojis.length / 2;
let isBoardLocked = false;
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
      window.alert("Bravo !");
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

shuffle(emojis).forEach((emoji) => {
  const card = createCard(emoji);

  card.addEventListener("click", () => {
    if (
      !card.classList.contains("hidden") ||
      isBoardLocked || // on utilise cette variable pour vérifier si le plateau doit être bloqué
      firstChoice === card
    ) {
      return; // early return
    }

    revealCard(card);

    if (firstChoice === null) {
      firstChoice = card;
      return; // early return
    }

    secondChoice = card;
    isBoardLocked = true; // on bloque le jeu dès que la seconde carte a été choisie
    checkForMatch(); // on appelle la fonction pour vérifier le résultat
  });

  board.appendChild(card);
});