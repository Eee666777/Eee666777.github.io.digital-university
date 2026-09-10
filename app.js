// ==========================================
// ГЛОБАЛЬНИЙ СТАН ТА СХОВИЩЕ (LocalStorage)
// ==========================================

const UKRAINE_ALARM_TOKEN = "72b33dc3:bfa08d61c3d0e08623a7a68fb80247b5";
const ALARM_API_URL = "https://api.ukrainealarm.com/api/v3/alerts";

// Збереження попередніх станів тривоги для уникнення спаму сповіщеннями
// Формат: { "31": true, "10": false } (true = тривога, false = спокійно)
let previousAlertStates = JSON.parse(localStorage.getItem('previousAlertStates')) || {};

// Початковий список користувачів
const INITIAL_USERS = [
  { id: "1", fio: "Білецький Сергій Євгенійович", email: "Bileckiy.kai.edu.ua", password: "Bileckiy-01", role: "student" },
  { id: "2", fio: "Зайчук Назарій Вікторович", email: "Zaec.kai.edu.ua", password: "Zaec-02", role: "student" },
  { id: "3", fio: "Ігнатенко Євген Олександрович", email: "Ignatenko.kai.edu.ua", password: "Ignatenko-03", role: "student" },
  { id: "4", fio: "Коберницький Ярослав Владлєнович", email: "Kobernickiy.kai.edu.ua", password: "Kobernickiy-04", role: "student" },
  { id: "5", fio: "Коваленко Олександр Дмитрович", email: "Kovalenko.kai.edu.ua", password: "Kovalenko-05", role: "student" },
  { id: "6", fio: "Крант Єлизавета Вячеславівна", email: "Krant.kai.edu.ua", password: "Krant-06", role: "student" },
  { id: "7", fio: "Мазуренко Ярослав Вадимович", email: "Mazurenko.kai.edu.ua", password: "Mazurenko-07", role: "student" },
  { id: "8", fio: "Молодан Богдан Вікторович", email: "Molodan.kai.edu.ua", password: "Molodan-08", role: "student" },
  { id: "9", fio: "Пелих Михайло Євгенович", email: "Pelykh.kai.edu.ua", password: "Pelykh-09", role: "student" },
  { id: "10", fio: "Рибалка Богдан Володимирович", email: "Rybalka.kai.edu.ua", password: "Rybalka-10", role: "student" },
  { id: "11", fio: "Рябчун Ярослав Олегович", email: "Ryabchun.kai.edu.ua", password: "Ryabchun-11", role: "student" },
  { id: "12", fio: "Усіченко Іван Юрійович", email: "Usichenko.kai.edu.ua", password: "Usichenko-12", role: "student" },
  { id: "13", fio: "Фесенко Олексій Михайлович", email: "Fesenko.kai.edu.ua", password: "Fesenko-13", role: "student" },
  { id: "14", fio: "Цвєтков Тимофій Олександрович", email: "Cvetkov.kai.edu.ua", password: "Cvetkov-14", role: "student" },
  { id: "15", fio: "Цис Михайло Олексійович", email: "Cys.kai.edu.ua", password: "Cys-15", role: "student" },
  { id: "admin", fio: "Адміністратор", email: "admin@kai.edu.ua", password: "admin", role: "admin" }
];

const defaultMonitoredRegions = [
  { id: "31", name: "м. Київ" }
];

const SEASON_IMAGES = {
  autumn: 'osen.png',
  winter: 'zima.png',
  springSummer: 'leto.png'
};

if (!localStorage.getItem('usersDB')) {
  localStorage.setItem('usersDB', JSON.stringify(INITIAL_USERS));
}

let usersDB = JSON.parse(localStorage.getItem('usersDB'));
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let userRegions = JSON.parse(localStorage.getItem('userRegions')) || defaultMonitoredRegions;

let isSignUpMode = false;
let selectedWeekView = 2;
let selectedCalendarDate = new Date();
let availableRegionsList = [];

function saveData() {
  localStorage.setItem('usersDB', JSON.stringify(usersDB));
  if (currentUser) {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  } else {
    localStorage.removeItem('currentUser');
  }
  localStorage.setItem('userRegions', JSON.stringify(userRegions));
  localStorage.setItem('previousAlertStates', JSON.stringify(previousAlertStates));
}

// ==========================================
// ІНІЦІАЛІЗАЦІЯ ПРИ ЗАВАНТАЖЕННІ
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  initNavigation();
  initTheme();
  initMapModal();
  initAlertsSystem();
  updateSeasonImage();
  checkAuthState();
});

// ==========================================
// 1. СЕЗОННЕ ФОНОВЕ ЗОБРАЖЕННЯ
// ==========================================
function updateSeasonImage() {
  const bgElement = document.getElementById('season-bg');
  if (!bgElement) return;

  const month = new Date().getMonth() + 1;
  let imgSrc = SEASON_IMAGES.autumn;

  if (month >= 9 && month <= 11) {
    imgSrc = SEASON_IMAGES.autumn;
  } else if (month === 12 || month === 1 || month === 2) {
    imgSrc = SEASON_IMAGES.winter;
  } else {
    imgSrc = SEASON_IMAGES.springSummer;
  }

  bgElement.style.backgroundImage = `url('${imgSrc}')`;
}

// ==========================================
// 2. АВТОРИЗАЦІЯ ТА РЕЄСТРАЦІЯ
// ==========================================
function initAuth() {
  const toggleAuthBtn = document.getElementById('toggle-auth-btn');
  const authForm = document.getElementById('auth-form');
  const logoutBtn = document.getElementById('logout-btn');

  if (toggleAuthBtn) {
    toggleAuthBtn.addEventListener('click', (e) => {
      e.preventDefault();
      isSignUpMode = !isSignUpMode;
      document.getElementById('auth-title').innerText = isSignUpMode ? 'Registration' : 'Sign In';
      document.getElementById('fio-group').style.display = isSignUpMode ? 'block' : 'none';
      document.getElementById('auth-submit-btn').innerText = isSignUpMode ? 'Зареєструватися' : 'Увійти';
      document.getElementById('toggle-text').innerText = isSignUpMode ? 'Вже є акаунт?' : 'Немає акаунту?';
      toggleAuthBtn.innerText = isSignUpMode ? 'Увійти' : 'Зареєструватися';
      
      const fioInput = document.getElementById('auth-fio');
      if (fioInput) fioInput.required = isSignUpMode;
    });
  }

  if (authForm) {
    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('auth-email').value.trim();
      const passwordInput = document.getElementById('auth-password').value.trim();
      const fioInput = document.getElementById('auth-fio') ? document.getElementById('auth-fio').value.trim() : '';

      try {
        const endpoint = isSignUpMode ? '/api/register' : '/api/login';
        const body = isSignUpMode ? { fio: fioInput, email: emailInput, password: passwordInput } : { email: emailInput, password: passwordInput };

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });

        if (res.ok) {
          const data = await res.json();
          currentUser = data.user;
        } else {
          throw new Error("Сервер недоступний, перехід на локальну базу");
        }
      } catch (err) {
        usersDB = JSON.parse(localStorage.getItem('usersDB')) || INITIAL_USERS;

        if (isSignUpMode) {
          const exists = usersDB.find(u => u.email.toLowerCase() === emailInput.toLowerCase());
          if (exists) {
            alert('Користувач з таким логином/поштою вже існує!');
            return;
          }
          currentUser = {
            id: Date.now().toString(),
            fio: fioInput || "Новий Користувач",
            email: emailInput,
            password: passwordInput,
            role: "student"
          };
          usersDB.push(currentUser);
        } else {
          const user = usersDB.find(u => 
            u.email.toLowerCase() === emailInput.toLowerCase() && u.password === passwordInput
          );

          if (!user) {
            alert('Невірні дані авторизації!');
            return;
          }
          currentUser = user;
        }
      }

      const rememberCheck = document.getElementById('auth-remember');
      if (rememberCheck && rememberCheck.checked) {
        saveData();
      } else {
        localStorage.setItem('usersDB', JSON.stringify(usersDB));
      }

      checkAuthState();
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      currentUser = null;
      localStorage.removeItem('currentUser');
      checkAuthState();
    });
  }
}

function checkAuthState() {
  const authContainer = document.getElementById('auth-container');
  const appContainer = document.getElementById('app-container');

  if (currentUser) {
    if (authContainer) authContainer.style.display = 'none';
    if (appContainer) appContainer.style.display = 'flex';
    
    const nameDisplay = document.getElementById('display-user-name');
    if (nameDisplay) nameDisplay.innerText = currentUser.fio || currentUser.email;

    if (currentUser.role === 'admin') {
      document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'block');
      loadAdminUsers();
    } else {
      document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
    }

    initDashboard();
    fetchAlertsData();
  } else {
    if (authContainer) authContainer.style.display = 'flex';
    if (appContainer) appContainer.style.display = 'none';
    updateSeasonImage();
  }
}

// ==========================================
// 3. НАВІГАЦІЯ ТА ВКЛАДКИ
// ==========================================
function initNavigation() {
  document.querySelectorAll('.nav-btn[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));

      btn.classList.add('active');
      const targetTab = document.getElementById(btn.dataset.tab);
      if (targetTab) targetTab.classList.add('active');
    });
  });
}

// ==========================================
// 4. ТЕМИ ТА НАЛАШТУВАННЯ
// ==========================================
function initTheme() {
  const themeBtn = document.getElementById('theme-toggle-btn');
  const body = document.body;

  const savedTheme = localStorage.getItem('du_theme') || 'light-theme';
  body.className = savedTheme;

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      if (body.classList.contains('light-theme')) {
        body.className = 'dark-theme';
        localStorage.setItem('du_theme', 'dark-theme');
      } else {
        body.className = 'light-theme';
        localStorage.setItem('du_theme', 'light-theme');
      }
    });
  }

  const settingsForm = document.getElementById('settings-form');
  if (settingsForm) {
    settingsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const group = document.getElementById('setting-group')?.value;
      const dob = document.getElementById('setting-dob')?.value;
      const newPass = document.getElementById('setting-password')?.value;

      if (group) currentUser.group = group;
      if (dob) currentUser.dob = dob;
      if (newPass) currentUser.password = newPass;

      const idx = usersDB.findIndex(u => u.id === currentUser.id || u.email === currentUser.email);
      if (idx !== -1) usersDB[idx] = currentUser;

      saveData();
      alert('Налаштування збережено!');
    });
  }
}

// ==========================================
// 5. ДАШБОРД ТА РОЗКЛАД
// ==========================================
function getCurrentWeekType() {
  const startDate = new Date(2026, 8, 7);
  const now = new Date();
  const diffDays = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 2;
  const weekNum = Math.floor(diffDays / 7);
  return (weekNum % 2 === 0) ? 2 : 1;
}

function getDatesForWeek(weekType) {
  const currentWeek = getCurrentWeekType();
  const today = new Date();
  const currentDayOfWeek = today.getDay() === 0 ? 7 : today.getDay();

  const mondayCurrent = new Date(today);
  mondayCurrent.setDate(today.getDate() - (currentDayOfWeek - 1));

  let mondayTarget = new Date(mondayCurrent);
  if (weekType !== currentWeek) {
    mondayTarget.setDate(mondayCurrent.getDate() + 7);
  }

  const days = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(mondayTarget);
    d.setDate(mondayTarget.getDate() + i);
    days.push(d);
  }
  return days;
}

function initDashboard() {
  renderSchedule();
  loadTasks();
  checkTodaySchedule();
  renderHomeSchedule();
  renderMiniCalendar();
}

async function renderSchedule() {
  const grid = document.getElementById('schedule-grid');
  if (!grid) return;
  
  grid.innerHTML = '';
  const dates = getDatesForWeek(selectedWeekView);
  const dayNames = ['Понеділок', 'Вівторок', 'Середа', 'Четвер', "П'ятниця", 'Субота'];

  let globalClasses = JSON.parse(localStorage.getItem('globalSchedule')) || [];
  let customClasses = JSON.parse(localStorage.getItem(`customSchedule_${currentUser.id}`)) || [];

  try {
    const globalRes = await fetch('/api/schedule/global');
    if (globalRes.ok) globalClasses = await globalRes.json();

    const customRes = await fetch(`/api/schedule/custom/${currentUser.id}`);
    if (customRes.ok) customClasses = await customRes.json();
  } catch (e) {}

  const adminClasses = globalClasses.filter(c => Number(c.week) === selectedWeekView);
  const userClasses = customClasses.filter(c => Number(c.week) === selectedWeekView);

  dayNames.forEach((dayName, idx) => {
    const dayDate = dates[idx];
    const dateStr = dayDate.toLocaleDateString('uk-UA', { day: 'numeric', month: 'numeric' });

    const dayCard = document.createElement('div');
    dayCard.className = 'day-card';
    dayCard.innerHTML = `<h4>${dayName} (${dateStr})</h4><div id="day-classes-${idx+1}"></div>`;
    grid.appendChild(dayCard);

    const container = dayCard.querySelector(`#day-classes-${idx+1}`);
    const allClasses = [...adminClasses, ...userClasses].filter(c => Number(c.day) === (idx + 1));

    if (allClasses.length === 0) {
      container.innerHTML = '<small>Пар немає</small>';
    } else {
      allClasses.forEach(c => {
        container.innerHTML += `
          <div class="class-item">
            <strong>${c.title}</strong><br>
            ⏰ ${c.time} | 🚪 ${c.room}<br>
            👨‍🏫 ${c.teacher}
          </div>
        `;
      });
    }
  });
}

window.switchWeekView = function(week) {
  selectedWeekView = week;
  const btn1 = document.getElementById('btn-week-1');
  const btn2 = document.getElementById('btn-week-2');
  if (btn1) btn1.classList.toggle('active', week === 1);
  if (btn2) btn2.classList.toggle('active', week === 2);
  renderSchedule();
};

const addSubjectForm = document.getElementById('add-subject-form');
if (addSubjectForm) {
  addSubjectForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const classObj = {
      week: Number(document.getElementById('custom-week').value),
      day: Number(document.getElementById('custom-day').value),
      title: document.getElementById('custom-title').value + " (Вибіркова)",
      time: document.getElementById('custom-time').value,
      room: document.getElementById('custom-room').value,
      teacher: document.getElementById('custom-teacher').value
    };

    try {
      await fetch(`/api/schedule/custom/${currentUser.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(classObj)
      });
    } catch (err) {
      let custom = JSON.parse(localStorage.getItem(`customSchedule_${currentUser.id}`)) || [];
      custom.push(classObj);
      localStorage.setItem(`customSchedule_${currentUser.id}`, JSON.stringify(custom));
    }

    alert('Предмет додано!');
    e.target.reset();
    renderSchedule();
  });
}

async function checkTodaySchedule() {
  const currentWeek = getCurrentWeekType();
  const today = new Date();
  const dayOfWeek = today.getDay();
  
  const weekIndicator = document.getElementById('current-week-indicator');
  if (weekIndicator) weekIndicator.innerText = `Тиждень ${currentWeek}`;

  const scheduleAlert = document.getElementById('schedule-alert');
  if (dayOfWeek === 0) {
    if (scheduleAlert) scheduleAlert.innerText = 'Сьогодні неділя. Пар немає!';
    return;
  }

  let globalClasses = JSON.parse(localStorage.getItem('globalSchedule')) || [];
  let customClasses = JSON.parse(localStorage.getItem(`customSchedule_${currentUser.id}`)) || [];

  try {
    const globalRes = await fetch('/api/schedule/global');
    if (globalRes.ok) globalClasses = await globalRes.json();

    const customRes = await fetch(`/api/schedule/custom/${currentUser.id}`);
    if (customRes.ok) customClasses = await customRes.json();
  } catch (e) {}

  const todayClasses = [...globalClasses, ...customClasses].filter(c => Number(c.week) === currentWeek && Number(c.day) === dayOfWeek);
  const listContainer = document.getElementById('today-classes-list');
  
  if (listContainer) {
    listContainer.innerHTML = '';
    if (todayClasses.length === 0) {
      listContainer.innerHTML = '<p>Сьогодні пар немає.</p>';
    } else {
      todayClasses.forEach(c => {
        listContainer.innerHTML += `<div class="class-item"><strong>${c.title}</strong> — ${c.time} (${c.room})</div>`;
      });
    }
  }

  if (scheduleAlert) {
    scheduleAlert.innerText = `Сьогодні пар за розкладом: ${todayClasses.length}.`;
  }
}

document.getElementById('prev-day-btn')?.addEventListener('click', () => {
  selectedCalendarDate.setDate(selectedCalendarDate.getDate() - 1);
  renderHomeSchedule();
  renderMiniCalendar();
});

document.getElementById('next-day-btn')?.addEventListener('click', () => {
  selectedCalendarDate.setDate(selectedCalendarDate.getDate() + 1);
  renderHomeSchedule();
  renderMiniCalendar();
});

function renderHomeSchedule() {
  const label = document.getElementById('current-day-label');
  if (label) {
    label.innerText = selectedCalendarDate.toLocaleDateString('uk-UA', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  }
}

function renderMiniCalendar() {
  const calendarContainer = document.getElementById('mini-calendar-container');
  if (calendarContainer) {
    calendarContainer.innerText = `Обрана дата: ${selectedCalendarDate.toLocaleDateString('uk-UA')}`;
  }
}

// ==========================================
// 6. УПРАВЛІННЯ ЗАВДАННЯМИ (TASKS)
// ==========================================
const createTaskForm = document.getElementById('create-task-form');
if (createTaskForm) {
  createTaskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('task-title').value;
    const deadline = document.getElementById('task-deadline').value;
    const newTask = { id: Date.now().toString(), title, deadline, completed: false };

    try {
      await fetch(`/api/tasks/${currentUser.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      });
    } catch (err) {
      let tasks = JSON.parse(localStorage.getItem(`tasks_${currentUser.id}`)) || [];
      tasks.push(newTask);
      localStorage.setItem(`tasks_${currentUser.id}`, JSON.stringify(tasks));
    }

    e.target.reset();
    loadTasks();
  });
}

async function loadTasks() {
  if (!currentUser) return;
  let tasks = JSON.parse(localStorage.getItem(`tasks_${currentUser.id}`)) || [];

  try {
    const res = await fetch(`/api/tasks/${currentUser.id}`);
    if (res.ok) tasks = await res.json();
  } catch (e) {}

  const tasksList = document.getElementById('all-tasks-list');
  const homeTasksList = document.getElementById('home-tasks-list');

  if (tasksList) tasksList.innerHTML = '';
  if (homeTasksList) homeTasksList.innerHTML = '';

  tasks.forEach(task => {
    if (!task.completed && homeTasksList) {
      homeTasksList.innerHTML += `<div class="class-item">📌 <strong>${task.title}</strong> (Термін: ${new Date(task.deadline).toLocaleString()})</div>`;
    }

    if (tasksList) {
      const li = document.createElement('li');
      li.className = `task-item ${task.completed ? 'completed' : ''}`;
      li.innerHTML = `
        <span>${task.title} — <small>${new Date(task.deadline).toLocaleString()}</small></span>
        <button onclick="toggleTask('${task.id}')">${task.completed ? 'Викреслено' : 'Завершити'}</button>
      `;
      tasksList.appendChild(li);
    }
  });
}

window.toggleTask = async function(taskId) {
  try {
    await fetch(`/api/tasks/${currentUser.id}/toggle/${taskId}`, { method: 'POST' });
  } catch (err) {
    let tasks = JSON.parse(localStorage.getItem(`tasks_${currentUser.id}`)) || [];
    tasks = tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
    localStorage.setItem(`tasks_${currentUser.id}`, JSON.stringify(tasks));
  }
  loadTasks();
};

// ==========================================
// 7. СИСТЕМА РЕАЛЬНИХ СПОВІЩЕНЬ (AUDIO & NOTIFICATIONS)
// ==========================================

// Запит дозволу на браузерні сповіщення
function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        console.log("Дозвіл на сповіщення отримано!");
      }
    });
  }
}

// Генерація звукового сигналу сирени або відбою через Web Audio API (працює без зовнішніх MP3-файлів)
function playAlarmSound(type = 'start') {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'start') {
      // Сирена: частота гармонійно піднімається і опускається
      osc.type = 'sawtooth';
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.linearRampToValueAtTime(800, now + 0.8);
      osc.frequency.linearRampToValueAtTime(400, now + 1.6);
      
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 1.8);

      osc.start(now);
      osc.stop(now + 1.8);
    } else {
      // Відбій: приємний подвійний біп
      osc.type = 'sine';
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.2); // E5

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

      osc.start(now);
      osc.stop(now + 0.5);
    }
  } catch (e) {
    console.error("Помилка відтворення звуку:", e);
  }
}

// Надсилання пуш-сповіщення у браузер
function triggerBrowserNotification(title, body, iconType = 'warning') {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, {
      body: body,
      icon: iconType === 'warning' ? '🚨' : '🟢',
      requireInteraction: true // Сповіщення висітиме, поки користувач його не закриє
    });
  }
}

function initAlertsSystem() {
  loadRegionsList();
  requestNotificationPermission();

  const addRegionForm = document.getElementById('add-region-form');
  if (addRegionForm) {
    addRegionForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const select = document.getElementById('region-select');
      const regionId = select.value;
      const regionName = select.options[select.selectedIndex].text;

      if (!regionId) return;

      if (userRegions.some(r => r.id === regionId)) {
        alert('Цей регіон вже є у вашому списку!');
        return;
      }

      userRegions.push({ id: regionId, name: regionName });
      saveData();
      fetchAlertsData();
      alert('Регіон успішно додано!');
    });
  }

  // Оновлення кожні 15 секунд для більш оперативних сповіщень
  setInterval(fetchAlertsData, 15000);
}

async function loadRegionsList() {
  const select = document.getElementById('region-select');
  if (!select) return;

  try {
    const response = await fetch("https://api.ukrainealarm.com/api/v3/regions", {
      headers: { "Authorization": UKRAINE_ALARM_TOKEN }
    });
    if (response.ok) {
      const data = await response.json();
      availableRegionsList = data.states || data || [];
      populateRegionsSelect(availableRegionsList);
    } else {
      fallbackRegionsList();
    }
  } catch (err) {
    fallbackRegionsList();
  }
}

function populateRegionsSelect(list) {
  const select = document.getElementById('region-select');
  if (!select) return;
  select.innerHTML = '<option value="">-- Оберіть регіон --</option>';
  list.forEach(r => {
    const opt = document.createElement('option');
    opt.value = r.regionId || r.id;
    opt.textContent = r.regionName || r.name;
    select.appendChild(opt);
  });
}

function fallbackRegionsList() {
  const fallback = [
    { id: "31", name: "м. Київ" },
    { id: "10", name: "Київська область" },
    { id: "14", name: "Львівська область" },
    { id: "13", name: "Одеська область" },
    { id: "17", name: "Харківська область" },
    { id: "5", name: "Дніпропетровська область" },
    { id: "3", name: "Волинська область" }
  ];
  populateRegionsSelect(fallback);
}

async function fetchAlertsData() {
  try {
    const response = await fetch(ALARM_API_URL, {
      headers: { "Authorization": UKRAINE_ALARM_TOKEN }
    });

    let activeAlerts = [];
    if (response.ok) {
      activeAlerts = await response.json();
    }

    // Перевірка змін стану тривог
    processAlertNotifications(activeAlerts);
    renderAlertsUI(activeAlerts);
  } catch (error) {
    renderAlertsUI([]);
  }
}

// Логіка порівняння станів та сповіщення користувача
function processAlertNotifications(activeAlerts) {
  userRegions.forEach(region => {
    const isCurrentlyAlert = activeAlerts.some(a => String(a.regionId) === String(region.id));
    const wasAlert = previousAlertStates[region.id] || false;

    // Сценарій 1: Почалася нова тривога
    if (isCurrentlyAlert && !wasAlert) {
      playAlarmSound('start');
      triggerBrowserNotification(
        `🚨 ПОВІТРЯНА ТРИВОГА!`,
        `У регіоні ${region.name} оголошено повітряну тривогу! Прямуйте в укриття!`,
        'warning'
      );
    }
    // Сценарій 2: Відбій тривоги
    else if (!isCurrentlyAlert && wasAlert) {
      playAlarmSound('end');
      triggerBrowserNotification(
        `🟢 ВІДБІЙ ТРИВОГИ`,
        `У регіоні ${region.name} оголошено відбій повітряної тривоги.`,
        'clear'
      );
    }

    // Оновлюємо стан
    previousAlertStates[region.id] = isCurrentlyAlert;
  });

  saveData();
}

function renderAlertsUI(alertsData) {
  const homeContainer = document.getElementById('home-alerts-container');
  const tabContainer = document.getElementById('monitored-regions-list');

  let homeHtml = '';
  let tabHtml = '';

  userRegions.forEach(region => {
    const isAlert = alertsData.some(a => String(a.regionId) === String(region.id));

    const statusClass = isAlert ? 'status-active' : 'status-clear';
    const statusText = isAlert ? '🚨 ПОВІТРЯНА ТРИВОГА!' : '🟢 Спокійно';

    homeHtml += `
      <div class="alert-card-status ${statusClass}">
        <span><strong>${region.name}</strong></span>
        <span>${statusText}</span>
      </div>
    `;

    tabHtml += `
      <div class="alert-card-status ${statusClass}">
        <div>
          <strong>${region.name}</strong> — ${statusText}
        </div>
        ${region.id !== '31' ? `<button class="btn btn-outline" style="padding: 2px 8px; color: red;" onclick="removeRegion('${region.id}')">Видалити</button>` : '<small>(Основний)</small>'}
      </div>
    `;
  });

  if (homeContainer) homeContainer.innerHTML = homeHtml;
  if (tabContainer) tabContainer.innerHTML = tabHtml;
}

window.removeRegion = function(id) {
  userRegions = userRegions.filter(r => r.id !== id);
  delete previousAlertStates[id];
  saveData();
  fetchAlertsData();
};

// ==========================================
// 8. ІНТЕРАКТИВНА КАРТА (МОДАЛЬНЕ ВІКНО)
// ==========================================
function initMapModal() {
  const modal = document.getElementById('map-modal');
  if (!modal) return;

  const openBtn1 = document.getElementById('open-map-btn');
  const openBtn2 = document.getElementById('tab-open-map-btn');
  const closeBtn = document.getElementById('close-map-btn');

  const openModal = () => modal.classList.add('active');
  const closeModal = () => modal.classList.remove('active');

  if (openBtn1) openBtn1.addEventListener('click', openModal);
  if (openBtn2) openBtn2.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}

// ==========================================
// 9. АДМІНІСТРАТИВНА ПАНЕЛЬ
// ==========================================
function loadAdminUsers() {
  const users = JSON.parse(localStorage.getItem('usersDB')) || INITIAL_USERS;
  const tbody = document.getElementById('admin-users-table');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  users.forEach(u => {
    tbody.innerHTML += `
      <tr>
        <td>${u.fio || 'Не вказано'}</td>
        <td>${u.email}</td>
        <td><code>${u.password || u.pass || '******'}</code></td>
        <td>${u.role}</td>
      </tr>
    `;
  });
}

const adminScheduleForm = document.getElementById('admin-schedule-form');
if (adminScheduleForm) {
  adminScheduleForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const classObj = {
      week: Number(document.getElementById('admin-week').value),
      day: Number(document.getElementById('admin-day').value),
      title: document.getElementById('admin-title').value,
      time: document.getElementById('admin-time').value,
      room: document.getElementById('admin-room').value,
      teacher: document.getElementById('admin-teacher').value
    };

    try {
      await fetch('/api/schedule/global', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(classObj)
      });
    } catch (err) {
      let global = JSON.parse(localStorage.getItem('globalSchedule')) || [];
      global.push(classObj);
      localStorage.setItem('globalSchedule', JSON.stringify(global));
    }

    alert('Додано у загальний розклад!');
    e.target.reset();
    renderSchedule();
  });
}
