// ================= КОНФИГ FIREBASE =================
const firebaseConfig = {
  apiKey: "AIzaSyAM72wVXgTniOAmrT-_YGQx-XGgq-w0unI",
  authDomain: "lorgan-c6f41.firebaseapp.com",
  projectId: "lorgan-c6f41",
  storageBucket: "lorgan-c6f41.firebasestorage.app",
  messagingSenderId: "735289808895",
  appId: "1:735289808895:web:4ec39e3c9291987a0139ca"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ================= НАСТРОЙКИ =================
const ADMIN_EMAIL = 'your-email@example.com';   // ← ЗАМЕНИ на свой email
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY';  // ← ЗАМЕНИ на ключ из https://aistudio.google.com/apikey
const GEMINI_MODEL = 'gemini-2.5-flash';

const SYSTEM_PROMPT = `Ты — персональный репетитор по теоретической механике для студента 2-го курса технического вуза. Твоя цель — не решать задачи за студента, а помочь ему научиться решать их самостоятельно. Ты терпелив, доброжелателен, но требователен.

Основные принципы работы:

Никогда не давай готового ответа. Даже если студент просит «просто скажи ответ» или «покажи решение», вежливо отказывай и возвращай к работе. Например: «Я не могу решить за тебя, но с удовольствием помогу разобраться. С чего, по-твоему, нужно начать?»

Используй сократовский метод. Задавай наводящие вопросы, которые шаг за шагом подводят студента к правильному решению. Например: «Какие силы действуют на балку?», «Какое условие равновесия можно применить?», «Чему равна сумма моментов относительно точки А?».

Проверяй каждый этап. Если студент предлагает свой шаг, оцени его корректность. Если он верен — подтверди и двигайся дальше. Если ошибка — мягко укажи на неё и попроси подумать ещё.

Объясняй теорию только тогда, когда это необходимо. Если студент застрял, кратко напомни нужное понятие или формулу, но не читай лекцию без запроса.

Работай с рисунками и данными. Если студент присылает фото задачи или схемы, проанализируй изображение, но не описывай его полностью. Вместо этого спроси: «Опиши, что ты видишь на схеме? Какие тела, связи, нагрузки?» Затем по шагам помоги выписать исходные данные и выбрать метод.

Держись строго в рамках термеха: статика (равновесие тел, реакции опор, фермы), кинематика (траектория, скорость, ускорение), динамика (законы Ньютона, работа, энергия). Если задача выходит за эти рамки, вежливо скажи, что это не твоя специализация.

Общайся на русском языке. Будь дружелюбным, но сохраняй академический тон. Изредка можно подбадривать: «Отлично, ты верно нашёл момент! Теперь давай составим уравнение».

Формат работы с изображением:

При получении изображения сначала убедись, что оно читаемо.

Попроси студента уточнить условие: «Какие величины известны? Что нужно найти?»

Затем помоги построить план решения, не выдавая сам план, а наталкивая вопросами.

Запрещённые действия:

Не пиши полные системы уравнений или итоговые числовые ответы.

Не высылай готовые чертежи с расставленными реакциями.

Не говори фраз вроде «Ответ: 15 кН» или «Вот готовое решение».

Если студент очень просит, скажи: «Я понимаю, что хочется быстрее, но если я дам ответ, ты ничему не научишься. Давай попробуем ещё раз, я помогу».

Ты — идеальный наставник, который ведёт к пониманию, а не к списыванию.

Формулы пиши в LaTeX: $...$ для формул внутри строки, $$...$$ для формул на отдельной строке (на странице подключен MathJax).`;

// ================= ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК =================
const tabButtons = document.querySelectorAll('.tab-btn');
const tabs = document.querySelectorAll('.tab');
tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    tabButtons.forEach(b => b.classList.remove('active'));
    tabs.forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
    if (btn.dataset.tab === 'admin-panel') loadAdminPanel();
  });
});

// ================= КАЛЬКУЛЯТОРЫ =================
function calcStatics() {
  const f1 = parseFloat(document.getElementById('f1').value);
  const f2 = parseFloat(document.getElementById('f2').value);
  const angleDeg = parseFloat(document.getElementById('angle').value);
  if (isNaN(f1) || isNaN(f2) || isNaN(angleDeg)) {
    document.getElementById('staticsResult').innerHTML = 'Заполните все поля числовыми значениями.';
    return;
  }
  const angleRad = angleDeg * Math.PI / 180;
  const f = Math.sqrt(f1 * f1 + f2 * f2 + 2 * f1 * f2 * Math.cos(angleRad));
  document.getElementById('staticsResult').innerHTML = `Равнодействующая сила: <span style="color:#2e7d32">F = ${f.toFixed(2)}</span> <span class="unit">Н</span>`;
}

function calcKinematics() {
  const v0 = parseFloat(document.getElementById('v0').value);
  const a = parseFloat(document.getElementById('a').value);
  const t = parseFloat(document.getElementById('t').value);
  if (isNaN(v0) || isNaN(a) || isNaN(t)) {
    document.getElementById('kinematicsResult').innerHTML = 'Заполните все поля числовыми значениями.';
    return;
  }
  const v = v0 + a * t;
  const s = v0 * t + (a * t * t) / 2;
  document.getElementById('kinematicsResult').innerHTML = `Конечная скорость: <span style="color:#2e7d32">v = ${v.toFixed(2)}</span> <span class="unit">м/с</span><br>Пройденный путь: <span style="color:#2e7d32">s = ${s.toFixed(2)}</span> <span class="unit">м</span>`;
}

function calcForce() {
  const m = parseFloat(document.getElementById('massForce').value);
  const a = parseFloat(document.getElementById('accelForce').value);
  if (isNaN(m) || isNaN(a)) {
    document.getElementById('forceResult').innerHTML = 'Заполните все поля числовыми значениями.';
    return;
  }
  const f = m * a;
  document.getElementById('forceResult').innerHTML = `Сила: <span style="color:#2e7d32">F = ${f.toFixed(2)}</span> <span class="unit">Н</span>`;
}

function calcEnergy() {
  const m = parseFloat(document.getElementById('massEnergy').value);
  const v = parseFloat(document.getElementById('velEnergy').value);
  if (isNaN(m) || isNaN(v)) {
    document.getElementById('energyResult').innerHTML = 'Заполните все поля числовыми значениями.';
    return;
  }
  const e = (m * v * v) / 2;
  document.getElementById('energyResult').innerHTML = `Кинетическая энергия: <span style="color:#2e7d32">Eₖ = ${e.toFixed(2)}</span> <span class="unit">Дж</span>`;
}

// ================= ИИ-ЧАТ =================
const WELCOME_TEXT = 'Привет! Я Lagran, твой ИИ-репетитор по термеху. Расскажи, что нужно решить — я помогу разобраться.';
let chatHistory = [];
let msgCounter = 0;
let pendingImage = null;

function appendMessage(role, text, isLoading, imageDataUrl) {
  const container = document.getElementById('chatMessages');
  const div = document.createElement('div');
  const id = 'msg-' + (msgCounter++);
  div.id = id;
  div.className = 'msg ' + role + (isLoading ? ' loading' : '');
  if (imageDataUrl) {
    const img = document.createElement('img');
    img.src = imageDataUrl;
    img.className = 'msg-thumb';
    img.alt = 'Фото задачи';
    div.appendChild(img);
  }
  const span = document.createElement('span');
  span.className = 'msg-text';
  span.textContent = isLoading ? 'ИИ-репетитор думает…' : text;
  div.appendChild(span);
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return id;
}

function updateMessage(id, text) {
  const div = document.getElementById(id);
  if (!div) return;
  div.classList.remove('loading');
  const span = div.querySelector('.msg-text');
  if (span) span.textContent = text;
  else div.textContent = text;
  if (window.MathJax && MathJax.typesetPromise) MathJax.typesetPromise([div]).catch(() => {});
  document.getElementById('chatMessages').scrollTop = document.getElementById('chatMessages').scrollHeight;
}

function handleImageSelect(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) { alert('Только изображения.'); return; }
  if (file.size > 5 * 1024 * 1024) { alert('Файл слишком большой (макс 5 МБ).'); return; }
  const reader = new FileReader();
  reader.onload = () => {
    const dataUrl = reader.result;
    const base64 = dataUrl.split(',')[1];
    pendingImage = { mediaType: file.type, base64: base64, previewUrl: dataUrl };
    document.getElementById('imagePreviewThumb').src = dataUrl;
    document.getElementById('imagePreview').style.display = 'flex';
  };
  reader.readAsDataURL(file);
}

function removePendingImage() {
  pendingImage = null;
  document.getElementById('chatImageInput').value = '';
  document.getElementById('imagePreview').style.display = 'none';
}

async function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text && !pendingImage) return;

  const user = auth.currentUser;
  if (!user) {
    openAuthModal();
    return;
  }

  const userDoc = await db.collection('users').doc(user.uid).get();
  const data = userDoc.exists ? userDoc.data() : {};
  const now = new Date();
  const hasFree = data.freeAccess === true;
  const hasSub = data.subscriptionActive === true && data.subscriptionExpiry && data.subscriptionExpiry.toDate() > now;

  if (!hasFree && !hasSub) {
    appendMessage('assistant', 'Для использования ИИ-репетитора оплатите доступ (199₽/мес) или активируйте приглашение.', false);
    const payBtn = document.createElement('button');
    payBtn.textContent = 'Оплатить 199₽/мес';
    payBtn.className = 'btn-primary';
    payBtn.style.marginTop = '8px';
    payBtn.onclick = () => window.open('https://t.me/your_bot?start=pay', '_blank');  // ← ссылка на оплату
    document.getElementById('chatMessages').appendChild(payBtn);
    return;
  }

  const displayText = text || 'Вот фото задачи.';
  appendMessage('user', displayText, false, pendingImage ? pendingImage.previewUrl : null);

  const parts = [];
  if (pendingImage) {
    parts.push({ inline_data: { mime_type: pendingImage.mediaType, data: pendingImage.base64 } });
  }
  parts.push({ text: displayText });
  chatHistory.push({ role: 'user', parts: parts });

  input.value = '';
  removePendingImage();

  const loadingId = appendMessage('assistant', '', true);

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: chatHistory,
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] }
      })
    });
    const result = await response.json();
    const reply = result.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || 'Не получилось ответить.';
    chatHistory.push({ role: 'model', parts: [{ text: reply }] });
    updateMessage(loadingId, reply);
  } catch (err) {
    chatHistory.pop();
    updateMessage(loadingId, 'Ошибка: ' + err.message);
  }
}

function clearChat() {
  chatHistory = [];
  document.getElementById('chatMessages').innerHTML = '';
  appendMessage('assistant', WELCOME_TEXT, false);
}

document.getElementById('chatInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendChatMessage();
  }
});

// ================= FIREBASE AUTH И UI =================
const authModal = document.getElementById('authModal');
const authEmail = document.getElementById('authEmail');
const authPassword = document.getElementById('authPassword');
const authActionBtn = document.getElementById('authActionBtn');
const toggleAuthMode = document.getElementById('toggleAuthMode');
const authError = document.getElementById('authError');
let isLoginMode = true;

function updateAuthUI() {
  const user = auth.currentUser;
  const authArea = document.getElementById('authArea');
  if (user) {
    authArea.innerHTML = `
      <span class="user-email">${user.email}</span>
      <button onclick="signOut()">Выйти</button>
      <button onclick="simulatePayment()">Симулировать оплату</button>
    `;
    if (user.email === ADMIN_EMAIL) {
      document.getElementById('adminTabBtn').style.display = 'inline-block';
    } else {
      document.getElementById('adminTabBtn').style.display = 'none';
    }
  } else {
    authArea.innerHTML = `<button onclick="openAuthModal()">Войти / Регистрация</button>`;
    document.getElementById('adminTabBtn').style.display = 'none';
  }
}

function openAuthModal() {
  authModal.classList.add('active');
  authEmail.value = '';
  authPassword.value = '';
  authError.textContent = '';
}

function closeAuthModal() {
  authModal.classList.remove('active');
}

authActionBtn.addEventListener('click', async () => {
  const email = authEmail.value.trim();
  const password = authPassword.value;
  try {
    if (isLoginMode) {
      await auth.signInWithEmailAndPassword(email, password);
    } else {
      await auth.createUserWithEmailAndPassword(email, password);
    }
    closeAuthModal();
  } catch (err) {
    authError.textContent = err.message;
  }
});

toggleAuthMode.addEventListener('click', () => {
  isLoginMode = !isLoginMode;
  if (isLoginMode) {
    authActionBtn.textContent = 'Войти';
    toggleAuthMode.textContent = 'Регистрация';
    document.getElementById('authModalTitle').textContent = 'Войти';
  } else {
    authActionBtn.textContent = 'Зарегистрироваться';
    toggleAuthMode.textContent = 'Войти';
    document.getElementById('authModalTitle').textContent = 'Регистрация';
  }
});

window.signOut = () => auth.signOut();

auth.onAuthStateChanged(user => {
  updateAuthUI();
  if (user) {
    db.collection('users').doc(user.uid).set({ email: user.email }, { merge: true });
  }
});

// ================= АДМИНКА =================
async function loadAdminPanel() {
  const user = auth.currentUser;
  if (!user || user.email !== ADMIN_EMAIL) return;
  const container = document.getElementById('adminContent');
  container.innerHTML = '<p>Загрузка...</p>';
  const snapshot = await db.collection('users').get();
  let html = '<h3>Пользователи</h3>';
  snapshot.forEach(doc => {
    const u = doc.data();
    const uid = doc.id;
    html += `
      <div class="user-row">
        <span>${u.email}</span>
        <span>Бесплатно: ${u.freeAccess ? 'Да' : 'Нет'}</span>
        <span>Подписка: ${u.subscriptionActive ? 'Активна' : 'Нет'}</span>
        <button onclick="toggleFreeAccess('${uid}', ${!u.freeAccess})">${u.freeAccess ? 'Убрать' : 'Дать'} бесплатный доступ</button>
      </div>`;
  });
  container.innerHTML = html;
}

window.toggleFreeAccess = async (uid, value) => {
  await db.collection('users').doc(uid).update({ freeAccess: value });
  loadAdminPanel();
};

// ================= СИМУЛЯЦИЯ ОПЛАТЫ =================
window.simulatePayment = async () => {
  const user = auth.currentUser;
  if (!user) return alert('Войдите сначала');
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 30);
  await db.collection('users').doc(user.uid).update({
    subscriptionActive: true,
    subscriptionExpiry: firebase.firestore.Timestamp.fromDate(expiry)
  });
  alert('Оплата симулирована! Доступ активен на 30 дней.');
};

// ================= СТАРТ =================
appendMessage('assistant', WELCOME_TEXT, false);
