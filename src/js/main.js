const board = document.querySelector("#board");
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
 
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
shuffleArray(emojis);

emojis.forEach((emoji) => {

  const card = document.createElement("div");
  card.classList.add("card");
  card.classList.add("hidden");
  board.appendChild(card);
  card.dataset.emoji = emoji;

  card.addEventListener("click", () => {

    if (firstChoice === null) {
      firstChoice = card;
      card.classList.remove("hidden");
    }
     else if (secondChoice === null) {
	    secondChoice = card;
      card.classList.remove("hidden");
    } 
    else {
      if (firstChoice.dataset.emoji === secondChoice.dataset.emoji) {
        firstChoice = null;
        secondChoice = null;
      } else {
        firstChoice.classList.add("hidden");
        secondChoice.classList.add("hidden");
        firstChoice = null;
        secondChoice = null;
      }
    }
  });
});

