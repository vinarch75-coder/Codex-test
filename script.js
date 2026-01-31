const timeLeftDisplay = document.getElementById("timeLeft");
const scoreDisplay = document.getElementById("score");
const streakDisplay = document.getElementById("streak");
const missesDisplay = document.getElementById("misses");
const difficultySelect = document.getElementById("difficultySelect");
const startButton = document.getElementById("startGame");
const resetButton = document.getElementById("resetGame");
const playArea = document.getElementById("playArea");
const statusMessage = document.getElementById("statusMessage");

const difficultySettings = {
  chill: { spawnRate: 1400, lifetime: 3600, maxBubbles: 6 },
  party: { spawnRate: 1000, lifetime: 3000, maxBubbles: 8 },
  frenzy: { spawnRate: 750, lifetime: 2400, maxBubbles: 10 },
};

const gameState = {
  timeLeft: 60,
  score: 0,
  streak: 0,
  misses: 0,
  isRunning: false,
  spawnTimer: null,
  countdownTimer: null,
};

const updateScoreboard = () => {
  timeLeftDisplay.textContent = gameState.timeLeft;
  scoreDisplay.textContent = gameState.score;
  streakDisplay.textContent = gameState.streak;
  missesDisplay.textContent = gameState.misses;
};

const clearBubbles = () => {
  playArea.querySelectorAll(".bubble").forEach((bubble) => bubble.remove());
};

const showMessage = (message) => {
  statusMessage.textContent = message;
  statusMessage.hidden = false;
};

const hideMessage = () => {
  statusMessage.hidden = true;
};

const randomBetween = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const createBubble = () => {
  if (!gameState.isRunning) {
    return;
  }

  const { lifetime, maxBubbles } =
    difficultySettings[difficultySelect.value];

  if (playArea.querySelectorAll(".bubble").length >= maxBubbles) {
    return;
  }

  const bubble = document.createElement("button");
  bubble.type = "button";
  bubble.className = "bubble";

  const size = randomBetween(46, 90);
  const maxX = playArea.clientWidth - size;
  const maxY = playArea.clientHeight - size;
  const x = randomBetween(0, Math.max(0, maxX));
  const y = randomBetween(0, Math.max(0, maxY));

  bubble.style.width = `${size}px`;
  bubble.style.height = `${size}px`;
  bubble.style.left = `${x}px`;
  bubble.style.top = `${y}px`;
  bubble.style.animationDuration = `${lifetime}ms`;
  bubble.textContent = "+1";

  const popBubble = () => {
    if (!bubble.isConnected) {
      return;
    }
    bubble.remove();
    gameState.score += 10 + gameState.streak * 2;
    gameState.streak += 1;
    updateScoreboard();
  };

  bubble.addEventListener("click", popBubble);

  const missTimeout = window.setTimeout(() => {
    if (!bubble.isConnected) {
      return;
    }
    bubble.remove();
    gameState.misses += 1;
    gameState.streak = 0;
    updateScoreboard();
  }, lifetime + 400);

  bubble.addEventListener("animationend", () => {
    window.clearTimeout(missTimeout);
    if (bubble.isConnected) {
      bubble.remove();
      gameState.misses += 1;
      gameState.streak = 0;
      updateScoreboard();
    }
  });

  playArea.appendChild(bubble);
};

const startSpawning = () => {
  const { spawnRate } = difficultySettings[difficultySelect.value];
  gameState.spawnTimer = window.setInterval(createBubble, spawnRate);
};

const stopSpawning = () => {
  if (gameState.spawnTimer) {
    window.clearInterval(gameState.spawnTimer);
    gameState.spawnTimer = null;
  }
};

const startCountdown = () => {
  gameState.countdownTimer = window.setInterval(() => {
    gameState.timeLeft -= 1;
    updateScoreboard();
    if (gameState.timeLeft <= 0) {
      endGame();
    }
  }, 1000);
};

const stopCountdown = () => {
  if (gameState.countdownTimer) {
    window.clearInterval(gameState.countdownTimer);
    gameState.countdownTimer = null;
  }
};

const startGame = () => {
  if (gameState.isRunning) {
    return;
  }

  gameState.isRunning = true;
  gameState.timeLeft = 60;
  gameState.score = 0;
  gameState.streak = 0;
  gameState.misses = 0;
  updateScoreboard();
  clearBubbles();
  hideMessage();

  startSpawning();
  startCountdown();
};

const endGame = () => {
  gameState.isRunning = false;
  stopSpawning();
  stopCountdown();
  clearBubbles();
  showMessage(`Time's up! Final score: ${gameState.score}`);
};

const resetGame = () => {
  gameState.isRunning = false;
  stopSpawning();
  stopCountdown();
  clearBubbles();
  gameState.timeLeft = 60;
  gameState.score = 0;
  gameState.streak = 0;
  gameState.misses = 0;
  updateScoreboard();
  showMessage("Press Start to begin popping bubbles!");
};

startButton.addEventListener("click", startGame);
resetButton.addEventListener("click", resetGame);

difficultySelect.addEventListener("change", () => {
  if (!gameState.isRunning) {
    return;
  }
  stopSpawning();
  startSpawning();
});

updateScoreboard();
showMessage("Press Start to begin popping bubbles!");
