// Автоматичне оновлення локального сховища
if (!localStorage.getItem('du_v3_updated')) {
    localStorage.removeItem('du_users');
    localStorage.setItem('du_v3_updated', 'true');
}

// Список студентів та паролів (перша літера прізвища англійською/українською + 1234)
const defaultUsers = [
    { id: 1, name: "Зайчук Назарій Вікторович", group: "Б-Ф7-25-1-КС", code: "DU-8921", pass: "Z1234", blocked: false },
    { id: 2, name: "Ігнатенко Євген Олександрович", group: "Б-Ф7-25-1-КС", code: "DU-3412", pass: "I1234", blocked: false },
    { id: 3, name: "Коваленко Олександр Дмитрович", group: "Б-Ф7-25-1-КС", code: "DU-5519", pass: "K1234", blocked: false },
    { id: 4, name: "Крант Єлизавета Вячеславівна", group: "Б-Ф7-25-1-КС", code: "DU-7710", pass: "K1234", blocked: false },
    { id: 5, name: "Мазуренко Ярослав Вадимович", group: "Б-Ф7-25-1-КС", code: "DU-1092", pass: "M1234", blocked: false }
];

let systemUsers = JSON.parse(localStorage.getItem('du_users')) || defaultUsers;

// Розклад з прив'язкою до точних дат (Включаючи суботи)
let appSchedule = JSON.parse(localStorage.getItem('du_schedule_dates')) || [
    { id: 1, date: "2026-09-05", subject: "Програмування (Субота)", start: "09:50", end: "11:20" },
    { id: 2, date: "2026-09-07", subject: "Вища математика", start: "11:40", end: "13:10" }
];

// Завантажені адміном файли
let uploadedFiles = JSON.parse(localStorage.getItem('du_files')) || [];

document.addEventListener('DOMContentLoaded', () => {
    initAuthDropdown();
    checkUserSession();

    // Вхід у систему
    document.getElementById('authForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const selVal = document.getElementById('userSelect').value;
        const pass = document.getElementById('authPass').value.trim();

        if (selVal === 'admin') {
            if (pass === 'admin') {
                saveSession({ name: "Адміністратор", group: "Керування", code: "ADMIN-ROOT", isAdmin: true });
            } else {
                alert("Невірний пароль адміністратора!");
            }
            return;
        }

        const user = systemUsers.find(u => u.id == selVal);
        if (user) {
            if (user.pass && user.pass !== pass) {
                alert(`Невірний пароль! Спробуйте: ${user.pass}`);
                return;
            }
            saveSession({ ...user, isAdmin: false });
        }
    });

    // Вихід
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        localStorage.removeItem('du_session');
        location.reload();
    });

    // Адмін-Панель
    document.getElementById('btnAdminPanel')?.addEventListener('click', () => {
        openModal('adminModal');
    });

    // Адмін: Додати пару за датою
    document.getElementById('addScheduleForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const date = document.getElementById('schDate').value;
        const subject = document.getElementById('schSubject').value;
        const start = document.getElementById('schStart').value;
        const end = document.getElementById('schEnd').value;

        appSchedule.push({ id: Date.now(), date, subject, start, end });
        localStorage.setItem('du_schedule_dates', JSON.stringify(appSchedule));
        
        alert("Пару успішно додано до розкладу!");
        document.getElementById('addScheduleForm').reset();
        renderSchedules();
    });

    // Адмін: Завантажити файл з комп'ютера
    document.getElementById('uploadAdminFileForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('adminFileName').value;
        const fileInput = document.getElementById('adminFileInput');
        const file = fileInput.files[0];

        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const fileData = {
                id: Date.now(),
                title: title,
                fileName: file.name,
                size: (file.size / 1024).toFixed(1) + " KB",
                content: evt.target.result
            };

            uploadedFiles.push(fileData);
            localStorage.setItem('du_files', JSON.stringify(uploadedFiles));
            alert("Файл успішно завантажено для студентів!");
            document.getElementById('uploadAdminFileForm').reset();
            renderFiles();
        };
        reader.readAsDataURL(file);
    });

    // Студентський Квиток: Генерація
    document.getElementById('studentTicketForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('tkName').value;
        const group = document.getElementById('tkGroup').value;
        const num = document.getElementById('tkNumber').value;
        const photoInput = document.getElementById('tkPhotoInput');

        document.getElementById('idNameDisplay').textContent = name;
        document.getElementById('idGroupDisplay').textContent = `Група: ${group}`;
        document.getElementById('idNumDisplay').textContent = `№: ${num}`;

        if (photoInput.files && photoInput.files[0]) {
            const reader = new FileReader();
            reader.onload = (evt) => {
                document.getElementById('idPhotoPreview').innerHTML = `<img src="${evt.target.result}">`;
            };
            reader.readAsDataURL(photoInput.files[0]);
        }

        document.getElementById('generatedTicketBox').style.display = 'block';
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

    renderSchedules();
    renderFiles();
}

function renderSchedules() {
    const todayCont = document.getElementById('todayScheduleContainer');
    if (!todayCont) return;

    todayCont.innerHTML = '';
    const todayStr = new Date().toISOString().split('T')[0];

    const todayLessons = appSchedule.filter(s => s.date === todayStr);

    if (todayLessons.length === 0) {
        todayCont.innerHTML = `<div style="font-size:12px; color:var(--text-muted); padding:10px;">На сьогодні пар за датою немає</div>`;
    } else {
        todayLessons.forEach(l => {
            todayCont.innerHTML += `
                <div class="schedule-card">
                    <div class="schedule-time">${l.start}<br>${l.end}</div>
                    <div class="schedule-info">
                        <h5>${l.subject}</h5>
                        <p>Дата: ${l.date}</p>
                    </div>
                </div>`;
        });
    }
}

function filterScheduleByDate() {
    const selectedDate = document.getElementById('scheduleDatePicker').value;
    const cont = document.getElementById('dateScheduleContainer');
    if (!cont) return;

    cont.innerHTML = '';
    const filtered = appSchedule.filter(s => s.date === selectedDate);

    if (filtered.length === 0) {
        cont.innerHTML = `<div style="font-size:12px; color:var(--text-muted); padding:10px;">На цю дату розклад відсутній</div>`;
        return;
    }

    filtered.forEach(l => {
        cont.innerHTML += `
            <div class="schedule-card">
                <div class="schedule-time">${l.start}<br>${l.end}</div>
                <div class="schedule-info">
                    <h5>${l.subject}</h5>
                    <p>Дата: ${l.date}</p>
                </div>
            </div>`;
    });
}

function renderFiles() {
    const cont = document.getElementById('filesContainer');
    if (!cont) return;
    cont.innerHTML = '';

    if (uploadedFiles.length === 0) {
        cont.innerHTML = `<div style="font-size:12px; color:var(--text-muted);">Адміністратор ще не завантажив жодного файлу.</div>`;
        return;
    }

    uploadedFiles.forEach(f => {
        cont.innerHTML += `
            <div class="file-card">
                <div class="file-info">
                    <i class="fa-solid fa-file-lines"></i>
                    <div>
                        <h6>${f.title}</h6>
                        <p>${f.fileName} (${f.size})</p>
                    </div>
                </div>
                <a href="${f.content}" download="${f.fileName}" class="view-all"><i class="fa-solid fa-download"></i></a>
            </div>`;
    });
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
