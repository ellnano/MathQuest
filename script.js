const phaseSelect = document.querySelector('#phase-select');
const questionTitle = document.querySelector('.question-box h2');
const questionHint = document.querySelector('.question-box p');
const scoreValue = document.querySelector('.score-box strong');
const answerButtons = Array.from(document.querySelectorAll('.answer-btn'));

let coins = 120;
let currentQuestion = null;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(values) {
  return values
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map((item) => item.value);
}

function buildOptions(answer) {
  const options = new Set([answer]);

  while (options.size < 4) {
    const direction = Math.random() < 0.5 ? -1 : 1;
    const magnitude = randomInt(1, Math.max(3, Math.min(9, Math.abs(answer) || 1)));
    let candidate = answer + direction * magnitude;

    if (candidate < 1) {
      candidate = answer + magnitude;
    }

    options.add(candidate);
  }

  return shuffle(Array.from(options));
}

function generateMathQuestion(phase) {
  if (phase === 'phase1') {
    const operator = Math.random() < 0.5 ? '+' : '-';
    let left = randomInt(1, 20);
    let right = randomInt(1, 20);

    if (operator === '-' && left < right) {
      [left, right] = [right, left];
    }

    return {
      text: `${left} ${operator} ${right} = ?`,
      answer: operator === '+' ? left + right : left - right,
      hint: 'Fase 1: penjumlahan dan pengurangan angka 1-20.',
    };
  }

  const operator = Math.random() < 0.5 ? '×' : '÷';

  if (operator === '×') {
    const left = randomInt(1, 10);
    const right = randomInt(1, 10);

    return {
      text: `${left} × ${right} = ?`,
      answer: left * right,
      hint: 'Fase 2: perkalian angka 1-10.',
    };
  }

  const divisor = randomInt(1, 10);
  const quotient = randomInt(1, 10);
  const dividend = divisor * quotient;

  return {
    text: `${dividend} ÷ ${divisor} = ?`,
    answer: quotient,
    hint: 'Fase 2: pembagian angka 1-10.',
  };
}

function renderQuestion() {
  currentQuestion = generateMathQuestion(phaseSelect.value);
  questionTitle.textContent = currentQuestion.text;
  questionHint.textContent = currentQuestion.hint;

  const options = buildOptions(currentQuestion.answer);

  answerButtons.forEach((button, index) => {
    button.querySelector('.value').textContent = options[index];
    button.classList.remove('correct', 'wrong');
    button.disabled = false;
  });
}

function lockButtons(isLocked) {
  answerButtons.forEach((button) => {
    button.disabled = isLocked;
  });
}

phaseSelect.addEventListener('change', renderQuestion);

answerButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const selected = Number(button.querySelector('.value').textContent);

    lockButtons(true);

    if (selected === currentQuestion.answer) {
      coins += 10;
      scoreValue.textContent = coins;
      button.classList.add('correct');
      setTimeout(renderQuestion, 700);
      return;
    }

    button.classList.add('wrong');
    setTimeout(() => {
      button.classList.remove('wrong');
      lockButtons(false);
    }, 500);
  });
});

renderQuestion();
