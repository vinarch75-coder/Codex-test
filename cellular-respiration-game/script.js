const stages = [
  {
    id: "glycolysis",
    title: "Glycolysis",
    location: "Cytosol",
    output: "2 ATP (net), 2 NADH, 2 pyruvate",
    checkpoint: "Priming glucose and splitting into pyruvate."
  },
  {
    id: "pyruvate",
    title: "Pyruvate Oxidation",
    location: "Mitochondrial matrix",
    output: "2 NADH, 2 acetyl-CoA, CO₂",
    checkpoint: "Link reaction before the TCA cycle."
  },
  {
    id: "tca",
    title: "TCA Cycle",
    location: "Mitochondrial matrix",
    output: "2 ATP (GTP), 6 NADH, 2 FADH₂",
    checkpoint: "Carbon harvesting with NADH/FADH₂ payoff."
  },
  {
    id: "etc",
    title: "ETC & Ox Phos",
    location: "Inner mitochondrial membrane",
    output: "~26-28 ATP, H₂O",
    checkpoint: "Electron transport drives ATP synthase."
  }
];

const questions = [
  {
    prompt: "Which complex is inhibited by cyanide poisoning?",
    options: [
      "Complex IV (cytochrome c oxidase)",
      "Complex II (succinate dehydrogenase)",
      "ATP synthase (Complex V)",
      "Complex I (NADH dehydrogenase)"
    ],
    answer: 0
  },
  {
    prompt: "During hypoxia, which process can still generate ATP in the cytosol?",
    options: [
      "Glycolysis",
      "TCA cycle",
      "Electron transport chain",
      "Beta-oxidation"
    ],
    answer: 0
  },
  {
    prompt: "Which shuttle moves cytosolic NADH into the mitochondria in muscle?",
    options: [
      "Glycerol-3-phosphate shuttle",
      "Malate-aspartate shuttle",
      "Citrate shuttle",
      "Carnitine shuttle"
    ],
    answer: 0
  },
  {
    prompt: "A rise in mitochondrial membrane permeability directly reduces what?",
    options: [
      "ATP production",
      "Glycolysis rate",
      "Cytosolic NADH",
      "Glucose uptake"
    ],
    answer: 0
  }
];

const cardPool = document.getElementById("cardPool");
const pathway = document.getElementById("pathway");
const feedback = document.getElementById("feedback");
const atpTotal = document.getElementById("atpTotal");
const checkpointTotal = document.getElementById("checkpointTotal");
const attempts = document.getElementById("attempts");
const checkButton = document.getElementById("checkButton");
const resetButton = document.getElementById("resetButton");
const questionText = document.getElementById("questionText");
const answerButtons = document.getElementById("answerButtons");

let selectedStages = [];
let atpBank = 0;
let checkpointCount = 0;
let attemptCount = 0;
let questionIndex = 0;
let questionUnlocked = false;

function shuffle(array) {
  return array
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

function renderCards() {
  cardPool.innerHTML = "";
  const poolStages = shuffle(stages);
  poolStages.forEach((stage) => {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.stage = stage.id;
    card.innerHTML = `
      <span class="badge">${stage.location}</span>
      <div class="title">${stage.title}</div>
      <div class="meta">Output: ${stage.output}</div>
    `;
    card.addEventListener("click", () => addStage(stage));
    cardPool.appendChild(card);
  });
}

function renderPathway() {
  pathway.innerHTML = "";
  selectedStages.forEach((stage) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="title">${stage.title}</div>
      <div class="meta">${stage.checkpoint}</div>
    `;
    card.addEventListener("click", () => removeStage(stage.id));
    pathway.appendChild(card);
  });
}

function addStage(stage) {
  if (selectedStages.find((item) => item.id === stage.id)) {
    feedbackMessage("That stage is already in the pathway.", "warning");
    return;
  }
  if (selectedStages.length >= stages.length) {
    feedbackMessage("Pathway is full. Remove a card to swap.", "warning");
    return;
  }
  selectedStages.push(stage);
  renderPathway();
  feedbackMessage("Stage added. Keep building!", "");
}

function removeStage(stageId) {
  selectedStages = selectedStages.filter((stage) => stage.id !== stageId);
  renderPathway();
  feedbackMessage("Stage removed.", "");
}

function feedbackMessage(message, status) {
  feedback.textContent = message;
  feedback.className = `feedback ${status}`.trim();
}

function updateStats() {
  atpTotal.textContent = atpBank;
  checkpointTotal.textContent = `${checkpointCount} / 4`;
  attempts.textContent = attemptCount;
}

function checkPathway() {
  attemptCount += 1;
  updateStats();

  if (selectedStages.length !== stages.length) {
    feedbackMessage("Fill all four stages before checking.", "warning");
    return;
  }

  const isCorrect = selectedStages.every((stage, index) => stage.id === stages[index].id);
  if (isCorrect) {
    checkpointCount += 1;
    const gained = 10 + checkpointCount * 2;
    atpBank += gained;
    feedbackMessage(`Correct! +${gained} ATP. Unlocking a clinical question.`, "success");
    updateStats();
    unlockQuestion();
  } else {
    feedbackMessage("Check the order: glycolysis → pyruvate oxidation → TCA → ETC.", "error");
  }
}

function unlockQuestion() {
  questionUnlocked = true;
  const question = questions[questionIndex % questions.length];
  questionText.textContent = question.prompt;
  answerButtons.innerHTML = "";

  question.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.textContent = option;
    button.addEventListener("click", () => handleAnswer(index));
    answerButtons.appendChild(button);
  });
}

function handleAnswer(selectedIndex) {
  if (!questionUnlocked) {
    return;
  }
  const question = questions[questionIndex % questions.length];
  const buttons = answerButtons.querySelectorAll("button");
  buttons.forEach((button, index) => {
    if (index === question.answer) {
      button.classList.add("correct");
    } else if (index === selectedIndex) {
      button.classList.add("incorrect");
    }
    button.disabled = true;
  });

  if (selectedIndex === question.answer) {
    atpBank += 5;
    feedbackMessage("Correct response! Bonus +5 ATP.", "success");
  } else {
    feedbackMessage("Not quite. Review the explanation and try again next round.", "warning");
  }

  questionIndex += 1;
  questionUnlocked = false;
  updateStats();
}

function resetGame() {
  selectedStages = [];
  renderPathway();
  feedbackMessage("Cards reset. Start again.", "");
}

checkButton.addEventListener("click", checkPathway);
resetButton.addEventListener("click", resetGame);

renderCards();
renderPathway();
updateStats();
