// Повний список з 15 користувачів та їх унікальними кодами
const defaultUsers = [
    { id: 1, name: "Зайчук Назарій Вікторович", group: "Б-Ф7-25-1-КС", code: "DU-8921", blocked: false },
    { id: 2, name: "Ігнатенко Євген Олександрович", group: "Б-Ф7-25-1-КС", code: "DU-3412", blocked: false },
    { id: 3, name: "Коваленко Олександр Дмитрович", group: "Б-Ф7-25-1-КС", code: "DU-5519", blocked: false },
    { id: 4, name: "Крант Єлизавета Вячеславівна", group: "Б-Ф7-25-1-КС", code: "DU-7710", blocked: false },
    { id: 5, name: "Мазуренко Ярослав Вадимович", group: "Б-Ф7-25-1-КС", code: "DU-1092", blocked: false },
    { id: 6, name: "Молодан Богдан Вікторович", group: "Б-Ф7-25-1-КС", code: "DU-6631", blocked: false },
    { id: 7, name: "Пелих Михайло Євгенович", group: "Б-Ф7-25-1-КС", code: "DU-4418", blocked: false },
    { id: 8, name: "Рябчун Ярослав Олегович", group: "Б-Ф7-25-1-КС", code: "DU-2201", blocked: false },
    { id: 9, name: "Фесенко Олексій Михайлович", group: "Б-Ф7-25-1-КС", code: "DU-9083", blocked: false },
    { id: 10, name: "Сидоренко Анна Сергіївна", group: "Б-Ф7-25-1-КС", code: "DU-1145", blocked: false },
    { id: 11, name: "Мельник Дмитро Ігорович", group: "Б-Ф7-25-1-КС", code: "DU-6732", blocked: false },
    { id: 12, name: "Шевченко Максим Олегович", group: "Б-Ф7-25-1-КС", code: "DU-8812", blocked: false },
    { id: 13, name: "Бондаренко Олена Василівна", group: "Б-Ф7-25-1-КС", code: "DU-3091", blocked: false },
    { id: 14, name: "Ткаченко Артем Юрійович", group: "Б-Ф7-25-1-КС", code: "DU-5411", blocked: false },
    { id: 15, name: "Кравченко Роман Романович", group: "Б-Ф7-25-1-КС", code: "DU-4120", blocked: false }
];

let systemUsers = JSON.parse(localStorage.getItem('du_users')) || defaultUsers;
let currentActiveWeek = 'week1';
let currentCardSide = null;

// Базовий розклад
let appSchedule = JSON.parse(localStorage.getItem('du_schedule')) || {
    week1: {
        "Понеділок": [{ id: 1, subject: "Програмування", start: "09:50", end: "11:20" }],
        "Вівторок": [{ id: 2, subject: "Вища математика", start: "11:40", end: "13:10" }]
    },
    week2: {
        "Понеділок": [{ id: 3, subject: "Комп'ютерна електроніка", start: "14:20", end: "15:50" }]
    }
};

let appBooks = JSON.parse(localStorage.getItem('du_books')) || [
    { title: "Алгоритми та структури даних", link: "https://google.com" }
];

document.addEventListener('DOMContentLoaded', () => {
    initAuthDropdown();
    checkUserSession();

    // Форма авторізації
    document.getElementById('authForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const selVal = document.getElementById('userSelect').value;
        const pass = document.getElementById('authPass').value;

        if (selVal === 'admin') {
            if (pass === 'admin') {
                saveSession({ name: "Адміністратор", group: "Керування", code: "ADMIN-ROOT", isAdmin: true });
            } else {
                alert("Невірний пароль адміна!");
            }
            return;
        }

        const user = systemUsers.find(u => u.id == selVal);
        if (user) {
            if (user.blocked) {
                alert("Цього користувача заблоковано адміністратором!");
                return;
            }
            saveSession({ ...user, isAdmin: false });
        }
    });

    // Вихід
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('du_session');
        location.reload();
    });

    // Адмін панель відкриття
    document.getElementById('btnAdminPanel').addEventListener('click', () => {
        renderAdminUsers();
        openModal('adminModal');
    });

    // Адмін: додати розклад
    document.getElementById('addScheduleForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const w = document.getElementById('schWeek').value;
        const d = document.getElementById('schDay').value;
        const subject = document.getElementById('schSubject').value;
        const start = document.getElementById('schStart').value;
        const end = document.getElementById('schEnd').value;

        if (!appSchedule[w][d]) appSchedule[w][d] = [];
        appSchedule[w][d].push({ id: Date.now(), subject, start, end });

        localStorage.setItem('du_schedule', JSON.stringify(appSchedule));
        renderSchedules();
        closeModal('adminModal');
        alert("Пару додано!");
    });

    // Адмін: додати книгу
    document.getElementById('addBookForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('bookTitle').value;
        const link = document.getElementById('bookLink').value;

        appBooks.push({ title, link });
        localStorage.setItem('du_books', JSON.stringify(appBooks));
        renderBooks();
        closeModal('adminModal');
        alert("Книгу додано!");
    });

    // Студент: додати завдання
    document.getElementById('addTaskForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const text = document.getElementById('taskText').value;
        const date = document.getElementById('taskDate').value;
        const currentUser = getSession();

        let tasks = JSON.parse(localStorage.getItem(`tasks_${currentUser.code}`)) || [];
        tasks.push({ id: Date.now(), text, date });
        localStorage.setItem(`tasks_${currentUser.code}`, JSON.stringify(tasks));

        renderTasks();
        closeModal('taskModal');
    });

    // Завантаження фото студентського
    document.getElementById('ticketFileInput').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const user = getSession();
            localStorage.setItem(`ticket_${currentCardSide}_${user.code}`, evt.target.result);
            loadTicketPhotos();
        };
        reader.readAsDataURL(file);
    });
});

// Допоміжні функції авторизації та сесій
function initAuthDropdown() {
    const select = document.getElementById('userSelect');
    select.innerHTML = `<option value="">-- Оберіть зі списку --</option>`;
    systemUsers.forEach(u => {
        select.innerHTML += `<option value="${u.id}">${u.name} (${u.code})</option>`;
    });
    select.innerHTML += `<option value="admin">-- Адміністратор --</option>`;
}

function saveSession(user) {
    localStorage.setItem('du_session', JSON.stringify(user));
    location.reload();
}

function getSession() {
    return JSON.parse(localStorage.getItem('du_session'));
}

function checkUserSession() {
    const user = getSession();
    if (!user) {
        openModal('authModal');
        return;
    }

    closeModal('authModal');
    document.getElementById('displayUserName').textContent = `Вітаємо, ${user.name.split(' ')[0]}! 👋`;
    document.getElementById('displayUserGroup').textContent = `Група: ${user.group}`;
    document.getElementById('myUniqueCode').textContent = `Код: ${user.code}`;

    document.getElementById('profName').textContent = user.name;
    document.getElementById('profGroup').textContent = user.group;
    document.getElementById('profCode').textContent = `Ваш унікальний код: ${user.code}`;

    // Ініціали в аватар
    const initials = user.name.split(' ').map(n => n[0]).slice(0, 2).join('');
    document.getElementById('userAvatar').textContent = initials;

    if (user.isAdmin) {
        document.getElementById('btnAdminPanel').style.display = 'block';
    }

    loadTicketPhotos();
    renderSchedules();
    renderTasks();
    renderBooks();
}

// Перемикання вкладок нижнього меню
function switchTab(tabId, btn) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.bottom-nav .nav-item').forEach(b => b.classList.remove('active'));

    document.getElementById(tabId).classList.add('active');
    if (btn) btn.classList.add('active');
}

// Вибір тижня у розкладі
function selectWeek(week) {
    currentActiveWeek = week;
    renderSchedules();
}

// Рендеринг розкладу
function renderSchedules() {
    const todayCont = document.getElementById('todayScheduleContainer');
    const fullCont = document.getElementById('fullScheduleContainer');

    todayCont.innerHTML = '';
    fullCont.innerHTML = '';

    const days = ["Неділя", "Понеділок", "Вівторок", "Середа", "Четвер", "П'ятниця", "Субота"];
    const todayName = days[new Date().getDay()] === "Неділя" ? "Понеділок" : days[new Date().getDay()];

    const todayLessons = appSchedule[currentActiveWeek][todayName] || [];

    if (todayLessons.length === 0) {
        todayCont.innerHTML = `<div style="font-size:12px; color:var(--text-muted); padding:10px;">Пар немає на сьогодні</div>`;
    } else {
        todayLessons.forEach(l => {
            todayCont.innerHTML += `
                <div class="schedule-card">
                    <div class="schedule-time">${l.start}<br>${l.end}</div>
                    <div class="schedule-info">
                        <h5>${l.subject}</h5>
                        <p>${todayName}</p>
                    </div>
                </div>`;
        });
    }

    // Повний розклад за тижнем
    for (const [day, lessons] of Object.entries(appSchedule[currentActiveWeek])) {
        fullCont.innerHTML += `<div style="font-weight:700; font-size:13px; margin:10px 0 5px 0; color:var(--primary);">${day}</div>`;
        if (lessons.length === 0) {
            fullCont.innerHTML += `<div style="font-size:11px; color:var(--text-muted);">Вихідний</div>`;
        } else {
            lessons.forEach(l => {
                fullCont.innerHTML += `
                    <div class="schedule-card">
                        <div class="schedule-time">${l.start}<br>${l.end}</div>
                        <div class="schedule-info">
                            <h5>${l.subject}</h5>
                        </div>
                    </div>`;
            });
        }
    }
}

// Студентські завдання
function renderTasks() {
    const user = getSession();
    if (!user) return;
    const tasks = JSON.parse(localStorage.getItem(`tasks_${user.code}`)) || [];
    const cont = document.getElementById('tasksContainer');
    cont.innerHTML = '';

    if (tasks.length === 0) {
        cont.innerHTML = `<div style="font-size:12px; color:var(--text-muted);">Немає доданих завдань</div>`;
        return;
    }

    tasks.forEach(t => {
        cont.innerHTML += `
            <div class="schedule-card">
                <div>
                    <h5>${t.text}</h5>
                    <p>Дедлайн: ${t.date}</p>
                </div>
            </div>`;
    });
}

// Література
function renderBooks() {
    const cont = document.getElementById('libraryContainer');
    cont.innerHTML = '';
    appBooks.forEach(b => {
        cont.innerHTML += `
            <div class="schedule-card">
                <div>
                    <h5>${b.title}</h5>
                    <a href="${b.link}" target="_blank" style="font-size:11px; color:var(--primary);">Читати / Завантажити</a>
                </div>
            </div>`;
    });
}

// Студентський квиток (Завантаження)
function triggerCardUpload(side) {
    currentCardSide = side;
    document.getElementById('ticketFileInput').click();
}

function loadTicketPhotos() {
    const user = getSession();
    if (!user) return;

    const front = localStorage.getItem(`ticket_front_${user.code}`);
    const back = localStorage.getItem(`ticket_back_${user.code}`);

    if (front) document.getElementById('slotFront').innerHTML = `<img src="${front}">`;
    if (back) document.getElementById('slotBack').innerHTML = `<img src="${back}">`;
}

// Управління Адміна (Блокування / Перегляд кодів)
function renderAdminUsers() {
    const cont = document.getElementById('adminUsersList');
    cont.innerHTML = '';
    systemUsers.forEach(u => {
        cont.innerHTML += `
            <div class="user-row">
                <div>
                    <strong>${u.name}</strong><br>
                    Код: <span class="user-code-tag">${u.code}</span>
                </div>
                <div>
                    <button class="block-btn" onclick="toggleBlockUser(${u.id})">${u.blocked ? 'Unblock' : 'Block'}</button>
                </div>
            </div>`;
    });
}

function toggleBlockUser(id) {
    systemUsers = systemUsers.map(u => u.id === id ? { ...u, blocked: !u.blocked } : u);
    localStorage.setItem('du_users', JSON.stringify(systemUsers));
    renderAdminUsers();
}

// Модальні вікна загальні
function openModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }
