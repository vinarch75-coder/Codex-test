const scoreEl = document.getElementById("score");
const levelEl = document.getElementById("level");
const comboEl = document.getElementById("combo");
const livesEl = document.getElementById("lives");
const timeEl = document.getElementById("time");
const bestEl = document.getElementById("best");
const questionEl = document.getElementById("question");
const hintEl = document.getElementById("hint");
const roundTypeEl = document.getElementById("roundType");
const choicesEl = document.getElementById("choices");
const feedbackEl = document.getElementById("feedback");
const difficultyEl = document.getElementById("difficulty");
const startBtn = document.getElementById("start");
const resetBtn = document.getElementById("reset");
const badgeListEl = document.getElementById("badgeList");

const difficultySettings = {
  cadet: { timer: 30, maxDivisor: 10 },
  pilot: { timer: 25, maxDivisor: 12 },
  captain: { timer: 20, maxDivisor: 15 },
};

const badgeMilestones = [
  { combo: 3, label: "🔥 Warm-Up Wizard (3 combo)" },
  { combo: 5, label: "⚡ Laser Focus (5 combo)" },
  { combo: 8, label: "🌟 Galaxy Genius (8 combo)" },
];

const state = {
  score: 0,
  level: 1,
  combo: 0,
  lives: 3,
  timeLeft: 25,
  running: false,
  questionCount: 0,
  currentAnswer: null,
  unlockedBadges: new Set(),
  timerId: null,
};

const bestScore = Number(localStorage.getItem("divisionGalaxyBest") || 0);
bestEl.textContent = bestScore;

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const updateHud = () => {
  scoreEl.textContent = state.score;
  levelEl.textContent = state.level;
  comboEl.textContent = state.combo;
  livesEl.textContent = state.lives;
  timeEl.textContent = state.timeLeft;
};

const setFeedback = (text) => {
  feedbackEl.textContent = text;
};

const unlockBadge = () => {
  badgeMilestones.forEach((badge) => {
    if (state.combo >= badge.combo && !state.unlockedBadges.has(badge.label)) {
      state.unlockedBadges.add(badge.label);
      renderBadges();
      setFeedback(`Badge unlocked: ${badge.label}`);
    }
  });
};

const renderBadges = () => {
  badgeListEl.innerHTML = "";
  if (state.unlockedBadges.size === 0) {
    badgeListEl.innerHTML = "<li>None yet — your first streak unlocks a badge!</li>";
    return;
  }

  state.unlockedBadges.forEach((badge) => {
    const li = document.createElement("li");
    li.textContent = badge;
    badgeListEl.append(li);
  });
};

const generateQuestion = () => {
  const settings = difficultySettings[difficultyEl.value];
  const specialRound = state.questionCount > 0 && state.questionCount % 5 === 0;

  roundTypeEl.textContent = specialRound ? "Lightning Round ⚡ (+extra points)" : "Standard Round";

  const divisor = randomInt(2, settings.maxDivisor + state.level);
  const quotient = randomInt(2, Math.min(20, 8 + state.level * 2));
  let dividend = divisor * quotient;

  while (dividend > 200) {
    const newDivisor = randomInt(2, settings.maxDivisor + Math.max(1, state.level - 1));
    const newQuotient = randomInt(2, 12);
    dividend = newDivisor * newQuotient;
    state.currentAnswer = newQuotient;
    questionEl.textContent = `${dividend} ÷ ${newDivisor} = ?`;
  }

  if (dividend <= 200) {
    state.currentAnswer = quotient;
    questionEl.textContent = `${dividend} ÷ ${divisor} = ?`;
  }

  hintEl.textContent = `Hint: ${state.currentAnswer} × ${questionEl.textContent.split(" ÷ ")[1].replace(" = ?", "")} = ${questionEl.textContent.split(" ÷ ")[0]}`;

  const options = new Set([state.currentAnswer]);
  while (options.size < 4) {
    const drift = randomInt(-4, 5);
    const candidate = Math.max(1, state.currentAnswer + drift);
    options.add(candidate);
  }

  const shuffled = [...options].sort(() => Math.random() - 0.5);
  renderChoices(shuffled, specialRound);
};

const renderChoices = (answers, specialRound) => {
  choicesEl.innerHTML = "";

  answers.forEach((answer) => {
    const button = document.createElement("button");
    button.className = "choice";
    button.type = "button";
    button.textContent = answer;

    button.addEventListener("click", () => {
      if (!state.running) {
        return;
      }

      const correct = answer === state.currentAnswer;
      button.classList.add(correct ? "correct" : "wrong");

      if (correct) {
        state.combo += 1;
        const basePoints = 12 + state.level * 3;
        const comboBonus = state.combo * 2;
        const specialBonus = specialRound ? 15 : 0;
        state.score += basePoints + comboBonus + specialBonus;
        state.questionCount += 1;

        if (state.questionCount % 4 === 0) {
          state.level += 1;
          setFeedback(`Level up! You're now Level ${state.level}.`);
        } else {
          setFeedback("Correct! Engines boosted 🚀");
        }

        unlockBadge();

        window.setTimeout(generateQuestion, 350);
      } else {
        state.combo = 0;
        state.lives -= 1;
        setFeedback(`Not quite. The correct answer was ${state.currentAnswer}.`);
        choicesEl.querySelectorAll(".choice").forEach((choiceBtn) => {
          if (Number(choiceBtn.textContent) === state.currentAnswer) {
            choiceBtn.classList.add("correct");
          }
        });

        if (state.lives <= 0) {
          endGame("Out of lives! Mission failed... for now.");
          return;
        }

        window.setTimeout(generateQuestion, 700);
      }

      updateHud();
    });

    choicesEl.append(button);
  });
};

const startTimer = () => {
  state.timerId = window.setInterval(() => {
    state.timeLeft -= 1;
    updateHud();
    if (state.timeLeft <= 0) {
      endGame("Time's up! Mission complete.");
    }
  }, 1000);
};

const stopTimer = () => {
  if (state.timerId) {
    window.clearInterval(state.timerId);
    state.timerId = null;
  }
};

const startGame = () => {
  if (state.running) {
    return;
  }

  const settings = difficultySettings[difficultyEl.value];
  state.score = 0;
  state.level = 1;
  state.combo = 0;
  state.lives = 3;
  state.timeLeft = settings.timer;
  state.running = true;
  state.questionCount = 0;
  state.unlockedBadges.clear();

  renderBadges();
  updateHud();
  setFeedback("Mission started. Solve fast and keep your combo alive!");

  generateQuestion();
  stopTimer();
  startTimer();
};

const endGame = (message) => {
  state.running = false;
  stopTimer();
  choicesEl.innerHTML = "";
  questionEl.textContent = "Mission Over";
  hintEl.textContent = "Review missed facts and try for a higher score.";

  const storedBest = Number(localStorage.getItem("divisionGalaxyBest") || 0);
  if (state.score > storedBest) {
    localStorage.setItem("divisionGalaxyBest", state.score);
    bestEl.textContent = state.score;
    setFeedback(`${message} New high score: ${state.score} 🎉`);
  } else {
    setFeedback(`${message} Final Score: ${state.score}`);
    bestEl.textContent = storedBest;
  }
};

const resetGame = () => {
  stopTimer();
  state.score = 0;
  state.level = 1;
  state.combo = 0;
  state.lives = 3;
  state.timeLeft = difficultySettings[difficultyEl.value].timer;
  state.running = false;
  state.questionCount = 0;
  state.unlockedBadges.clear();

  roundTypeEl.textContent = "Standard Round";
  questionEl.textContent = "Press Start to launch your mission!";
  hintEl.textContent = "Tip: Division is the reverse of multiplication.";
  choicesEl.innerHTML = "";
  renderBadges();
  updateHud();
  setFeedback("Game reset. Ready when you are!");
};

startBtn.addEventListener("click", startGame);
resetBtn.addEventListener("click", resetGame);
difficultyEl.addEventListener("change", resetGame);

updateHud();
renderBadges();
