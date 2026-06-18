const phaseSelect = document.querySelector('#phase-select');
const questionTitle = document.querySelector('.question-box h2');
const questionHint = document.querySelector('#feedback-text');
const scoreValue = document.querySelector('#score-value');
const livesValue = document.querySelector('#lives-value');
const shopScoreValue = document.querySelector('#shop-score');
const shopStatus = document.querySelector('#shop-status');
const answerButtons = Array.from(document.querySelectorAll('.answer-btn'));
const shopButtons = Array.from(document.querySelectorAll('.shop-item'));
const gameOverScreen = document.querySelector('#game-over');
const restartButton = document.querySelector('#restart-btn');
const confettiLayer = document.querySelector('#confetti-layer');
const mascot = document.querySelector('.mascot');
const accessoryNodes = Array.from(document.querySelectorAll('.accessory'));

const START_SCORE = 120;
const START_LIVES = 3;
const SHOP_PRICE = 50;

const shopItems = {
  'wizard-hat': {
    label: 'Topi Penyihir',
    accessoryClass: 'hat',
  },
  'knight-sword': {
    label: 'Pedang Ksatria',
    accessoryClass: 'sword',
  },
  'fairy-wings': {
    label: 'Sayap Peri',
    accessoryClass: 'wings',
  },
};

let coins = START_SCORE;
let lives = START_LIVES;
let currentQuestion = null;
let gameLocked = false;
let ownedItems = new Set();
let equippedItem = '';

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

function setFeedback(message, type) {
  questionHint.textContent = message;
  questionHint.classList.remove('feedback-correct', 'feedback-wrong');

  if (type === 'correct') {
    questionHint.classList.add('feedback-correct');
  }

  if (type === 'wrong') {
    questionHint.classList.add('feedback-wrong');
  }
}

function burstConfetti() {
  const colors = ['#ff7ab6', '#ffd166', '#5bd48a', '#4d96ff', '#ff9f1c'];

  for (let index = 0; index < 18; index += 1) {
    const piece = document.createElement('span');
    piece.className = 'confetti';
    piece.style.left = `${randomInt(10, 90)}%`;
    piece.style.top = `${randomInt(8, 28)}%`;
    piece.style.background = colors[index % colors.length];
    piece.style.animationDuration = `${randomInt(700, 1100)}ms`;
    piece.style.transform = `rotate(${randomInt(0, 180)}deg)`;
    confettiLayer.appendChild(piece);

    window.setTimeout(() => {
      piece.remove();
    }, 1200);
  }
}

function lockButtons(isLocked) {
  answerButtons.forEach((button) => {
    button.disabled = isLocked;
  });
}

function updateStatus() {
  scoreValue.textContent = String(coins);
  livesValue.textContent = String(lives);
  shopScoreValue.textContent = String(coins);
  updateShopButtons();
}

function showGameOver() {
  gameLocked = true;
  lockButtons(true);
  gameOverScreen.classList.add('active');
  gameOverScreen.setAttribute('aria-hidden', 'false');
}

function hideGameOver() {
  gameOverScreen.classList.remove('active');
  gameOverScreen.setAttribute('aria-hidden', 'true');
}

function renderQuestion() {
  currentQuestion = generateMathQuestion(phaseSelect.value);
  questionTitle.textContent = currentQuestion.text;
  setFeedback(currentQuestion.hint, '');

  const options = buildOptions(currentQuestion.answer);

  answerButtons.forEach((button, index) => {
    button.querySelector('.value').textContent = options[index];
    button.classList.remove('correct', 'wrong');
    button.disabled = false;
  });

  gameLocked = false;
}

function resetGame() {
  coins = START_SCORE;
  lives = START_LIVES;
  ownedItems = new Set();
  equippedItem = '';
  accessoryNodes.forEach((node) => {
    node.classList.remove('active');
  });
  mascot.dataset.equipped = '';
  updateShopStatus('Belum ada hadiah yang dipakai.');
  updateStatus();
  hideGameOver();
  renderQuestion();
}

function updateShopStatus(message) {
  shopStatus.textContent = message;
}

function updateShopButtons() {
  shopButtons.forEach((button) => {
    const itemKey = button.dataset.item;
    const isOwned = ownedItems.has(itemKey);
    const canBuy = coins >= SHOP_PRICE;

    button.disabled = !isOwned && !canBuy;
    button.classList.toggle('equipped', equippedItem === itemKey);

    const priceLabel = button.querySelector('span:last-child');
    if (!isOwned) {
      priceLabel.textContent = canBuy ? '50 skor' : 'Kurang skor';
    } else {
      priceLabel.textContent = 'Dipakai';
    }
  });
}

function equipItem(itemKey) {
  const item = shopItems[itemKey];

  accessoryNodes.forEach((node) => {
    node.classList.remove('active');
  });

  const accessory = document.querySelector(`.accessory[data-accessory="${itemKey}"]`);
  if (accessory) {
    accessory.classList.add('active');
  }

  equippedItem = itemKey;
  mascot.dataset.equipped = itemKey;
  updateShopStatus(`${item.label} sudah dipakai pada maskot.`);
  updateShopButtons();
}

function buyItem(itemKey) {
  if (ownedItems.has(itemKey)) {
    equipItem(itemKey);
    return;
  }

  if (coins < SHOP_PRICE) {
    updateShopStatus('Skor belum cukup untuk membeli hadiah ini.');
    return;
  }

  coins -= SHOP_PRICE;
  ownedItems.add(itemKey);
  updateStatus();
  equipItem(itemKey);
  updateShopStatus(`${shopItems[itemKey].label} berhasil dibeli dan dipakai!`);
}

phaseSelect.addEventListener('change', () => {
  if (!gameLocked) {
    renderQuestion();
  }
});

answerButtons.forEach((button) => {
  button.addEventListener('click', () => {
    if (gameLocked) {
      return;
    }

    const selected = Number(button.querySelector('.value').textContent);
    const isCorrect = selected === currentQuestion.answer;

    lockButtons(true);

    if (isCorrect) {
      coins += 10;
      updateStatus();
      setFeedback('Hebat!', 'correct');
      button.classList.add('correct');
      burstConfetti();

      window.setTimeout(() => {
        if (!gameLocked) {
          renderQuestion();
        }
      }, 850);
      return;
    }

    lives -= 1;
    updateStatus();
    setFeedback('Coba lagi yuk!', 'wrong');
    button.classList.add('wrong');

    if (lives <= 0) {
      window.setTimeout(showGameOver, 650);
      return;
    }

    window.setTimeout(() => {
      button.classList.remove('wrong');
      if (!gameLocked) {
        lockButtons(false);
      }
    }, 550);
  });
});

shopButtons.forEach((button) => {
  button.addEventListener('click', () => {
    if (gameLocked) {
      return;
    }

    buyItem(button.dataset.item);
  });
});

restartButton.addEventListener('click', resetGame);

updateStatus();
updateShopStatus('Belum ada hadiah yang dipakai.');
renderQuestion();
