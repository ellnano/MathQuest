const STORAGE_KEY = 'mathquest-save-v4';

const WORLD_CONFIG = [
  {
    id: 'forest',
    name: 'Hutan Ajaib',
    icon: 'fa-mountain-sun',
    className: 'world-forest',
    min: 0,
    max: 100,
    operation: 'addition',
    hint: 'Soal penjumlahan dari dunia hutan.',
  },
  {
    id: 'candy',
    name: 'Istana Permen',
    icon: 'fa-candy-cane',
    className: 'world-candy',
    min: 101,
    max: 200,
    operation: 'subtraction',
    hint: 'Soal pengurangan dari dunia permen.',
  },
  {
    id: 'space',
    name: 'Luar Angkasa',
    icon: 'fa-rocket',
    className: 'world-space',
    min: 201,
    max: Infinity,
    operation: 'multiplication',
    hint: 'Soal perkalian dari dunia luar angkasa.',
  },
];

const BADGE_CONFIG = [
  { id: 'count-warrior', label: 'Prajurit Hitung', icon: 'fa-shield-heart', threshold: 100 },
  { id: 'math-king', label: 'Raja Matematika', icon: 'fa-crown', threshold: 500 },
];

const ACCESSORY_CATALOG = [
  {
    id: 'wizard-hat',
    name: 'Topi Penyihir',
    type: 'accessory',
    slot: 'hat',
    icon: '🎩',
    price: 50,
    description: 'Topi ajaib untuk maskot yang pintar.',
  },
  {
    id: 'magic-glasses',
    name: 'Kacamata Bintang',
    type: 'accessory',
    slot: 'glasses',
    icon: '🤓',
    price: 50,
    description: 'Kacamata keren supaya hitungan makin teliti.',
  },
  {
    id: 'fairy-wings',
    name: 'Sayap Peri',
    type: 'accessory',
    slot: 'wings',
    icon: '🪽',
    price: 50,
    description: 'Sayap lembut untuk terlihat lebih magis.',
  },
  {
    id: 'magic-bag',
    name: 'Tas Ajaib',
    type: 'accessory',
    slot: 'backpack',
    icon: '🎒',
    price: 50,
    description: 'Tas lucu yang cocok dipakai di punggung.',
  },
  {
    id: 'knight-sword',
    name: 'Pedang Ksatria',
    type: 'accessory',
    slot: 'sword',
    icon: '🗡️',
    price: 50,
    description: 'Pedang kecil untuk tampilan ksatria pemberani.',
  },
];

const PET_CATALOG = [
  {
    id: 'pet-cat',
    name: 'Kucing Mini',
    type: 'pet',
    petClass: 'pet-cat',
    icon: '🐱',
    price: 50,
    description: 'Pet lucu yang selalu menemani belajar.',
  },
  {
    id: 'pet-dragon',
    name: 'Naga Mini',
    type: 'pet',
    petClass: 'pet-dragon',
    icon: '🐲',
    price: 50,
    description: 'Pet kecil dengan aura api yang seru.',
  },
  {
    id: 'pet-owl',
    name: 'Burung Hantu',
    type: 'pet',
    petClass: 'pet-owl',
    icon: '🦉',
    price: 50,
    description: 'Pet bijak yang cocok untuk MathQuest.',
  },
];

const els = {
  body: document.body,
  worldName: document.querySelector('#world-name'),
  scoreValue: document.querySelector('#score-value'),
  livesValue: document.querySelector('#lives-value'),
  streakValue: document.querySelector('#streak-value'),
  scoreBox: document.querySelector('#score-box'),
  streakBox: document.querySelector('#streak-box'),
  questionTitle: document.querySelector('#question-title'),
  feedbackText: document.querySelector('#feedback-text'),
  questionBox: document.querySelector('.question-box'),
  answerButtons: Array.from(document.querySelectorAll('.answer-btn')),
  badgeList: document.querySelector('#badge-list'),
  worldList: document.querySelector('#world-list'),
  accessoryGrid: document.querySelector('#accessory-grid'),
  petGrid: document.querySelector('#pet-grid'),
  wardrobeSummary: document.querySelector('#wardrobe-summary'),
  shopTabs: Array.from(document.querySelectorAll('.shop-tab')), 
  shopPanels: Array.from(document.querySelectorAll('.shop-panel')),
  removeAllButton: document.querySelector('#remove-all-btn'),
  gameOver: document.querySelector('#game-over'),
  restartButton: document.querySelector('#restart-btn'),
  confettiLayer: document.querySelector('#confetti-layer'),
  pet: document.querySelector('#pet-companion'),
  mascot: document.querySelector('#mascot'),
};

const state = loadState();
let currentQuestion = null;
let gameLocked = false;
let activeTab = 'accessories';
let audioContext = null;
let previewItemId = '';

function defaultState() {
  return {
    coins: 120,
    lives: 3,
    streak: 0,
    currentWorld: 'forest',
    worldsUnlocked: ['forest', 'candy'],
    badges: [],
    inventory: {
      accessories: [],
      pets: [],
    },
    equipped: {
      accessory: '',
      pet: '',
    },
  };
}

function loadState() {
  const fallback = defaultState();
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return fallback;
  }

  const parsed = JSON.parse(raw);

  return {
    coins: Number.isFinite(parsed.coins) ? parsed.coins : fallback.coins,
    lives: Number.isFinite(parsed.lives) ? parsed.lives : fallback.lives,
    streak: Number.isFinite(parsed.streak) ? parsed.streak : fallback.streak,
    currentWorld: typeof parsed.currentWorld === 'string' ? parsed.currentWorld : fallback.currentWorld,
    worldsUnlocked: Array.isArray(parsed.worldsUnlocked) ? parsed.worldsUnlocked : fallback.worldsUnlocked,
    badges: Array.isArray(parsed.badges) ? parsed.badges : fallback.badges,
    inventory: {
      accessories: Array.isArray(parsed.inventory?.accessories) ? parsed.inventory.accessories : fallback.inventory.accessories,
      pets: Array.isArray(parsed.inventory?.pets) ? parsed.inventory.pets : fallback.inventory.pets,
    },
    equipped: {
      accessory: typeof parsed.equipped?.accessory === 'string' ? parsed.equipped.accessory : fallback.equipped.accessory,
      pet: typeof parsed.equipped?.pet === 'string' ? parsed.equipped.pet : fallback.equipped.pet,
    },
  };
}

function saveState() {
  const payload = {
    coins: state.coins,
    lives: state.lives,
    streak: state.streak,
    currentWorld: state.currentWorld,
    worldsUnlocked: state.worldsUnlocked,
    badges: state.badges,
    inventory: state.inventory,
    equipped: state.equipped,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(values) {
  return values
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map((item) => item.value);
}

function getWorldByScore(score) {
  return WORLD_CONFIG.find((world) => score >= world.min && score <= world.max) || WORLD_CONFIG[0];
}

function getUnlockedWorldIds(score) {
  return WORLD_CONFIG.filter((world) => score >= world.min).map((world) => world.id);
}

function getOperationForWorld(worldId) {
  const world = WORLD_CONFIG.find((entry) => entry.id === worldId) || WORLD_CONFIG[0];
  return world.operation;
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

function generateMathQuestion(world) {
  if (world.operation === 'addition') {
    let left = randomInt(1, 20);
    let right = randomInt(1, 20);

    return {
      text: `${left} + ${right} = ?`,
      answer: left + right,
      hint: world.hint,
    };
  }

  if (world.operation === 'subtraction') {
    let left = randomInt(1, 20);
    let right = randomInt(1, 20);

    if (left < right) {
      [left, right] = [right, left];
    }

    return {
      text: `${left} - ${right} = ?`,
      answer: left - right,
      hint: world.hint,
    };
  }

  const left = randomInt(1, 10);
  const right = randomInt(1, 10);

  return {
    text: `${left} × ${right} = ?`,
    answer: left * right,
    hint: world.hint,
  };
}

function setFeedback(message, type = 'neutral') {
  els.feedbackText.textContent = message;
  els.feedbackText.classList.remove('feedback-correct', 'feedback-wrong', 'feedback-neutral');
  els.feedbackText.classList.add(type === 'correct' ? 'feedback-correct' : type === 'wrong' ? 'feedback-wrong' : 'feedback-neutral');
}

function playTone(frequency, duration, type = 'sine', gainValue = 0.04) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) {
    return;
  }

  if (!audioContext) {
    audioContext = new AudioContextClass();
  }

  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = type;
  osc.frequency.value = frequency;
  gain.gain.value = gainValue;

  osc.connect(gain);
  gain.connect(audioContext.destination);
  osc.start();
  osc.stop(audioContext.currentTime + duration);
}

function playCorrectSound() {
  playTone(880, 0.09, 'triangle', 0.05);
  window.setTimeout(() => playTone(1175, 0.09, 'triangle', 0.04), 90);
}

function playWrongSound() {
  playTone(260, 0.16, 'sawtooth', 0.035);
}

function playPurchaseSound() {
  playTone(660, 0.08, 'square', 0.03);
  window.setTimeout(() => playTone(990, 0.11, 'triangle', 0.03), 70);
}

function burstConfetti() {
  const colors = ['#ff6bb5', '#ffb85a', '#63d98a', '#5ab5ff', '#8d5cf6'];

  for (let index = 0; index < 20; index += 1) {
    const piece = document.createElement('span');
    piece.className = 'confetti';
    piece.style.left = `${randomInt(5, 95)}%`;
    piece.style.top = `${randomInt(8, 22)}%`;
    piece.style.background = colors[index % colors.length];
    piece.style.animationDuration = `${randomInt(700, 1100)}ms`;
    piece.style.transform = `rotate(${randomInt(0, 180)}deg)`;
    els.confettiLayer.appendChild(piece);

    window.setTimeout(() => {
      piece.remove();
    }, 1200);
  }
}

function toggleScoreFire(active) {
  if (active) {
    els.scoreBox.classList.add('hot');
    window.clearTimeout(toggleScoreFire.timer);
    toggleScoreFire.timer = window.setTimeout(() => {
      els.scoreBox.classList.remove('hot');
    }, 900);
    return;
  }

  els.scoreBox.classList.remove('hot');
}

toggleScoreFire.timer = null;

function lockAnswers(isLocked) {
  els.answerButtons.forEach((button) => {
    button.disabled = isLocked;
  });
}

function updateWorldTheme() {
  const world = getWorldByScore(state.coins);
  state.currentWorld = world.id;
  const unlocked = new Set(state.worldsUnlocked);

  getUnlockedWorldIds(state.coins).forEach((worldId) => unlocked.add(worldId));
  state.worldsUnlocked = Array.from(unlocked);

  els.body.classList.remove('world-forest', 'world-candy', 'world-space');
  els.body.classList.add(world.className);
  els.worldName.textContent = world.name;

  return world;
}

function updateBadges() {
  let changed = false;

  BADGE_CONFIG.forEach((badge) => {
    if (state.coins >= badge.threshold && !state.badges.includes(badge.id)) {
      state.badges.push(badge.id);
      changed = true;
    }
  });

  if (changed) {
    state.badges.sort();
  }
}

function applyCosmetics() {
  const accessoryId = previewItemId && isAccessory(previewItemId)
    ? previewItemId
    : state.equipped.accessory;
  const petId = previewItemId && isPet(previewItemId)
    ? previewItemId
    : state.equipped.pet;

  document.querySelectorAll('[data-slot]').forEach((node) => {
    node.classList.remove('active');
  });

  if (accessoryId) {
    const slotNode = document.querySelector(`[data-slot="${accessoryId}"]`);
    if (slotNode) {
      slotNode.classList.add('active');
    }
  }

  els.pet.className = 'pet';
  if (petId) {
    els.pet.classList.add(getPetClass(petId));
    els.pet.dataset.pet = petId;
  } else {
    els.pet.classList.add('pet-none');
    els.pet.dataset.pet = 'none';
  }
}

function isAccessory(itemId) {
  return ACCESSORY_CATALOG.some((item) => item.id === itemId);
}

function isPet(itemId) {
  return PET_CATALOG.some((item) => item.id === itemId);
}

function getItemById(itemId) {
  return [...ACCESSORY_CATALOG, ...PET_CATALOG].find((item) => item.id === itemId) || null;
}

function getPetClass(itemId) {
  const pet = PET_CATALOG.find((item) => item.id === itemId);
  return pet ? pet.petClass : 'pet-none';
}

function renderStatus() {
  els.scoreValue.textContent = String(state.coins);
  els.livesValue.textContent = String(state.lives);
  els.streakValue.textContent = String(state.streak);

  if (state.streak >= 5) {
    els.streakBox.classList.add('hot');
  } else {
    els.streakBox.classList.remove('hot');
  }
}

function renderBadges() {
  els.badgeList.innerHTML = '';

  BADGE_CONFIG.forEach((badge) => {
    const active = state.badges.includes(badge.id);
    const chip = document.createElement('span');
    chip.className = `chip${active ? ' active' : ''}`;
    chip.innerHTML = `<i class="fa-solid ${badge.icon}"></i> ${badge.label}`;
    els.badgeList.appendChild(chip);
  });
}

function renderWorldList() {
  els.worldList.innerHTML = '';

  WORLD_CONFIG.forEach((world) => {
    const active = state.worldsUnlocked.includes(world.id);
    const chip = document.createElement('span');
    chip.className = `chip${active ? ' active' : ' locked'}`;
    chip.innerHTML = `<i class="fa-solid ${world.icon}"></i> ${world.name}`;
    els.worldList.appendChild(chip);
  });
}

function renderWardrobe() {
  const accessory = getItemById(state.equipped.accessory);
  const pet = getItemById(state.equipped.pet);

  els.wardrobeSummary.innerHTML = '';

  const accessoryRow = document.createElement('div');
  accessoryRow.className = 'wardrobe-item';
  accessoryRow.innerHTML = `
    <div>
      <strong>Aksesori Maskot</strong>
      <span>${accessory ? accessory.name : 'Belum dipakai'}</span>
    </div>
    <span>${previewItemId && isAccessory(previewItemId) ? 'Preview aktif' : 'Tersimpan'}</span>
  `;

  const petRow = document.createElement('div');
  petRow.className = 'wardrobe-item';
  petRow.innerHTML = `
    <div>
      <strong>Pet Companion</strong>
      <span>${pet ? pet.name : 'Belum dipakai'}</span>
    </div>
    <span>${previewItemId && isPet(previewItemId) ? 'Preview aktif' : 'Tersimpan'}</span>
  `;

  els.wardrobeSummary.appendChild(accessoryRow);
  els.wardrobeSummary.appendChild(petRow);
}

function renderShop() {
  renderShopGrid(els.accessoryGrid, ACCESSORY_CATALOG, 'accessories');
  renderShopGrid(els.petGrid, PET_CATALOG, 'pets');
}

function renderShopGrid(container, items, category) {
  container.innerHTML = '';

  items.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'shop-item';
    card.dataset.item = item.id;
    card.dataset.category = category;

    const owned = isOwned(item.id);
    const previewing = previewItemId === item.id;
    const equipped = category === 'accessories'
      ? state.equipped.accessory === item.id
      : state.equipped.pet === item.id;

    if (owned) {
      card.classList.add('owned');
    }

    if (previewing) {
      card.classList.add('previewing');
    }

    if (equipped) {
      card.classList.add('equipped');
    }

    card.innerHTML = `
      <div class="shop-meta">
        <div>
          <h4>${item.name}</h4>
          <p>${item.description}</p>
          <span class="shop-price"><i class="fa-solid fa-coins"></i> ${item.price} skor</span>
        </div>
        <div class="shop-art" aria-hidden="true">${item.icon}</div>
      </div>
      <div class="shop-actions">
        <button class="shop-action preview" type="button" data-action="preview" data-item="${item.id}">Preview</button>
        <button class="shop-action buy" type="button" data-action="buy" data-item="${item.id}">${owned ? 'Pakai' : 'Beli'}</button>
      </div>
    `;

    const buyButton = card.querySelector('[data-action="buy"]');
    buyButton.disabled = !owned && state.coins < item.price;

    container.appendChild(card);
  });
}

function isOwned(itemId) {
  return state.inventory.accessories.includes(itemId) || state.inventory.pets.includes(itemId);
}

function updateShopButtons() {
  const cards = document.querySelectorAll('.shop-item');

  cards.forEach((card) => {
    const itemId = card.dataset.item;
    const item = getItemById(itemId);
    const owned = isOwned(itemId);
    const buyButton = card.querySelector('[data-action="buy"]');

    card.classList.toggle('owned', owned);
    card.classList.toggle('previewing', previewItemId === itemId);
    card.classList.toggle('equipped', state.equipped.accessory === itemId || state.equipped.pet === itemId);

    if (buyButton) {
      buyButton.textContent = owned ? 'Pakai' : 'Beli';
      buyButton.disabled = !owned && state.coins < item.price;
    }
  });
}

function setShopTab(tab) {
  activeTab = tab;
  els.shopTabs.forEach((button) => {
    button.classList.toggle('active', button.dataset.tab === tab);
  });
  els.shopPanels.forEach((panel) => {
    panel.classList.toggle('active', panel.dataset.panel === tab);
  });
}

function renderQuestion() {
  const world = updateWorldTheme();
  currentQuestion = generateMathQuestion(world);
  els.questionBox.classList.remove('swap');
  void els.questionBox.offsetWidth;
  els.questionBox.classList.add('swap');
  els.questionTitle.textContent = currentQuestion.text;
  setFeedback(currentQuestion.hint, 'neutral');

  const options = buildOptions(currentQuestion.answer);
  els.answerButtons.forEach((button, index) => {
    button.querySelector('.value').textContent = options[index];
    button.classList.remove('correct-answer', 'wrong-answer');
    button.disabled = false;
  });

  applyCosmetics();
  renderStatus();
  renderBadges();
  renderWorldList();
  renderWardrobe();
  updateShopButtons();
  saveState();
  gameLocked = false;
}

function addScore(amount) {
  state.coins += amount;
  updateBadges();
  updateWorldTheme();
}

function awardStreakBonus() {
  if (state.streak > 0 && state.streak % 5 === 0) {
    addScore(20);
    toggleScoreFire(true);
    setFeedback('Combo x2! Hebat!', 'correct');
    return 20;
  }

  addScore(10);
  return 10;
}

function showGameOver() {
  gameLocked = true;
  lockAnswers(true);
  els.gameOver.classList.add('active');
  els.gameOver.setAttribute('aria-hidden', 'false');
}

function hideGameOver() {
  els.gameOver.classList.remove('active');
  els.gameOver.setAttribute('aria-hidden', 'true');
}

function resetRun() {
  state.lives = 3;
  state.streak = 0;
  previewItemId = '';
  hideGameOver();
  renderQuestion();
}

function previewItem(itemId) {
  previewItemId = itemId;
  const item = getItemById(itemId);
  const category = item && item.type === 'pet' ? 'pet' : 'accessory';
  setFeedback(`Preview: ${item.name}`, category === 'pet' ? 'correct' : 'neutral');
  applyCosmetics();
  renderShop();
  renderWardrobe();
  saveState();
}

function equipItem(itemId) {
  const item = getItemById(itemId);

  if (!item) {
    return;
  }

  if (item.type === 'accessory') {
    state.equipped.accessory = item.id;
  } else {
    state.equipped.pet = item.id;
  }

  previewItemId = item.id;
  applyCosmetics();
  renderWardrobe();
  renderShop();
  saveState();
}

function buyItem(itemId) {
  const item = getItemById(itemId);

  if (!item) {
    return;
  }

  const owned = isOwned(itemId);

  if (!owned && state.coins < item.price) {
    setFeedback('Skor belum cukup untuk membeli item ini.', 'wrong');
    return;
  }

  if (!owned) {
    state.coins -= item.price;
    if (item.type === 'accessory') {
      state.inventory.accessories.push(item.id);
    } else {
      state.inventory.pets.push(item.id);
    }
    playPurchaseSound();
  }

  equipItem(item.id);
  renderStatus();
  renderBadges();
  updateWorldTheme();
  saveState();
}

function removeAllCosmetics() {
  state.equipped.accessory = '';
  state.equipped.pet = '';
  previewItemId = '';
  applyCosmetics();
  setFeedback('Semua kosmetik dilepas.', 'neutral');
  renderWardrobe();
  renderShop();
  saveState();
}

function createShop() {
  renderShop();
  updateShopButtons();
}

function bindEvents() {
  els.answerButtons.forEach((button) => {
    button.addEventListener('click', () => {
      if (gameLocked) {
        return;
      }

      const selected = Number(button.querySelector('.value').textContent);
      const correct = selected === currentQuestion.answer;
      lockAnswers(true);

      if (correct) {
        state.streak += 1;
        const points = awardStreakBonus();
        renderStatus();
        renderBadges();
        renderWorldList();
        setFeedback(points === 20 ? 'Combo 5! Bonus koin 2x lipat!' : 'Hebat!', 'correct');
        button.classList.add('correct-answer');
        burstConfetti();
        playCorrectSound();
        saveState();

        window.setTimeout(() => {
          if (!gameLocked) {
            renderQuestion();
          }
        }, 900);
        return;
      }

      state.lives -= 1;
      state.streak = 0;
      renderStatus();
      setFeedback('Coba lagi yuk!', 'wrong');
      button.classList.add('wrong-answer');
      playWrongSound();
      saveState();

      if (state.lives <= 0) {
        window.setTimeout(showGameOver, 600);
        return;
      }

      window.setTimeout(() => {
        button.classList.remove('wrong-answer');
        if (!gameLocked) {
          lockAnswers(false);
        }
      }, 560);
    });
  });

  els.shopTabs.forEach((button) => {
    button.addEventListener('click', () => {
      setShopTab(button.dataset.tab);
    });
  });

  document.addEventListener('click', (event) => {
    const previewButton = event.target.closest('[data-action="preview"]');
    const buyButton = event.target.closest('[data-action="buy"]');

    if (previewButton) {
      previewItem(previewButton.dataset.item);
      return;
    }

    if (buyButton) {
      buyItem(buyButton.dataset.item);
    }
  });

  els.removeAllButton.addEventListener('click', removeAllCosmetics);
  els.restartButton.addEventListener('click', resetRun);
}

function syncStateFromStorage() {
  const unlockedWorlds = new Set(getUnlockedWorldIds(state.coins));
  state.worldsUnlocked.forEach((world) => unlockedWorlds.add(world));
  state.worldsUnlocked = Array.from(unlockedWorlds);
  updateBadges();
  const world = updateWorldTheme();

  if (state.equipped.accessory && !state.inventory.accessories.includes(state.equipped.accessory)) {
    state.equipped.accessory = '';
  }

  if (state.equipped.pet && !state.inventory.pets.includes(state.equipped.pet)) {
    state.equipped.pet = '';
  }

  els.worldName.textContent = world.name;
}

function initialize() {
  syncStateFromStorage();
  renderStatus();
  renderBadges();
  renderWorldList();
  renderWardrobe();
  createShop();
  applyCosmetics();
  bindEvents();
  setShopTab(activeTab);
  hideGameOver();
  setFeedback('Pilih jawaban untuk memulai petualangan.', 'neutral');
  renderQuestion();
}

initialize();
