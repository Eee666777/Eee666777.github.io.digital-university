document.addEventListener('DOMContentLoaded', async () => {
    // Елементи
    const authOverlay = document.getElementById('authOverlay');
    const authForm = document.getElementById('authForm');
    const studentSelect = document.getElementById('studentSelect');
    const authPassword = document.getElementById('authPassword');

    const userFullName = document.getElementById('userFullName');
    const userGroup = document.getElementById('userGroup');
    const logoutBtn = document.getElementById('logoutBtn');

    const adminPanel = document.getElementById('adminPanel');
    const openAdminModalBtn = document.getElementById('openAdminModalBtn');
    const adminModal = document.getElementById('adminModal');
    const closeAdminModal = document.getElementById('closeAdminModal');
    const adminScheduleForm = document.getElementById('adminScheduleForm');

    const studentsModal = document.getElementById('studentsModal');
    const openStudentsBtn = document.getElementById('openStudentsBtn');
    const closeStudentsModal = document.getElementById('closeStudentsModal');

    const tabWeek1 = document.getElementById('tabWeek1');
    const tabWeek2 = document.getElementById('tabWeek2');
    const scheduleContainer = document.getElementById('scheduleContainer');

    let scheduleData = null;
    let selectedWeek = 'week1';

    const daysArr = ["Неділя", "Понеділок", "Вівторок", "Середа", "Четвер", "П'ятниця", "Субота"];

    // 1. Завантаження розкладу
    async function loadSchedule() {
        const saved = localStorage.getItem('du_schedule');
        if (saved) {
            scheduleData = JSON.parse(saved);
        } else {
            try {
                const res = await fetch('data.json');
                if (res.ok) {
                    const data = await res.json();
                    scheduleData = data.schedule;
                    localStorage.setItem('du_schedule', JSON.stringify(scheduleData));
                }
            } catch (e) {
                console.error(e);
            }
        }
        renderSchedule();
    }

    // 2. Відображення розкладу
    function renderSchedule() {
        if (!scheduleData) return;

        const now = new Date();
        const dayName = daysArr[now.getDay()];

        const lessons = scheduleData[selectedWeek][dayName] || [];
        scheduleContainer.innerHTML = '';

        if (lessons.length === 0) {
            scheduleContainer.innerHTML = `<div style="text-align:center; padding:10px; font-size:12px; color:#64748b;">Сьогодні немає пар!</div>`;
            return;
        }

        lessons.forEach(l => {
            scheduleContainer.innerHTML += `
                <div class="schedule-item">
                    <div><strong>${l.subject}</strong></div>
                    <div class="schedule-time">${l.start} - ${l.end}</div>
                </div>
            `;
        });
    }

    // Перемикач тижнів
    tabWeek1.addEventListener('click', () => {
        selectedWeek = 'week1';
        tabWeek1.classList.add('active');
        tabWeek2.classList.remove('active');
        renderSchedule();
    });

    tabWeek2.addEventListener('click', () => {
        selectedWeek = 'week2';
        tabWeek2.classList.add('active');
        tabWeek1.classList.remove('active');
        renderSchedule();
    });

    // 3. Авторизація та сесії
    function checkSession() {
        const user = JSON.parse(localStorage.getItem('du_current_user'));
        if (user) {
            userFullName.innerHTML = user.fullName.replace(' ', '<br>');
            userGroup.textContent = user.group;

            if (user.isAdmin) {
                adminPanel.style.display = 'block';
            } else {
                adminPanel.style.display = 'none';
            }

            authOverlay.style.display = 'none';
        } else {
            authOverlay.style.display = 'flex';
        }
    }

    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const selected = studentSelect.value;
        const pass = authPassword.value;

        if (!selected) {
            alert('Будь ласка, оберіть студента!');
            return;
        }

        if (selected === 'admin') {
            if (pass === 'admin') {
                localStorage.setItem('du_current_user', JSON.stringify({
                    fullName: 'Адміністратор Системи',
                    group: 'Адміністрація DU',
                    isAdmin: true
                }));
                checkSession();
            } else {
                alert('Невірний пароль для адміна!');
            }
            return;
        }

        localStorage.setItem('du_current_user', JSON.stringify({
            fullName: selected,
            group: 'Б-Ф7-25-1-КС',
            isAdmin: false
        }));
        checkSession();
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('du_current_user');
        checkSession();
    });

    // 4. Адмін модалка
    openAdminModalBtn.addEventListener('click', () => adminModal.style.display = 'flex');
    closeAdminModal.addEventListener('click', () => adminModal.style.display = 'none');

    adminScheduleForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const week = document.getElementById('adminWeekSelect').value;
        const day = document.getElementById('adminDaySelect').value;
        const subject = document.getElementById('adminSubject').value;
        const start = document.getElementById('adminStart').value;
        const end = document.getElementById('adminEnd').value;

        if (!scheduleData[week][day]) scheduleData[week][day] = [];
        scheduleData[week][day].push({ subject, start, end });

        localStorage.setItem('du_schedule', JSON.stringify(scheduleData));
        alert('Пару додано!');
        adminModal.style.display = 'none';
        renderSchedule();
    });

    // 5. Модалка ПІБ
    openStudentsBtn.addEventListener('click', () => studentsModal.style.display = 'flex');
    closeStudentsModal.addEventListener('click', () => studentsModal.style.display = 'none');

    await loadSchedule();
    checkSession();
});
