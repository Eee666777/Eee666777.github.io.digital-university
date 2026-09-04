// Автоматичне очищення старого localStorage для оновлення паролів та списку
if (!localStorage.getItem('du_v2_updated')) {
    localStorage.removeItem('du_users');
    localStorage.setItem('du_v2_updated', 'true');
}

// Повний список студентів з паролями за першою літерою прізвища + 1234
const defaultUsers = [
    { id: 1, name: "Зайчук Назарій Вікторович", group: "Б-Ф7-25-1-КС", code: "DU-8921", pass: "Z1234", blocked: false },
    { id: 2, name: "Ігнатенко Євген Олександрович", group: "Б-Ф7-25-1-КС", code: "DU-3412", pass: "I1234", blocked: false },
    { id: 3, name: "Коваленко Олександр Дмитрович", group: "Б-Ф7-25-1-КС", code: "DU-5519", pass: "K1234", blocked: false },
    { id: 4, name: "Крант Єлизавета Вячеславівна", group: "Б-Ф7-25-1-КС", code: "DU-7710", pass: "K1234", blocked: false },
    { id: 5, name: "Мазуренко Ярослав Вадимович", group: "Б-Ф7-25-1-КС", code: "DU-1092", pass: "M1234", blocked: false },
    { id: 6, name: "Молодан Богдан Вікторович", group: "Б-Ф7-25-1-КС", code: "DU-6631", pass: "M1234", blocked: false },
    { id: 7, name: "Пелих Михайло Євгенович", group: "Б-Ф7-25-1-КС", code: "DU-4418", pass: "P1234", blocked: false },
    { id: 8, name: "Рябчун Ярослав Олегович", group: "Б-Ф7-25-1-КС", code: "DU-2201", pass: "R1234", blocked: false },
    { id: 9, name: "Фесенко Олексій Михайлович", group: "Б-Ф7-25-1-КС", code: "DU-9083", pass: "F1234", blocked: false },
    { id: 10, name: "Сидоренко Анна Сергіївна", group: "Б-Ф7-25-1-КС", code: "DU-1145", pass: "S1234", blocked: false },
    { id: 11, name: "Мельник Дмитро Ігорович", group: "Б-Ф7-25-1-КС", code: "DU-6732", pass: "M1234", blocked: false },
    { id: 12, name: "Шевченко Максим Олегович", group: "Б-Ф7-25-1-КС", code: "DU-8812", pass: "Sh1234", blocked: false },
    { id: 13, name: "Бондаренко Олена Василівна", group: "Б-Ф7-25-1-КС", code: "DU-3091", pass: "B1234", blocked: false },
    { id: 14, name: "Ткаченко Артем Юрійович", group: "Б-Ф7-25-1-КС", code: "DU-5411", pass: "T1234", blocked: false },
    { id: 15, name: "Кравченко Роман Романович", group: "Б-Ф7-25-1-КС", code: "DU-4120", pass: "K1234", blocked: false }
];

let systemUsers = JSON.parse(localStorage.getItem('du_users')) || defaultUsers;

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

    // Обробка авторизації
    document.getElementById('authForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const selVal = document.getElementById('userSelect').value;
        const pass = document.getElementById('authPass').value.trim();

        if (!selVal) {
            alert("Будь ласка, оберіть користувача зі списку!");
            return;
        }

        // Вхід Адміна
        if (selVal === 'admin') {
            if (pass === 'admin') {
                saveSession({ name: "Адміністратор", group: "Керування", code: "ADMIN-ROOT", isAdmin: true });
            } else {
                alert("Невірний пароль адміністратора!");
            }
            return;
        }

        // Вхід Студента
        const user = systemUsers.find(u => u.id == selVal);
        if (user) {
            if (user.blocked) {
                alert("Цього користувача заблоковано!");
                return;
            }

            // Перевірка індивідуального пароля
            if (user.pass && user.pass !== pass) {
                alert(`Невірний пароль! Підказка: перша літера прізвища англійською/українською + 1234 (Наприклад: ${user.pass})`);
                return;
            }

            saveSession({ ...user, isAdmin: false });
        }
    });

    // Кнопка виходу
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        localStorage.removeItem('du_session');
        location.reload();
    });

    // Панель адміна
    document.getElementById('btnAdminPanel')?.addEventListener('click', () => {
        renderAdminUsers();
        openModal('adminModal');
    });

    // Завантаження квитка
    document.getElementById('ticketFileInput')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const user = getSession();
            if (user) {
                localStorage.setItem(`ticket_${currentCardSide}_${user.code}`, evt.target.result);
                loadTicketPhotos();
            }
        };
        reader.readAsDataURL(file);
    });
});

function initAuthDropdown() {
    const select = document.getElementById('userSelect');
    if (!select) return;

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
    try {
        return JSON.parse(localStorage.getItem('du_session'));
    } catch (e) {
        return null;
    }
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
    document.getElementById('profCode').textContent = `Ваш код: ${user.code}`;

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

function openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('open');
}

function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('open');
}

function switchTab(tabId, btn) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.bottom-nav .nav-item').forEach(b => b.classList.remove('active'));

    const activeTab = document.getElementById(tabId);
    if (activeTab) activeTab.classList.add('active');

    if (btn) {
        btn.classList.add('active');
    } else {
        const navBtn = document.querySelector(`.bottom-nav button[onclick*="${tabId}"]`);
        if (navBtn) navBtn.classList.add('active');
    }
}

let currentCardSide = null;
function triggerCardUpload(side) {
    currentCardSide = side;
    const fileInput = document.getElementById('ticketFileInput');
    if (fileInput) fileInput.click();
}

let currentActiveWeek = 'week1';
function selectWeek(week) {
    currentActiveWeek = week;
    const btn1 = document.getElementById('btnWeek1');
    const btn2 = document.getElementById('btnWeek2');
    
    if (week === 'week1') {
        btn1.classList.remove('btn-secondary');
        btn2.classList.add('btn-secondary');
    } else {
        btn2.classList.remove('btn-secondary');
        btn1.classList.add('btn-secondary');
    }
    
    renderSchedules();
}

function renderSchedules() {
    const todayCont = document.getElementById('todayScheduleContainer');
    const fullCont = document.getElementById('fullScheduleContainer');

    if (!todayCont || !fullCont) return;

    todayCont.innerHTML = '';
    fullCont.innerHTML = '';

    const days = ["Неділя", "Понеділок", "Вівторок", "Середа", "Четвер", "П'ятниця", "Субота"];
    const todayName = days[new Date().getDay()] === "Неділя" ? "Понеділок" : days[new Date().getDay()];

    const todayLessons = (appSchedule[currentActiveWeek] && appSchedule[currentActiveWeek][todayName]) || [];

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

    if (appSchedule[currentActiveWeek]) {
        for (const [day, lessons] of Object.entries(appSchedule[currentActiveWeek])) {
            fullCont.innerHTML += `<div style="font-weight:700; font-size:13px; margin:10px 0 5px 0; color:var(--primary);">${day}</div>`;
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

function renderTasks() {
    const user = getSession();
    if (!user) return;
    const tasks = JSON.parse(localStorage.getItem(`tasks_${user.code}`)) || [];
    const cont = document.getElementById('tasksContainer');
    if (!cont) return;
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

function renderBooks() {
    const cont = document.getElementById('libraryContainer');
    if (!cont) return;
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

function loadTicketPhotos() {
    const user = getSession();
    if (!user) return;

    const front = localStorage.getItem(`ticket_front_${user.code}`);
    const back = localStorage.getItem(`ticket_back_${user.code}`);

    const slotFront = document.getElementById('slotFront');
    const slotBack = document.getElementById('slotBack');

    if (front && slotFront) slotFront.innerHTML = `<img src="${front}">`;
    if (back && slotBack) slotBack.innerHTML = `<img src="${back}">`;
}

function renderAdminUsers() {
    const cont = document.getElementById('adminUsersList');
    if (!cont) return;
    cont.innerHTML = '';
    systemUsers.forEach(u => {
        cont.innerHTML += `
            <div class="user-row">
                <div>
                    <strong>${u.name}</strong><br>
                    Пароль: <code>${u.pass}</code>
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
