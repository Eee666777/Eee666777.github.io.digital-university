let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let isSignUpMode = false;
let selectedWeekView = 2;

// Назви відеофайлів у папці public/
const SEASON_VIDEOS = {
  autumn: '26523-358778918_medium.mp4',       // Осінній парк
  winter: '120843-724673590_medium.mp4',      // Засніжений ліс
  springSummer: '2.mp4'                      // Зелені дерева / Літо
};

// Оновлення відео та анімації залежно від місяця
function updateSeasonAnimation() {
  const month = new Date().getMonth() + 1; // 1-12
  const video = document.getElementById('season-video');
  const char = document.getElementById('season-character');

  if (!video || !char) return;

  let videoSrc = '';

  if (month >= 9 && month <= 11) { // Осінь -> 26523-358778918_medium.mp4
    videoSrc = SEASON_VIDEOS.autumn;
    char.innerHTML = '🚴';
  } else if (month === 12 || month === 1 || month === 2) { // Зима -> 120843-724673590_medium.mp4
    videoSrc = SEASON_VIDEOS.winter;
    char.innerHTML = '🛷';
  } else { // Весна / Літо -> 2.mp4
    videoSrc = SEASON_VIDEOS.springSummer;
    char.innerHTML = '🏃';
  }

  if (!video.src.includes(videoSrc)) {
    video.src = videoSrc;
    video.load();
    video.play().catch(e => console.log("Автозапуск відео обмежено:", e));
  }
}

// Перемикач вход / реєстрація
document.getElementById('toggle-auth-btn').addEventListener('click', (e) => {
  e.preventDefault();
  isSignUpMode = !isSignUpMode;
  document.getElementById('auth-title').innerText = isSignUpMode ? 'Registration' : 'Sign In';
  document.getElementById('fio-group').style.display = isSignUpMode ? 'block' : 'none';
  document.getElementById('auth-submit-btn').innerText = isSignUpMode ? 'Зареєструватися' : 'Увійти';
  document.getElementById('toggle-text').innerText = isSignUpMode ? 'Вже є акаунт?' : 'Немає акаунту?';
  document.getElementById('toggle-auth-btn').innerText = isSignUpMode ? 'Увійти' : 'Зареєструватися';
});

// Авторизація через сервер Express
document.getElementById('auth-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('auth-email').value;
  const password = document.getElementById('auth-password').value;
  const fio = document.getElementById('auth-fio').value;

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
    alert("Помилка з'єднання з сервером");
  }
});

// Вихід
document.getElementById('logout-btn').addEventListener('click', () => {
  currentUser = null;
  localStorage.removeItem('currentUser');
  checkAuthState();
});

function checkAuthState() {
  if (currentUser) {
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('app-container').style.display = 'flex';
    document.getElementById('display-user-name').innerText = currentUser.fio || currentUser.email;

    if (currentUser.role === 'admin') {
      document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'block');
      loadAdminUsers();
    } else {
      document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
    }

    initDashboard();
  } else {
    document.getElementById('auth-container').style.display = 'flex';
    document.getElementById('app-container').style.display = 'none';
    updateSeasonAnimation();
  }
}

// Навігація
document.querySelectorAll('.nav-btn[data-tab]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));

    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

document.getElementById('theme-toggle-btn').addEventListener('click', () => {
  document.body.classList.toggle('dark-theme');
});

// Обчислення тижня (7 вересня 2026 року = Початок Тижня 2)
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
  grid.innerHTML = '';
  
  const dates = getDatesForWeek(selectedWeekView);
  const dayNames = ['Понеділок', 'Вівторок', 'Середа', 'Четвер', "П'ятниця", 'Субота'];

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
            ⏰ ${c.time} \vert{} 🚪 ${c.room}<br>
            👨‍🏫 ${c.teacher}
          </div>
        `;
      });
    }
  });
}

function switchWeekView(week) {
  selectedWeekView = week;
  document.getElementById('btn-week-1').classList.toggle('active', week === 1);
  document.getElementById('btn-week-2').classList.toggle('active', week === 2);
  renderSchedule();
}

document.getElementById('add-subject-form').addEventListener('submit', async (e) => {
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

async function checkTodaySchedule() {
  const currentWeek = getCurrentWeekType();
  const today = new Date();
  const dayOfWeek = today.getDay();
  
  document.getElementById('current-week-indicator').innerText = `Тиждень ${currentWeek}`;

  if (dayOfWeek === 0) {
    document.getElementById('schedule-alert').innerText = 'Сьогодні неділя. Пар немає!';
    return;
  }

  const globalRes = await fetch('/api/schedule/global');
  const globalClasses = await globalRes.json();

  const customRes = await fetch(`/api/schedule/custom/${currentUser.id}`);
  const customClasses = await customRes.json();

  const todayClasses = [...globalClasses, ...customClasses].filter(c => Number(c.week) === currentWeek && Number(c.day) === dayOfWeek);
  const listContainer = document.getElementById('today-classes-list');
  listContainer.innerHTML = '';

  if (todayClasses.length === 0) {
    listContainer.innerHTML = '<p>Сьогодні пар немає.</p>';
  } else {
    todayClasses.forEach(c => {
      listContainer.innerHTML += `<div class="class-item"><strong>${c.title}</strong> — ${c.time} (${c.room})</div>`;
    });
  }

  document.getElementById('schedule-alert').innerText = `Сьогодні пар за розкладом: ${todayClasses.length}. Після закінчення останньої пари з'явиться нагадування про наступний день.`;
}

document.getElementById('create-task-form').addEventListener('submit', async (e) => {
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

async function loadTasks() {
  const res = await fetch(`/api/tasks/${currentUser.id}`);
  const tasks = await res.json();

  const tasksList = document.getElementById('all-tasks-list');
  const homeTasksList = document.getElementById('home-tasks-list');

  tasksList.innerHTML = '';
  homeTasksList.innerHTML = '';

  tasks.forEach(task => {
    if (!task.completed) {
      homeTasksList.innerHTML += `<div class="class-item">📌 <strong>${task.title}</strong> (Термін: ${new Date(task.deadline).toLocaleString()})</div>`;
    }

    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;
    li.innerHTML = `
      <span>${task.title} — <small>${new Date(task.deadline).toLocaleString()}</small></span>
      <button onclick="toggleTask('${task.id}')">${task.completed ? 'Викреслено' : 'Завершити'}</button>
    `;
    tasksList.appendChild(li);
  });
}

async function toggleTask(taskId) {
  await fetch(`/api/tasks/${currentUser.id}/toggle/${taskId}`, { method: 'POST' });
  loadTasks();
}

document.getElementById('settings-form').addEventListener('submit', async (e) => {
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

async function loadAdminUsers() {
  const res = await fetch('/api/users');
  const users = await res.json();
  const tbody = document.getElementById('admin-users-table');
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

document.getElementById('admin-schedule-form').addEventListener('submit', async (e) => {
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

document.addEventListener('DOMContentLoaded', () => {
  checkAuthState();
  updateSeasonAnimation();
});
