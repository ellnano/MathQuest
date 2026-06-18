const questions = [
  {
    question: "7 + 5 = ?",
    options: [10, 11, 12, 13],
    answer: 12,
  },
  {
    question: "9 - 3 = ?",
    options: [4, 5, 6, 7],
    answer: 6,
  },
  {
    question: "4 x 2 = ?",
    options: [6, 7, 8, 9],
    answer: 8,
  },
  {
    question: "10 + 4 = ?",
    options: [12, 13, 14, 15],
    answer: 14,
  },
];

let currentQuestion = 0;
let coins = 0;

const questionTitle = document.querySelector(".question-box h2");
const scoreValue = document.querySelector(".score-box strong");
const answerButtons = document.querySelectorAll(".answer-btn");

function renderQuestion() {
  const q = questions[currentQuestion];
  questionTitle.textContent = q.question;

  answerButtons.forEach((btn, index) => {
    btn.querySelector(".value").textContent = q.options[index];
    btn.classList.remove("correct", "wrong");
    btn.disabled = false;
  });
}

function nextQuestion() {
  currentQuestion = (currentQuestion + 1) % questions.length;
  renderQuestion();
}

answerButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const selected = Number(btn.querySelector(".value").textContent);
    const correct = questions[currentQuestion].answer;

    answerButtons.forEach((b) => (b.disabled = true));

    if (selected === correct) {
      coins += 10;
      scoreValue.textContent = coins;
      btn.classList.add("correct");
      setTimeout(nextQuestion, 900);
    } else {
      btn.classList.add("wrong");
      setTimeout(() => {
        answerButtons.forEach((b) => (b.disabled = false));
        btn.classList.remove("wrong");
      }, 700);
    }
  });
});

renderQuestion();
