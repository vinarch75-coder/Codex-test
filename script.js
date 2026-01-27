const firstNumber = document.getElementById("firstNumber");
const secondNumber = document.getElementById("secondNumber");
const answerGrid = document.getElementById("answerGrid");
const feedback = document.getElementById("feedback");
const scoreValue = document.getElementById("score");
const streakValue = document.getElementById("streak");
const starsValue = document.getElementById("stars");
const newQuestionButton = document.getElementById("newQuestion");
const difficultySelect = document.getElementById("difficultySelect");

const difficultyRanges = {
  easy: 10,
  medium: 20,
  hard: 50,
};

let score = 0;
let streak = 0;
let correctAnswer = 0;

const pickNumber = (max) => Math.floor(Math.random() * (max + 1));

const setStars = () => {
  const stars = Math.min(3, Math.max(1, Math.floor(streak / 3) + 1));
  starsValue.textContent = "⭐️".repeat(stars);
};

const updateScoreboard = () => {
  scoreValue.textContent = score;
  streakValue.textContent = streak;
  setStars();
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
    const offset = Math.floor(Math.random() * 6) - 3;
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
  const max = difficultyRanges[difficultySelect.value];
  const numberOne = pickNumber(max);
  const numberTwo = pickNumber(max);

  firstNumber.textContent = numberOne;
  secondNumber.textContent = numberTwo;
  correctAnswer = numberOne + numberTwo;

  buildAnswers(correctAnswer, max);
  clearFeedback();
};

const handleAnswer = (value, button) => {
  const buttons = answerGrid.querySelectorAll(".answer-button");
  buttons.forEach((btn) => btn.classList.remove("correct", "wrong"));

  if (value === correctAnswer) {
    score += 10;
    streak += 1;
    button.classList.add("correct");
    announceFeedback("Fantastic! You got it right!", "correct");
  } else {
    score = Math.max(0, score - 2);
    streak = 0;
    button.classList.add("wrong");
    announceFeedback(`Almost! The answer was ${correctAnswer}.`, "wrong");
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
