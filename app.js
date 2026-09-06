// Вставте ваші ключі з Firebase Console
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let currentUser = null;
let userData = null;
let isSignUpMode = false;
let selectedWeekView = 2; // За замовчуванням Тиждень 2

// Посилання на ваші відеофайли
const SEASON_VIDEOS = {
  autumn: '26523-358778918_medium.mp4',       // Осінній парк
  winter: '120843-724673590_medium.mp4',      // Засніжений ліс
  springSummer: '2.mp4'                      // Лісова стежка / Літо
};

// Оновлення анімацій і відео за порами року
function updateSeasonAnimation() {
  const month = new Date().getMonth() + 1; // 1-12
  const video = document.getElementById('season-video');
  const char = document.getElementById('season-character');

  if (!video || !char) return;

  let videoSrc = '';

  if (month >= 9 && month <= 11) { // Осінь (Вересень - Листопад)
    videoSrc = SEASON_VIDEOS.autumn;
    char.innerHTML = '🚴';
  } else if (month === 12 || month === 1 || month === 2) { // Зима
    videoSrc = SEASON_VIDEOS.winter;
    char.innerHTML = '🛷';
  } else { // Весна / Літо
    videoSrc = SEASON_VIDEOS.springSummer;
    char.innerHTML = '🏃';
  }

  if (!video.src.includes(videoSrc)) {
    video.src = videoSrc;
    video.load();
    video.play().catch(e => console.log("Автозапуск відео обмежено:", e));
  }
}

// Перемикання вхід / реєстрація
document.getElementById('toggle-auth-btn').addEventListener('click', (e) => {
  e.preventDefault();
  isSignUpMode = !isSignUpMode;
  document.getElementById('auth-title').innerText = isSignUpMode ? 'Registration' : 'Sign In';
  document.getElementById('fio-group').style.display = isSignUpMode ? 'block' : 'none';
  document.getElementById('auth-submit-btn').innerText = isSignUpMode ? 'Зареєструватися' : 'Увійти';
  document.getElementById('toggle-text').innerText = isSignUpMode ? 'Вже є акаунт?' : 'Немає акаунту?';
  document.getElementById('toggle-auth-btn').innerText = isSignUpMode ? 'Увійти' : 'Зареєструватися';
});

// Авторизація
document.getElementById('auth-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('auth-email').value;
  const password = document.getElementById('auth-password').value;
  const fio = document.getElementById('auth-fio').value;
  const remember = document.getElementById('auth-remember').checked;

  const persistence = remember ? firebase.auth.Auth.Persistence.LOCAL : firebase.auth.Auth.Persistence.SESSION;

  try {
    await auth.setPersistence(persistence);

    if (isSignUpMode) {
      const res = await auth.createUserWithEmailAndPassword(email, password);
      const role = password === 'Admin-pass444' ? 'admin' : 'student';

      await db.collection('users').doc(res.user.uid).set({
        fio: fio,
        email: email,
        password: password,
        role: role,
        group: '',
        dob: ''
      });
      alert('Реєстрація успішна!');
    } else {
      await auth.signInWithEmailAndPassword(email, password);
    }
  } catch (err) {
    alert("Помилка: " + err.message);
  }
});

// Вихід
document.getElementById('logout-btn').addEventListener('click', () => auth.signOut());

// Стан сесії
auth.onAuthStateChanged(async (user) => {
  if (user) {
    currentUser = user;
    const doc = await db.collection('users').doc(user.uid).get();
    userData = doc.data();

    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('app-container').style.display = 'flex';
    document.getElementById('display-user-name').innerText = userData ? userData.fio : user.email;

    if (userData && userData.role === 'admin') {
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
});

// Навігація
document.querySelectorAll('.nav-btn[data-tab]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));

    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

// Перемикач тем
document.getElementById('theme-toggle-btn').addEventListener('click', () => {
  document.body.classList.toggle('dark-theme');
});

// Обчислення 2-тижневого розкладу (7 вересня 2026 = Початок Тижня 2)
function getCurrentWeekType() {
  const startDate = new Date(2026, 8, 7); // 7 Вересня 2026
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

// Відображення розкладу
async function renderSchedule() {
  const grid = document.getElementById('schedule-grid');
  grid.innerHTML = '';
  
  const dates = getDatesForWeek(selectedWeekView);
  const dayNames = ['Понеділок', 'Вівторок', 'Середа', 'Четвер', "П'ятниця", 'Субота'];

  const adminSnap = await db.collection('global_schedule').where('week', '==', selectedWeekView).get();
  const adminClasses = adminSnap.docs.map(doc => doc.data());

  const userSnap = await db.collection('users').doc(currentUser.uid).collection('custom_classes').where('week', '==', selectedWeekView).get();
  const userClasses = userSnap.docs.map(doc => doc.data());

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

function switchWeekView(week) {
  selectedWeekView = week;
  document.getElementById('btn-week-1').classList.toggle('active', week === 1);
  document.getElementById('btn-week-2').classList.toggle('active', week === 2);
  renderSchedule();
}

// Вибіркова дисципліна
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

  await db.collection('users').doc(currentUser.uid).collection('custom_classes').add(classObj);
  alert('Предмет додано!');
  e.target.reset();
  renderSchedule();
});

// Статус занять на сьогодні
async function checkTodaySchedule() {
  const currentWeek = getCurrentWeekType();
  const today = new Date();
  const dayOfWeek = today.getDay();
  
  document.getElementById('current-week-indicator').innerText = `Тиждень ${currentWeek}`;

  if (dayOfWeek === 0) {
    document.getElementById('schedule-alert').innerText = 'Сьогодні неділя. Пар немає!';
    return;
  }

  const adminSnap = await db.collection('global_schedule').where('week', '==', currentWeek).where('day', '==', dayOfWeek).get();
  const userSnap = await db.collection('users').doc(currentUser.uid).collection('custom_classes').where('week', '==', currentWeek).where('day', '==', dayOfWeek).get();

  const todayClasses = [...adminSnap.docs.map(d=>d.data()), ...userSnap.docs.map(d=>d.data())];
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

// Завдання
document.getElementById('create-task-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('task-title').value;
  const deadline = document.getElementById('task-deadline').value;

  await db.collection('users').doc(currentUser.uid).collection('tasks').add({
    title,
    deadline,
    completed: false
  });

  e.target.reset();
  loadTasks();
});

async function loadTasks() {
  const snap = await db.collection('users').doc(currentUser.uid).collection('tasks').get();
  const tasksList = document.getElementById('all-tasks-list');
  const homeTasksList = document.getElementById('home-tasks-list');

  tasksList.innerHTML = '';
  homeTasksList.innerHTML = '';

  snap.docs.forEach(doc => {
    const task = doc.data();
    const id = doc.id;

    if (!task.completed) {
      homeTasksList.innerHTML += `<div class="class-item">📌 <strong>${task.title}</strong> (Термін: ${new Date(task.deadline).toLocaleString()})</div>`;
    }

    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;
    li.innerHTML = `
      <span>${task.title} — <small>${new Date(task.deadline).toLocaleString()}</small></span>
      <button onclick="toggleTask('${id}', ${!task.completed})">${task.completed ? 'Викреслено' : 'Завершити'}</button>
    `;
    tasksList.appendChild(li);
  });
}

async function toggleTask(id, status) {
  await db.collection('users').doc(currentUser.uid).collection('tasks').doc(id).update({ completed: status });
  loadTasks();
}

// Налаштування
document.getElementById('settings-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const group = document.getElementById('setting-group').value;
  const dob = document.getElementById('setting-dob').value;
  const newPass = document.getElementById('setting-password').value;

  const updateData = {};
  if (group) updateData.group = group;
  if (dob) updateData.dob = dob;
  if (newPass) {
    updateData.password = newPass;
    await currentUser.updatePassword(newPass);
  }

  await db.collection('users').doc(currentUser.uid).update(updateData);
  alert('Налаштування збережено!');
});

// Адмін функції
async function loadAdminUsers() {
  const snap = await db.collection('users').get();
  const tbody = document.getElementById('admin-users-table');
  tbody.innerHTML = '';

  snap.docs.forEach(doc => {
    const u = doc.data();
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

  await db.collection('global_schedule').add(classObj);
  alert('Додано у загальний розклад!');
  e.target.reset();
  renderSchedule();
});

document.addEventListener('DOMContentLoaded', updateSeasonAnimation);
