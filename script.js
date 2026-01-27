const catImage = document.getElementById("catImage");
const dateLabel = document.getElementById("dateLabel");
const catStage = document.querySelector(".cat-stage");

const today = new Date();
const dateToken = today.toISOString().slice(0, 10).replace(/-/g, "");
const prettyDate = today.toLocaleDateString(undefined, {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

catImage.src = `https://cataas.com/cat?width=600&height=600&date=${dateToken}`;
catImage.alt = `Daily cat for ${prettyDate}`;
dateLabel.textContent = `Today is ${prettyDate}.`;

const meowAudio = new Audio(
  "https://assets.mixkit.co/sfx/preview/mixkit-cat-meow-119.mp3"
);

const spawnBubble = () => {
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = "Meow!";
  catStage.appendChild(bubble);

  bubble.addEventListener("animationend", () => {
    bubble.remove();
  });
};

const handleSpace = (event) => {
  if (event.code !== "Space") {
    return;
  }
  event.preventDefault();

  spawnBubble();
  meowAudio.currentTime = 0;
  meowAudio.play();
};

document.addEventListener("keydown", handleSpace);
