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

// Базовий розклад згідно з графіком осіннього семестру
const INITIAL_SCHEDULE = [
  // --- I ТИЖДЕНЬ ---
  { week: 1, day: 1, title: "Заняття I тижня (Пн)", time: "08:30-09:50", room: "Ауд. 1", teacher: "Викладач" },
  { week: 1, day: 2, title: "Заняття I тижня (Вт)", time: "08:30-09:50", room: "Ауд. 1", teacher: "Викладач" },
  { week: 1, day: 3, title: "Заняття I тижня (Ср)", time: "08:30-09:50", room: "Ауд. 1", teacher: "Викладач" },
  { week: 1, day: 4, title: "Заняття I тижня (Чт)", time: "08:30-09:50", room: "Ауд. 1", teacher: "Викладач" },
  { week: 1, day: 5, title: "Заняття I тижня (Пт)", time: "08:30-09:50", room: "Ауд. 1", teacher: "Викладач" },
  
  // Суботи відпрацювань для I тижня
  { week: 1, day: 6, title: "Відпрацювання за Понеділок (I)", time: "08:30-09:50", room: "17 Жовтня", teacher: "За розкладом Пн" },
  { week: 1, day: 6, title: "Відпрацювання за Вівторок (I)", time: "10:00-11:20", room: "24 Жовтня", teacher: "За розкладом Вт" },
  { week: 1, day: 6, title: "Відпрацювання за Середу (I)", time: "11:40-13:00", room: "31 Жовтня", teacher: "За розкладом Ср" },
  { week: 1, day: 6, title: "Відпрацювання за Четвер (I)", time: "13:20-14:40", room: "07 Листопада", teacher: "За розкладом Чт" },
  { week: 1, day: 6, title: "Відпрацювання за П'ятницю (I)", time: "15:00-16:20", room: "14 Листопада", teacher: "За розкладом Пт" },

  // --- II ТИЖДЕНЬ ---
  { week: 2, day: 1, title: "Заняття II тижня (Пн)", time: "08:30-09:50", room: "Ауд. 2", teacher: "Викладач" },
  { week: 2, day: 2, title: "Заняття II тижня (Вт)", time: "08:30-09:50", room: "Ауд. 2", teacher: "Викладач" },
  { week: 2, day: 3, title: "Заняття II тижня (Ср)", time: "08:30-09:50", room: "Ауд. 2", teacher: "Викладач" },
  { week: 2, day: 4, title: "Заняття II тижня (Чт)", time: "08:30-09:50", room: "Ауд. 2", teacher: "Викладач" },
  { week: 2, day: 5, title: "Заняття II тижня (Пт)", time: "08:30-09:50", room: "Ауд. 2", teacher: "Викладач" },

  // Суботи відпрацювань для II тижня
  { week: 2, day: 6, title: "Відпрацювання за Понеділок (II)", time: "08:30-09:50", room: "12 Вересня", teacher: "За розкладом Пн" },
  { week: 2, day: 6, title: "Відпрацювання за Вівторок (II)", time: "10:00-11:20", room: "19 Вересня", teacher: "За розкладом Вт" },
  { week: 2, day: 6, title: "Відпрацювання за Середу (II)", time: "11:40-13:00", room: "26 Вересня", teacher: "За розкладом Ср" },
  { week: 2, day: 6, title: "Відпрацювання за Четвер (II)", time: "13:20-14:40", room: "03 Жовтня", teacher: "За розкладом Чт" },
  { week: 2, day: 6, title: "Відпрацювання за П'ятницю (II)", time: "15:00-16:20", room: "10 Жовтня", teacher: "За розкладом Пт" }
];

if (!localStorage.getItem('usersDB')) {
  localStorage.setItem('usersDB', JSON.stringify(INITIAL_USERS));
}

if (!localStorage.getItem('globalSchedule')) {
  localStorage.setItem('globalSchedule', JSON.stringify(INITIAL_SCHEDULE));
}

let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let isSignUpMode = false;
let selectedWeekView = 2;
let selectedHomeDayIdx = 0; // 0 = Понеділок, 1 = Вівторок...

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

// Перемикач теми
const themeBtn = document.getElementById('theme-toggle-btn');
if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
  });
}

// Перемикач входу / реєстрації
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

// Авторизація
const authForm = document.getElementById('auth-form');
if (authForm) {
  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('auth-email').value.trim();
    const passwordInput = document.getElementById('auth-password').value.trim();
    const fioInput = document.getElementById('auth-fio').value.trim();

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

    if (document.getElementById('auth-remember').checked) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }

    checkAuthState();
  });
}

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
      document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'flex');
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

// Навігація вкладками
document.querySelectorAll('.nav-btn[data-tab]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));

    btn.classList.add('active');
    const targetTab = document.getElementById(btn.dataset.tab);
    if (targetTab) targetTab.classList.add('active');
  });
});

function initDashboard() {
  renderHomeWidget();
  renderSchedule();
  loadTasks();
}

/* --- РЕНДЕР ГОЛОВНОЇ СТОРІНКИ --- */
const dayNames = ['Понеділок', 'Вівторок', 'Середа', 'Четвер', "П'ятниця", 'Субота'];

function renderHomeWidget() {
  const label = document.getElementById('current-day-label');
  if (label) {
    label.innerText = `${dayNames[selectedHomeDayIdx]}`;
  }

  const homeScheduleList = document.getElementById('home-schedule-list');
  if (homeScheduleList) {
    homeScheduleList.innerHTML = '';

    let globalClasses = JSON.parse(localStorage.getItem('globalSchedule')) || INITIAL_SCHEDULE;
    let customClasses = JSON.parse(localStorage.getItem(`customSchedule_${currentUser.id}`)) || [];

    const allClasses = [...globalClasses, ...customClasses].filter(c => 
      Number(c.week) === selectedWeekView && Number(c.day) === (selectedHomeDayIdx + 1)
    );

    if (allClasses.length === 0) {
      homeScheduleList.innerHTML = `
        <div class="empty-box">
          <span>📅</span>
          <p>На цей день розклад відсутній</p>
        </div>
      `;
    } else {
      allClasses.forEach(c => {
        homeScheduleList.innerHTML += `
          <div class="time-slot">
            <span class="time-label">${c.time.replace('-', '<br>')}</span>
            <div class="event-card">
              <div class="event-title">${c.title}</div>
              <div class="event-details">
                <span>Викладач: ${c.teacher}</span>
                <span class="room-badge">${c.room}</span>
              </div>
            </div>
          </div>
        `;
      });
    }
  }

  const miniCal = document.getElementById('mini-calendar-days');
  if (miniCal) {
    miniCal.innerHTML = '';
    dayNames.forEach((_, idx) => {
      const span = document.createElement('span');
      span.innerText = idx + 1;
      if (idx === selectedHomeDayIdx) span.className = 'active-day';
      span.style.cursor = 'pointer';
      span.onclick = () => {
        selectedHomeDayIdx = idx;
        renderHomeWidget();
      };
      miniCal.appendChild(span);
    });
  }

  renderHomeTasks();
}

document.getElementById('prev-day-btn')?.addEventListener('click', () => {
  selectedHomeDayIdx = (selectedHomeDayIdx - 1 + 6) % 6;
  renderHomeWidget();
});

document.getElementById('next-day-btn')?.addEventListener('click', () => {
  selectedHomeDayIdx = (selectedHomeDayIdx + 1) % 6;
  renderHomeWidget();
});

function renderHomeTasks() {
  const container = document.getElementById('home-tasks-list');
  if (!container) return;

  let tasks = JSON.parse(localStorage.getItem(`tasks_${currentUser.id}`)) || [];
  container.innerHTML = '';

  if (tasks.length === 0) {
    container.innerHTML = `
      <div class="empty-box">
        <span>📝</span>
        <p>Немає активних завдань</p>
      </div>
    `;
    return;
  }

  tasks.slice(0, 5).forEach(task => {
    const isDone = task.completed;
    container.innerHTML += `
      <div class="task-card">
        <div class="task-top">
          <div class="task-icon">${isDone ? '✓' : '📄'}</div>
          <div class="task-info">
            <div class="task-name">${task.title}</div>
            <div class="task-sub">Дедлайн: ${new Date(task.deadline).toLocaleDateString()}</div>
          </div>
          <button class="btn btn-outline" style="padding: 4px 8px; font-size: 11px;" onclick="toggleTask('${task.id}')">
            ${isDone ? 'Відновити' : 'Завершити'}
          </button>
        </div>
        <div class="progress-bar">
          <div class="progress-fill ${isDone ? 'completed' : ''}" style="width: ${isDone ? '100%' : '50%'};"></div>
        </div>
      </div>
    `;
  });
}

/* --- РЕНДЕР ВКЛАДКИ "РОЗКЛАД" --- */
function renderSchedule() {
  const grid = document.getElementById('schedule-grid');
  if (!grid) return;
  
  grid.innerHTML = '';

  let globalClasses = JSON.parse(localStorage.getItem('globalSchedule')) || INITIAL_SCHEDULE;
  let customClasses = JSON.parse(localStorage.getItem(`customSchedule_${currentUser.id}`)) || [];

  const adminClasses = globalClasses.filter(c => Number(c.week) === selectedWeekView);
  const userClasses = customClasses.filter(c => Number(c.week) === selectedWeekView);

  dayNames.forEach((dayName, idx) => {
    const dayCard = document.createElement('div');
    dayCard.className = 'day-card';
    dayCard.innerHTML = `<h4>${dayName}</h4><div id="day-classes-${idx+1}"></div>`;
    grid.appendChild(dayCard);

    const container = dayCard.querySelector(`#day-classes-${idx+1}`);
    const allClasses = [...adminClasses, ...userClasses].filter(c => Number(c.day) === (idx + 1));

    if (allClasses.length === 0) {
      container.innerHTML = '<small style="color: #94a3b8;">Пар немає</small>';
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
  document.getElementById('btn-week-1')?.classList.toggle('btn-primary', week === 1);
  document.getElementById('btn-week-1')?.classList.toggle('btn-outline', week !== 1);
  document.getElementById('btn-week-2')?.classList.toggle('btn-primary', week === 2);
  document.getElementById('btn-week-2')?.classList.toggle('btn-outline', week !== 2);
  renderSchedule();
  renderHomeWidget();
};

document.getElementById('add-subject-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const classObj = {
    week: Number(document.getElementById('custom-week').value),
    day: Number(document.getElementById('custom-day').value),
    title: document.getElementById('custom-title').value + " (Вибіркова)",
    time: document.getElementById('custom-time').value,
    room: document.getElementById('custom-room').value,
    teacher: document.getElementById('custom-teacher').value
  };

  let custom = JSON.parse(localStorage.getItem(`customSchedule_${currentUser.id}`)) || [];
  custom.push(classObj);
  localStorage.setItem(`customSchedule_${currentUser.id}`, JSON.stringify(custom));

  alert('Предмет додано!');
  e.target.reset();
  renderSchedule();
  renderHomeWidget();
});

/* --- РЕНДЕР ВКЛАДКИ "ЗАВДАННЯ" --- */
document.getElementById('create-task-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = document.getElementById('task-title').value;
  const deadline = document.getElementById('task-deadline').value;
  const newTask = { id: Date.now().toString(), title, deadline, completed: false };

  let tasks = JSON.parse(localStorage.getItem(`tasks_${currentUser.id}`)) || [];
  tasks.push(newTask);
  localStorage.setItem(`tasks_${currentUser.id}`, JSON.stringify(tasks));

  e.target.reset();
  loadTasks();
  renderHomeTasks();
});

function loadTasks() {
  let tasks = JSON.parse(localStorage.getItem(`tasks_${currentUser.id}`)) || [];
  const tasksList = document.getElementById('all-tasks-list');

  if (tasksList) {
    tasksList.innerHTML = '';
    if (tasks.length === 0) {
      tasksList.innerHTML = '<div class="empty-box"><span>📝</span><p>Список завдань порожній</p></div>';
      return;
    }

    tasks.forEach(task => {
      const li = document.createElement('li');
      li.className = `styled-task-item ${task.completed ? 'completed' : ''}`;
      li.innerHTML = `
        <div>
          <strong>${task.title}</strong>
          <br><small style="color: #64748b;">Дедлайн: ${new Date(task.deadline).toLocaleString()}</small>
        </div>
        <button class="btn btn-outline" onclick="toggleTask('${task.id}')">
          ${task.completed ? 'Відновити' : 'Завершити'}
        </button>
      `;
      tasksList.appendChild(li);
    });
  }
}

window.toggleTask = function(taskId) {
  let tasks = JSON.parse(localStorage.getItem(`tasks_${currentUser.id}`)) || [];
  tasks = tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
  localStorage.setItem(`tasks_${currentUser.id}`, JSON.stringify(tasks));
  
  loadTasks();
  renderHomeTasks();
};

/* --- ВКЛАДКА НАЛАШТУВАННЯ --- */
document.getElementById('settings-form')?.addEventListener('submit', (e) => {
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

/* --- ВКЛАДКА АДМІН --- */
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
        <td><span class="badge" style="background: ${u.role === 'admin' ? '#e74c3c' : '#1e3a8a'}">${u.role}</span></td>
      </tr>
    `;
  });
}

document.getElementById('admin-schedule-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const classObj = {
    week: Number(document.getElementById('admin-week').value),
    day: Number(document.getElementById('admin-day').value),
    title: document.getElementById('admin-title').value,
    time: document.getElementById('admin-time').value,
    room: document.getElementById('admin-room').value,
    teacher: document.getElementById('admin-teacher').value
  };

  let global = JSON.parse(localStorage.getItem('globalSchedule')) || INITIAL_SCHEDULE;
  global.push(classObj);
  localStorage.setItem('globalSchedule', JSON.stringify(global));

  alert('Додано у загальний розклад!');
  e.target.reset();
  renderSchedule();
  renderHomeWidget();
});

document.addEventListener('DOMContentLoaded', () => {
  checkAuthState();
  updateSeasonImage();
});
