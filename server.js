/* LOCAL STORAGE ENGINE */
const DB = {
    getUsers: () => JSON.parse(localStorage.getItem('app_users')) || [],
    setUsers: (users) => localStorage.setItem('app_users', JSON.stringify(users)),
    getCurrentUser: () => JSON.parse(localStorage.getItem('app_current_user')),
    setCurrentUser: (user) => localStorage.setItem('app_current_user', JSON.stringify(user))
};

// Дефолтний розклад з наданих розкладів (I та II тижні)
const defaultSchedule = {
    week1: {
        0: [ // Понеділок
            { name: "Фахова англійська мова (Практ.)", time: "15:20 - 16:55" },
            { name: "Фахова англійська мова (Практ.)", time: "17:10 - 18:45" }
        ],
        1: [ // Вівторок
            { name: "Системне програмування (Лекц.)", time: "15:20 - 16:55" }
        ],
        2: [ // Середа
            { name: "Основи комп'ютерних мереж (Лаб.)", time: "15:20 - 16:55" }
        ],
        3: [ // Четвер
            { name: "Системне програмування (Лаб.)", time: "15:20 - 16:55" }
        ],
        4: [ // П'ятниця
            { name: "Комп'ютерна схемотехніка (Лаб.)", time: "15:20 - 16:55" }
        ],
        5: [] // Субота
    },
    week2: {
        0: [ // Понеділок
            { name: "Комп'ютерна схемотехніка (Лекц.)", time: "15:20 - 16:55" }
        ],
        1: [ // Вівторок
            { name: "Архітектура комп'ютерів (Лекц.)", time: "15:20 - 16:55" },
            { name: "Фахова англійська мова (Практ.)", time: "17:10 - 18:45" }
        ],
        2: [ // Середа
            { name: "Основи комп'ютерних мереж (Лекц.)", time: "15:20 - 16:55" }
        ],
        3: [ // Четвер
            { name: "Архітектура комп'ютерів (Лаб.)", time: "15:20 - 16:55" },
            { name: "Архітектура комп'ютерів (Лаб.)", time: "17:10 - 18:45" }
        ],
        4: [ // П'ятниця
            { name: "Комп'ютерна схемотехніка (Лаб.)", time: "15:20 - 16:55" },
            { name: "Фахова англійська мова (Практ.)", time: "17:10 - 18:45" }
        ],
        5: [] // Субота
    }
};

// Ініціалізація першого користувача (Admin) з встановленим розкладом
if (DB.getUsers().length === 0) {
    DB.setUsers([{ 
        username: 'admin', 
        password: '123', 
        secret: 'admin', 
        isAdmin: true, 
        blocked: false, 
        tasks: [], 
        schedule: defaultSchedule
    }]);
}

let currentUser = DB.getCurrentUser();
const days = ["Понеділок", "Вівторок", "Середа", "Четвер", "П'ятниця", "Субота"];

/* АВТОМАТИЧНЕ ВИЗНАЧЕННЯ ТИЖНЯ ЗГІДНО З КАЛЕНДАРЕМ ОСІННЬОГО СЕМЕСТРУ */
function getCurrentAcademicWeek(date = new Date()) {
    // Таблиця робочих субот та зміщення тижнів згідно з графіком семестру
    // Початок семестру: 31.08 (I тиждень)
    const startDate = new Date(2026, 7, 31); // 31 серпня 2026
    const diffTime = date - startDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'week1';
    
    const weekNum = Math.floor(diffDays / 7) + 1;
    return (weekNum % 2 === 1) ? 'week1' : 'week2';
}

/* AUTH LOGIC */
function switchAuthTab(type) {
    document.getElementById('formLogin').style.display = type === 'login' ? 'block' : 'none';
    document.getElementById('formRegister').style.display = type === 'register' ? 'block' : 'none';
    document.getElementById('formForgot').style.display = type === 'forgot' ? 'block' : 'none';
    document.getElementById('tabLogin').classList.toggle('active', type === 'login');
    document.getElementById('tabRegister').classList.toggle('active', type === 'register');
}

function handleRegister() {
    const username = document.getElementById('regUser').value.trim();
    const password = document.getElementById('regPass').value;
    const secret = document.getElementById('regSecret').value.trim();

    if (!username || !password || !secret) return alert("Заповніть усі поля!");

    let users = DB.getUsers();
    if (users.find(u => u.username === username)) return alert("Логін зайнятий!");

    users.push({ 
        username, 
        password, 
        secret, 
        isAdmin: false, 
        blocked: false, 
        tasks: [], 
        schedule: JSON.parse(JSON.stringify(defaultSchedule)) 
    });
    DB.setUsers(users);
    alert("Реєстрація успішна!");
    switchAuthTab('login');
}

function handleLogin() {
    const username = document.getElementById('loginUser').value.trim();
    const password = document.getElementById('loginPass').value;

    let users = DB.getUsers();
    let user = users.find(u => u.username === username && u.password === password);

    if (!user) return alert("Невірний логін або пароль!");
    if (user.blocked) return alert("Акаунт заблоковано!");

    DB.setCurrentUser(user);
    currentUser = user;
    initApp();
}

function handleResetPassword() {
    const username = document.getElementById('forgotUser').value.trim();
    const secret = document.getElementById('forgotSecret').value.trim();
    const newPassword = document.getElementById('forgotNewPass').value;

    let users = DB.getUsers();
    let user = users.find(u => u.username === username && u.secret === secret);
    if (!user) return alert("Невірні дані!");

    user.password = newPassword;
    DB.setUsers(users);
    alert("Пароль змінено!");
    switchAuthTab('login');
}

function handleLogout() {
    localStorage.removeItem('app_current_user');
    currentUser = null;
    document.getElementById('authOverlay').style.display = 'flex';
}

function saveUserData() {
    let users = DB.getUsers();
    let idx = users.findIndex(u => u.username === currentUser.username);
    if (idx !== -1) {
        users[idx] = currentUser;
        DB.setUsers(users);
        DB.setCurrentUser(currentUser);
    }
}

function initApp() {
    if (!currentUser) {
        document.getElementById('authOverlay').style.display = 'flex';
        return;
    }
    document.getElementById('authOverlay').style.display = 'none';
    document.getElementById('currentUserLabel').textContent = currentUser.username + (currentUser.isAdmin ? ' (Admin)' : '');

    if (currentUser.isAdmin) {
        document.getElementById('adminSidebarBtn').style.display = 'flex';
        document.getElementById('adminAccessCard').style.display = 'block';
        loadAdminTable();
    } else {
        document.getElementById('adminSidebarBtn').style.display = 'none';
        document.getElementById('adminAccessCard').style.display = 'none';
    }

    renderHomeDashboard();
    renderTasks();
    renderSchedule();
}

/* DASHBOARD LOGIC (ГОЛОВНА СТОРІНКА ТА ЛОГІКА СУБОТИ) */
function renderHomeDashboard() {
    // 1. Завдання на головній
    const homeTasksContainer = document.getElementById('homeTasksContainer');
    const tasks = currentUser.tasks || [];
    if (!tasks.length) {
        homeTasksContainer.innerHTML = '<p style="font-size:12px; color:var(--muted);">Немає активних завдань</p>';
    } else {
        homeTasksContainer.innerHTML = tasks.map(t => `
            <div class="task-card-item ${t.done ? 'completed':''}">
                <div style="font-weight:bold;">${t.title}</div>
                <div class="task-dates">
                    <span>🟢 Старт: ${t.start ? formatDate(t.start) : 'Не вказано'}</span>
                    <span>🔴 Фініш: ${t.end ? formatDate(t.end) : 'Не вказано'}</span>
                </div>
            </div>
        `).join('');
    }

    // 2. Логіка виводу розкладу на сьогодні / завтра (з урахуванням суботи та часу 12:00)
    const todayContainer = document.getElementById('todayScheduleContainer');
    const now = new Date();
    const currentDay = now.getDay(); // 0 - Неділя, 1 - Пн, ..., 5 - Пт, 6 - Сб
    const currentHour = now.getHours();

    let targetDayIdx = currentDay - 1; 
    let displayTitle = "";
    let weekKey = getCurrentAcademicWeek(now);

    // П'ятниця (day 5) після 12:00 -> показуємо анонс на Суботу
    if (currentDay === 5 && currentHour >= 12) {
        targetDayIdx = 5; // Субота
        displayTitle = "Заняття на завтра (Субота):";
    } 
    // Субота (day 6) до 12:00 -> показуємо розклад на Суботу
    else if (currentDay === 6 && currentHour < 12) {
        targetDayIdx = 5; // Субота
        displayTitle = "Заняття на сьогодні (Субота):";
    } 
    // Звичайний режим
    else {
        if (targetDayIdx < 0 || targetDayIdx > 5) targetDayIdx = 0; // Неділя або поза межами -> Понеділок
        displayTitle = `Заняття на ${days[targetDayIdx]}:`;
    }

    document.getElementById('todayScheduleTitle').textContent = displayTitle;

    const weekSchedule = currentUser.schedule ? currentUser.schedule[weekKey] : {};
    const dayLessons = weekSchedule ? (weekSchedule[targetDayIdx] || []) : [];

    if (!dayLessons.length) {
        todayContainer.innerHTML = '<p style="font-size:12px; color:var(--muted);">Пар немає 🎉</p>';
    } else {
        todayContainer.innerHTML = dayLessons.map(l => `
            <div class="lesson-card">
                <div style="font-size:10px; color:var(--primary); font-weight:700;">⏰ ${l.time}</div>
                <div style="font-weight:700; font-size:13px; margin-top:2px;">${l.name}</div>
            </div>
        `).join('');
    }
}

function formatDate(dtStr) {
    if(!dtStr) return '';
    const d = new Date(dtStr);
    return d.toLocaleString('uk-UA', { month:'numeric', day:'numeric', hour:'2-digit', minute:'2-digit' });
}

/* TASKS ENGINE */
function addNewTask() {
    const title = document.getElementById('newTaskTitle').value.trim();
    const start = document.getElementById('newTaskStart').value;
    const end = document.getElementById('newTaskEnd').value;

    if (!title) return alert("Введіть назву завдання!");

    if (!currentUser.tasks) currentUser.tasks = [];
    currentUser.tasks.push({ title, start, end, done: false });
    
    saveUserData();
    document.getElementById('newTaskTitle').value = '';
    document.getElementById('newTaskStart').value = '';
    document.getElementById('newTaskEnd').value = '';
    
    renderTasks();
    renderHomeDashboard();
}

function renderTasks() {
    const container = document.getElementById('tasksContainer');
    const tasks = currentUser.tasks || [];

    if (!tasks.length) {
        container.innerHTML = '<p style="font-size:12px; color:var(--muted); text-align:center;">Список завдань порожній</p>';
        return;
    }

    container.innerHTML = tasks.map((t, i) => `
        <div class="task-card-item ${t.done ? 'completed':''}">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <input type="checkbox" ${t.done ? 'checked':''} onchange="toggleTask(${i})">
                    <span style="font-weight:700; font-size:14px;">${t.title}</span>
                </div>
                <button style="border:0; background:none; color:#ef4444; cursor:pointer;" onclick="deleteTask(${i})">Видалити</button>
            </div>
            <div class="task-dates">
                <span>🟢 Початок: ${t.start ? formatDate(t.start) : '—'}</span>
                <span>🔴 Кінець: ${t.end ? formatDate(t.end) : '—'}</span>
            </div>
        </div>
    `).join('');
}

function toggleTask(i) {
    currentUser.tasks[i].done = !currentUser.tasks[i].done;
    saveUserData();
    renderTasks();
    renderHomeDashboard();
}

function deleteTask(i) {
    currentUser.tasks.splice(i, 1);
    saveUserData();
    renderTasks();
    renderHomeDashboard();
}

/* SCHEDULE ENGINE */
let currentWeek = getCurrentAcademicWeek();

function switchWeek(w) {
    currentWeek = w;
    document.getElementById('btnW1').classList.toggle('active', w === 'week1');
    document.getElementById('btnW2').classList.toggle('active', w === 'week2');
    renderSchedule();
}

function renderSchedule() {
    const container = document.getElementById('scheduleColumnsContainer');
    if (!currentUser.schedule) currentUser.schedule = defaultSchedule;
    const weekData = currentUser.schedule[currentWeek] || {};

    container.innerHTML = days.map((d, i) => {
        const list = weekData[i] || [];
        return `
            <div class="column-day">
                <div class="column-header">
                    <span>${d}</span>
                    <button class="btn-primary btn-small" onclick="addLesson(${i})">+</button>
                </div>
                <div>${list.map((l, li) => `
                    <div class="lesson-card">
                        <div style="font-size:10px; color:var(--muted); font-weight:700;">⏰ ${l.time}</div>
                        <div style="font-weight:700;">${l.name}</div>
                        <button style="border:0; background:none; color:red; font-size:10px; cursor:pointer; margin-top:4px;" onclick="deleteLesson(${i}, ${li})">Видалити</button>
                    </div>
                `).join('') || '<p style="font-size:11px; color:var(--muted); text-align:center;">Немає пар</p>'}</div>
            </div>`;
    }).join('');
}

function addLesson(dayIdx) {
    const name = prompt("Назва предмета:");
    if (!name) return;
    const time = prompt("Час занять:", "15:20 - 16:55") || "15:20 - 16:55";

    if (!currentUser.schedule[currentWeek]) currentUser.schedule[currentWeek] = {};
    if (!currentUser.schedule[currentWeek][dayIdx]) currentUser.schedule[currentWeek][dayIdx] = [];

    currentUser.schedule[currentWeek][dayIdx].push({ name, time });
    saveUserData();
    renderSchedule();
    renderHomeDashboard();
}

function deleteLesson(dayIdx, lessonIdx) {
    currentUser.schedule[currentWeek][dayIdx].splice(lessonIdx, 1);
    saveUserData();
    renderSchedule();
    renderHomeDashboard();
}

/* ADMIN PANEL ENGINE & EDITING USER SCHEDULES */
let editingUserUsername = null;

function loadAdminTable() {
    const tbody = document.getElementById('adminUsersTable');
    const users = DB.getUsers();
    tbody.innerHTML = users.map(u => `
        <tr>
            <td><b>${u.username}</b></td>
            <td>${u.isAdmin ? '<span style="color:var(--primary); font-weight:bold;">Admin</span>' : 'Student'}</td>
            <td><span style="color:${u.blocked ? 'red':'green'}">${u.blocked ? 'Заблоковано':'Активний'}</span></td>
            <td>
                <button class="btn-primary btn-small" onclick="openAdminScheduleModal('${u.username}')">📅 Редагувати розклад</button>
            </td>
            <td>
                ${!u.isAdmin ? `<button class="btn-primary btn-small ${u.blocked ? '':'btn-danger'}" onclick="toggleBlock('${u.username}')">${u.blocked ? 'Розблокувати':'Заблокувати'}</button>` : ''}
            </td>
        </tr>
    `).join('');
}

function toggleBlock(username) {
    let users = DB.getUsers();
    let u = users.find(x => x.username === username);
    if (u) {
        u.blocked = !u.blocked;
        DB.setUsers(users);
        loadAdminTable();
    }
}

function openAdminScheduleModal(username) {
    editingUserUsername = username;
    document.getElementById('adminModalTitle').textContent = `Розклад користувача: ${username}`;
    document.getElementById('adminScheduleModal').style.display = 'flex';
    renderAdminModalSchedule();
}

function closeAdminModal() {
    document.getElementById('adminScheduleModal').style.display = 'none';
}

function renderAdminModalSchedule() {
    const users = DB.getUsers();
    const u = users.find(x => x.username === editingUserUsername);
    if (!u) return;

    const week = document.getElementById('adminModalWeek').value;
    const day = document.getElementById('adminModalDay').value;

    const listContainer = document.getElementById('adminModalLessonsList');
    const lessons = (u.schedule && u.schedule[week] && u.schedule[week][day]) ? u.schedule[week][day] : [];

    if (!lessons.length) {
        listContainer.innerHTML = '<p style="font-size:12px; color:var(--muted); text-align:center;">Немає пар на цей день</p>';
        return;
    }

    listContainer.innerHTML = lessons.map((l, i) => `
        <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg); padding:8px; border-radius:6px; margin-bottom:5px; font-size:12px;">
            <div>
                <strong>${l.time}</strong> — ${l.name}
            </div>
            <button style="border:0; background:none; color:red; cursor:pointer;" onclick="adminDeleteLesson(${i})">✕</button>
        </div>
    `).join('');
}

function adminSaveLesson() {
    const name = document.getElementById('adminNewLessonName').value.trim();
    const time = document.getElementById('adminNewLessonTime').value.trim();

    if (!name || !time) return alert("Введіть назву та час!");

    let users = DB.getUsers();
    let u = users.find(x => x.username === editingUserUsername);
    if (!u) return;

    const week = document.getElementById('adminModalWeek').value;
    const day = document.getElementById('adminModalDay').value;

    if (!u.schedule) u.schedule = { week1: {}, week2: {} };
    if (!u.schedule[week]) u.schedule[week] = {};
    if (!u.schedule[week][day]) u.schedule[week][day] = [];

    u.schedule[week][day].push({ name, time });
    DB.setUsers(users);

    if (currentUser && currentUser.username === u.username) {
        currentUser = u;
        DB.setCurrentUser(u);
        renderSchedule();
        renderHomeDashboard();
    }

    document.getElementById('adminNewLessonName').value = '';
    renderAdminModalSchedule();
}

function adminDeleteLesson(index) {
    let users = DB.getUsers();
    let u = users.find(x => x.username === editingUserUsername);
    if (!u) return;

    const week = document.getElementById('adminModalWeek').value;
    const day = document.getElementById('adminModalDay').value;

    u.schedule[week][day].splice(index, 1);
    DB.setUsers(users);

    if (currentUser && currentUser.username === u.username) {
        currentUser = u;
        DB.setCurrentUser(u);
        renderSchedule();
        renderHomeDashboard();
    }

    renderAdminModalSchedule();
}

/* NAVIGATION & UI */
function navigateTo(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item, .mobile-nav-item').forEach(b => b.classList.remove('active'));

    const targetPage = document.getElementById(pageId);
    if (targetPage) targetPage.classList.add('active');

    document.querySelectorAll(`[data-page="${pageId}"]`).forEach(b => b.classList.add('active'));
}

document.querySelectorAll('[data-page]').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.getAttribute('data-page')));
});

function toggleDarkMode() {
    document.body.classList.toggle('dark');
}

function openTelegramApp() {
    window.open('https://t.me', '_blank');
}

function updateSecretWord() {
    const val = document.getElementById('updateSecretInput').value.trim();
    if (!val) return alert("Введіть нове секретне слово");
    currentUser.secret = val;
    saveUserData();
    alert("Секретне слово оновлено!");
    document.getElementById('updateSecretInput').value = '';
}

// Запуск програми при завантаженні
window.addEventListener('DOMContentLoaded', () => {
    const now = new Date();
    document.getElementById('currentDateStr').textContent = now.toLocaleDateString('uk-UA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    initApp();
});
