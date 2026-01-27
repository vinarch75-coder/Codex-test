const firstNumber = document.getElementById("firstNumber");
const secondNumber = document.getElementById("secondNumber");
const answerGrid = document.getElementById("answerGrid");
const feedback = document.getElementById("feedback");
const scoreValue = document.getElementById("score");
const streakValue = document.getElementById("streak");
const petalsValue = document.getElementById("petals");
const newQuestionButton = document.getElementById("newQuestion");
const difficultySelect = document.getElementById("difficultySelect");
const levelName = document.getElementById("levelName");
const levelProgressFill = document.getElementById("levelProgressFill");
const levelProgressText = document.getElementById("levelProgressText");
const levelPrize = document.getElementById("levelPrize");

const difficultyRanges = {
  easy: { min: 2, max: 12 },
  medium: { min: 4, max: 18 },
  hard: { min: 6, max: 25 },
};

const levels = [
  { name: "Seedling Starter", threshold: 0, prize: "Sticker Pack" },
  { name: "Petal Pathfinder", threshold: 60, prize: "Glitter Gel Pen" },
  { name: "Bloom Builder", threshold: 140, prize: "Floral Notebook" },
  { name: "Garden Star", threshold: 220, prize: "Flower Crown Kit" },
  {
    name: "Queen of the Garden",
    threshold: 320,
    prize: "Big Prize: VIP Garden Party",
  },
];

let score = 0;
let streak = 0;
let correctAnswer = 0;

const pickNumber = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const setPetals = () => {
  const petals = Math.min(4, Math.max(1, Math.floor(streak / 3) + 1));
  petalsValue.textContent = "🌺".repeat(petals);
};

const findLevelIndex = () => {
  for (let index = levels.length - 1; index >= 0; index -= 1) {
    if (score >= levels[index].threshold) {
      return index;
    }
  }
  return 0;
};

const updateLevelProgress = () => {
  const levelIndex = findLevelIndex();
  const currentLevel = levels[levelIndex];
  const nextLevel = levels[levelIndex + 1];

  levelName.textContent = currentLevel.name;
  levelPrize.textContent = `Prize: ${currentLevel.prize}`;

  if (!nextLevel) {
    levelProgressFill.style.width = "100%";
    levelProgressText.textContent =
      "You reached the top level! Celebrate your big prize!";
    return;
  }

  const levelSpan = nextLevel.threshold - currentLevel.threshold;
  const progress = Math.max(
    0,
    Math.min(levelSpan, score - currentLevel.threshold)
  );
  const progressPercent = Math.round((progress / levelSpan) * 100);
  levelProgressFill.style.width = `${progressPercent}%`;
  const remaining = nextLevel.threshold - score;
  levelProgressText.textContent = `${progress} / ${levelSpan} points to reach ${nextLevel.name} (${remaining} to go)`;
};

const updateScoreboard = () => {
  scoreValue.textContent = score;
  streakValue.textContent = streak;
  setPetals();
  updateLevelProgress();
};

const clearFeedback = () => {
  feedback.textContent = "";
};

const announceFeedback = (message, status) => {
  feedback.textContent = message;
  feedback.dataset.status = status;
};

const createAnswerButton = (value) => {
  const button = document.createElement("button");
  button.className = "answer-button";
  button.textContent = value;
  button.type = "button";
  button.setAttribute("role", "listitem");
  button.addEventListener("click", () => handleAnswer(value, button));
  return button;
};

const buildAnswers = (answer, max) => {
  const answers = new Set([answer]);
  while (answers.size < 4) {
    const offset = Math.floor(Math.random() * 8) - 4;
    const candidate = Math.max(0, answer + offset);
    answers.add(candidate);
  }

  const shuffled = Array.from(answers).sort(() => Math.random() - 0.5);
  answerGrid.innerHTML = "";
  shuffled.forEach((value) => {
    answerGrid.appendChild(createAnswerButton(value));
  });
};

const newQuestion = () => {
  const range = difficultyRanges[difficultySelect.value];
  const numberOne = pickNumber(range.min, range.max);
  const numberTwo = pickNumber(range.min, range.max);

  firstNumber.textContent = numberOne;
  secondNumber.textContent = numberTwo;
  correctAnswer = numberOne * numberTwo;

  buildAnswers(correctAnswer, range.max * range.max);
  clearFeedback();
};

const handleAnswer = (value, button) => {
  const buttons = answerGrid.querySelectorAll(".answer-button");
  buttons.forEach((btn) => btn.classList.remove("correct", "wrong"));

  if (value === correctAnswer) {
    score += 15;
    streak += 1;
    button.classList.add("correct");
    announceFeedback("Bloom-tastic! You got it right!", "correct");
  } else {
    score = Math.max(0, score - 5);
    streak = 0;
    button.classList.add("wrong");
    announceFeedback(`Almost! The bloom was ${correctAnswer}.`, "wrong");
  }

  updateScoreboard();
};

newQuestionButton.addEventListener("click", newQuestion);
difficultySelect.addEventListener("change", () => {
  streak = 0;
  updateScoreboard();
  newQuestion();
});

updateScoreboard();
newQuestion();
