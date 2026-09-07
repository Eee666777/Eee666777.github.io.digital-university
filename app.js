// База користувачів із наданого списку (плюс локально зареєстровані)
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

// Ініціалізація баз даних в localStorage
if (!localStorage.getItem('usersDB')) {
  localStorage.setItem('usersDB', JSON.stringify(INITIAL_USERS));
}

let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let isSignUpMode = false;
let selectedWeekView = 2;

// Картинки сезонів (.png)
const SEASON_IMAGES = {
  autumn: 'osen.png',
  winter: 'zima.png',
  springSummer: 'leto.png'
};

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

// Перемикання між формою входу та реєстрації
const toggleAuthBtn = document.getElementById('toggle-auth-btn');
if (toggleAuthBtn) {
  toggleAuthBtn.addEventListener('click', (e) => {
    e.preventDefault();
    isSignUpMode = !isSignUpMode;
    document.getElementById('auth-title').innerText = isSignUpMode ? 'Registration' : 'Sign In';
    document.getElementById('fio-group').style.display = isSignUpMode ? 'block' : 'none';
    document.getElementById('auth-submit-btn').innerText = isSignUpMode ? 'Зареєструватися' : 'Увійти';
    document.getElementById('toggle-text').innerText = isSignUpMode ? 'Вже є акаунт?' : 'Немає акаунту?';
    document.getElementById('toggle-auth-btn').innerText = isSignUpMode ? 'Увійти' : 'Зареєструватися';
  });
}

// Обробка авторизації
const authForm = document.getElementById('auth-form');
if (authForm) {
  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('auth-email').value.trim();
    const passwordInput = document.getElementById('auth-password').value.trim();
    const fioInput = document.getElementById('auth-fio').value.trim();

    try {
      // Спочатку пробуємо авторизуватись через сервер, якщо він є
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
        throw new Error("Сервер недоступний, перехід на офлайн-базу");
      }
    } catch (err) {
      // Резервна офлайн-авторизація за таблицею користувачів
      const usersDB = JSON.parse(localStorage.getItem('usersDB')) || INITIAL_USERS;

      if (isSignUpMode) {
        const exists = usersDB.find(u => u.email.toLowerCase() === emailInput.toLowerCase());
        if (exists) {
          alert('Користувач з таким логином/поштою вже існує');
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
        localStorage.setItem('usersDB', JSON.stringify(usersDB));
      } else {
        const user = usersDB.find(u => 
          u.email.toLowerCase() === emailInput.toLowerCase() && u.password === passwordInput
        );

        if (!user) {
          alert('Невірні дані авторизації');
          return;
        }
        currentUser = user;
      }
    }

    if (document.getElementById('auth-remember').checked) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }

    checkAuthState();
  });
}

// Вихід з акаунту
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    currentUser = null;
    localStorage.removeItem('currentUser');
    checkAuthState();
  });
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
  } else {
    if (authContainer) authContainer.style.display = 'flex';
    if (appContainer) appContainer.style.display = 'none';
    updateSeasonImage();
  }
}

// Навігація вкладок
document.querySelectorAll('.nav-btn[data-tab]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));

    btn.classList.add('active');
    const targetTab = document.getElementById(btn.dataset.tab);
    if (targetTab) targetTab.classList.add('active');
  });
});

const themeBtn = document.getElementById('theme-toggle-btn');
if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
  });
}

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
  } catch (e) {
    // Резервне завантаження з localStorage
  }

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

const settingsForm = document.getElementById('settings-form');
if (settingsForm) {
  settingsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const group = document.getElementById('setting-group').value;
    const dob = document.getElementById('setting-dob').value;
    const newPass = document.getElementById('setting-password').value;

    if (group) currentUser.group = group;
    if (dob) currentUser.dob = dob;
    if (newPass) currentUser.password = newPass;

    const usersDB = JSON.parse(localStorage.getItem('usersDB')) || INITIAL_USERS;
    const idx = usersDB.findIndex(u => u.id === currentUser.id);
    if (idx !== -1) usersDB[idx] = currentUser;
    localStorage.setItem('usersDB', JSON.stringify(usersDB));

    if (localStorage.getItem('currentUser')) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }

    alert('Налаштування збережено!');
  });
}

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
        <td><code>${u.password || '******'}</code></td>
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

// Початковий запуск
document.addEventListener('DOMContentLoaded', () => {
  checkAuthState();
  updateSeasonImage();
});
