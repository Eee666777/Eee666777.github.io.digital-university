let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let isSignUpMode = false;
let selectedWeekView = 2;

// Назви відеофалів для пір року
const SEASON_VIDEOS = {
  autumn: 'osen.mp4',
  winter: 'zima.mp4',
  springSummer: 'leto.mp4'
};

// Функція вибору та безпечного автозапуску відео
function updateSeasonAnimation() {
  const video = document.getElementById('season-video');
  if (!video) return;

  const month = new Date().getMonth() + 1;
  let videoSrc = SEASON_VIDEOS.autumn;

  if (month >= 9 && month <= 11) {
    videoSrc = SEASON_VIDEOS.autumn;
  } else if (month === 12 || month === 1 || month === 2) {
    videoSrc = SEASON_VIDEOS.winter;
  } else {
    videoSrc = SEASON_VIDEOS.springSummer;
  }

  // Обов'язкові параметри для обходу блокування браузера
  video.muted = true;
  video.playsInline = true;

  if (!video.src || !video.src.endsWith(videoSrc)) {
    video.src = videoSrc;
    video.load();
  }

  const playPromise = video.play();
  if (playPromise !== undefined) {
    playPromise.catch(error => {
      console.warn("Браузер заблокував автозапуск відео:", error);
    });
  }
}

// Перемикання Вхід / Реєстрація
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

// Форма авторизації
const authForm = document.getElementById('auth-form');
if (authForm) {
  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value.trim();
    const fio = document.getElementById('auth-fio').value.trim();

    const endpoint = isSignUpMode ? '/api/register' : '/api/login';
    const body = isSignUpMode ? { fio, email, password } : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Помилка авторизації');
        return;
      }

      currentUser = data.user;
      if (document.getElementById('auth-remember').checked) {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
      }
      
      checkAuthState();
    } catch (err) {
      alert("Сервер відновлює роботу. Зачекайте 10 секунд і спробуйте ще раз.");
    }
  });
}

// Вихід
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
    updateSeasonAnimation();
  }
}

// Переключення вкладок
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

  try {
    const globalRes = await fetch('/api/schedule/global');
    const globalClasses = await globalRes.json();

    const customRes = await fetch(`/api/schedule/custom/${currentUser.id}`);
    const customClasses = await customRes.json();

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
  } catch (e) {
    console.error("Помилка завантаження розкладу:", e);
  }
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

    await fetch(`/api/schedule/custom/${currentUser.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(classObj)
    });

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

  try {
    const globalRes = await fetch('/api/schedule/global');
    const globalClasses = await globalRes.json();

    const customRes = await fetch(`/api/schedule/custom/${currentUser.id}`);
    const customClasses = await customRes.json();

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
  } catch (e) {
    console.error("Помилка перевірки розкладу на сьогодні:", e);
  }
}

const createTaskForm = document.getElementById('create-task-form');
if (createTaskForm) {
  createTaskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('task-title').value;
    const deadline = document.getElementById('task-deadline').value;

    await fetch(`/api/tasks/${currentUser.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, deadline })
    });

    e.target.reset();
    loadTasks();
  });
}

async function loadTasks() {
  try {
    const res = await fetch(`/api/tasks/${currentUser.id}`);
    const tasks = await res.json();

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
  } catch (e) {
    console.error("Помилка завантаження завдань:", e);
  }
}

window.toggleTask = async function(taskId) {
  await fetch(`/api/tasks/${currentUser.id}/toggle/${taskId}`, { method: 'POST' });
  loadTasks();
};

const settingsForm = document.getElementById('settings-form');
if (settingsForm) {
  settingsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const group = document.getElementById('setting-group').value;
    const dob = document.getElementById('setting-dob').value;
    const newPass = document.getElementById('setting-password').value;

    const updateData = {};
    if (group) updateData.group = group;
    if (dob) updateData.dob = dob;
    if (newPass) updateData.password = newPass;

    const res = await fetch(`/api/users/update/${currentUser.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });

    const data = await res.json();
    currentUser = data.user;
    if (localStorage.getItem('currentUser')) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }

    alert('Налаштування збережено!');
  });
}

async function loadAdminUsers() {
  try {
    const res = await fetch('/api/users');
    const users = await res.json();
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
  } catch (e) {
    console.error("Помилка завантаження адмін-даних:", e);
  }
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

    await fetch('/api/schedule/global', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(classObj)
    });

    alert('Додано у загальний розклад!');
    e.target.reset();
    renderSchedule();
  });
}

// Ініціалізація при завантаженні
document.addEventListener('DOMContentLoaded', () => {
  checkAuthState();
  updateSeasonAnimation();
});
