@@ -1,4 +1,3 @@
// База користувачів із наданого списку (плюс локально зареєстровані)
const INITIAL_USERS = [
  { id: "1", fio: "Білецький Сергій Євгенійович", email: "Bileckiy.kai.edu.ua", password: "Bileckiy-01", role: "student" },
  { id: "2", fio: "Зайчук Назарій Вікторович", email: "Zaec.kai.edu.ua", password: "Zaec-02", role: "student" },
@@ -18,7 +17,6 @@ const INITIAL_USERS = [
  { id: "admin", fio: "Адміністратор", email: "admin@kai.edu.ua", password: "admin", role: "admin" }
];

// Ініціалізація баз даних в localStorage
if (!localStorage.getItem('usersDB')) {
  localStorage.setItem('usersDB', JSON.stringify(INITIAL_USERS));
}
@@ -27,7 +25,6 @@ let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let isSignUpMode = false;
let selectedWeekView = 2;

// Картинки сезонів (.png)
const SEASON_IMAGES = {
  autumn: 'osen.png',
  winter: 'zima.png',
@@ -52,7 +49,6 @@ function updateSeasonImage() {
  bgElement.style.backgroundImage = `url('${imgSrc}')`;
}

// Перемикання між формою входу та реєстрації
const toggleAuthBtn = document.getElementById('toggle-auth-btn');
if (toggleAuthBtn) {
  toggleAuthBtn.addEventListener('click', (e) => {
@@ -66,7 +62,6 @@ if (toggleAuthBtn) {
  });
}

// Обробка авторизації
const authForm = document.getElementById('auth-form');
if (authForm) {
  authForm.addEventListener('submit', async (e) => {
@@ -130,7 +125,6 @@ if (authForm) {
  });
}

// Вихід з акаунту
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
@@ -166,7 +160,6 @@ function checkAuthState() {
  }
}

// Навігація вкладок
document.querySelectorAll('.nav-btn[data-tab]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
@@ -219,7 +212,6 @@ function getDatesForWeek(weekType) {
function initDashboard() {
  renderSchedule();
  loadTasks();
  checkTodaySchedule();
}

async function renderSchedule() {
@@ -312,50 +304,6 @@ if (addSubjectForm) {
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
@@ -390,26 +338,18 @@ async function loadTasks() {
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
  if (tasksList) {
    tasksList.innerHTML = '';
    tasks.forEach(task => {
      const li = document.createElement('li');
      li.className = `task-item ${task.completed ? 'completed' : ''}`;
      li.innerHTML = `
        <span>${task.title} — <small>${new Date(task.deadline).toLocaleString()}</small></span>
        <button onclick="toggleTask('${task.id}')">${task.completed ? 'Викреслено' : 'Завершити'}</button>
      `;
      tasksList.appendChild(li);
    }
  });
    });
  }
}

window.toggleTask = async function(taskId) {
@@ -497,7 +437,6 @@ if (adminScheduleForm) {
  });
}

// Початковий запуск
document.addEventListener('DOMContentLoaded', () => {
  checkAuthState();
  updateSeasonImage();
