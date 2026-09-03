document.addEventListener('DOMContentLoaded', async () => {
    // --- Елементи ---
    const authOverlay = document.getElementById('authOverlay');
    const authForm = document.getElementById('authForm');
    const toggleAuthMode = document.getElementById('toggleAuthMode');
    const authSubmitBtn = document.getElementById('authSubmitBtn');
    
    const fullNameGroup = document.getElementById('fullNameGroup');
    const groupNameGroup = document.getElementById('groupNameGroup');

    const authLoginInput = document.getElementById('authLogin');
    const authPasswordInput = document.getElementById('authPassword');
    const regFullNameInput = document.getElementById('regFullName');
    const regGroupInput = document.getElementById('regGroup');

    const userFullNameElem = document.getElementById('userFullName');
    const userGroupElem = document.getElementById('userGroup');
    
    const adminWidgetCard = document.getElementById('adminWidgetCard');
    const adminModal = document.getElementById('adminModal');
    const openAdminModalBtn = document.getElementById('openAdminModalBtn');
    const closeAdminModal = document.getElementById('closeAdminModal');
    const adminScheduleForm = document.getElementById('adminScheduleForm');

    const scheduleContainer = document.getElementById('scheduleContainer');
    const scheduleTitle = document.getElementById('scheduleTitle');
    const currentWeekBadge = document.getElementById('currentWeekBadge');
    
    const notificationBanner = document.getElementById('notificationBanner');
    const notificationText = document.getElementById('notificationText');

    let isRegisterMode = false;
    let scheduleData = null;

    // Дні тижня
    const daysArr = ["Неділя", "Понеділок", "Вівторок", "Середа", "Четвер", "П'ятниця", "Субота"];

    // 1. Запит дозволу на Push-сповіщення у браузері
    if ("Notification" in window) {
        Notification.requestPermission();
    }

    // 2. Завантаження розкладу (з localStorage або data.json)
    async function loadSchedule() {
        const savedSchedule = localStorage.getItem('du_schedule');
        if (savedSchedule) {
            scheduleData = JSON.parse(savedSchedule);
        } else {
            try {
                const response = await fetch('data.json');
                if (response.ok) {
                    const data = await response.json();
                    scheduleData = data.schedule;
                    localStorage.setItem('du_schedule', JSON.stringify(scheduleData));
                }
            } catch (e) {
                console.error("Помилка завантаження data.json:", e);
            }
        }
        renderCurrentSchedule();
    }

    // 3. Функція виведення актуального розкладу
    function renderCurrentSchedule() {
        if (!scheduleData) return;

        const now = new Date();
        const currentDayIndex = now.getDay(); // 0 - Неділя, 1 - Понеділок...
        const currentDayName = daysArr[currentDayIndex];

        // Симуляція визначення тижня (1 чи 2)
        const weekType = "week1"; 
        currentWeekBadge.textContent = weekType === "week1" ? "Тиждень 1" : "Тиждень 2";

        const todayLessons = scheduleData[weekType][currentDayName] || [];

        // Перевіряємо, чи всі пари на сьогодні вже закінчилися
        let allFinished = false;
        if (todayLessons.length > 0) {
            const lastLesson = todayLessons[todayLessons.length - 1];
            const [lastEndH, lastEndM] = lastLesson.end.split(':').map(Number);
            const lastLessonEndTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), lastEndH, lastEndM);
            if (now > lastLessonEndTime) {
                allFinished = true;
            }
        } else {
            allFinished = true; // Якщо пар взагалі не було
        }

        scheduleContainer.innerHTML = '';

        // ЯКЩО СУБОТА АБО НЕДІЛЯ І ВСІ ПАРИ СКУНЧИЛИСЯ -> Показываем весь наступний тиждень
        if ((currentDayIndex === 6 && allFinished) || currentDayIndex === 0) {
            scheduleTitle.textContent = "📅 Розклад на наступний тиждень";
            const nextWeek = weekType === "week1" ? "week2" : "week1";

            for (let day in scheduleData[nextWeek]) {
                const lessons = scheduleData[nextWeek][day];
                if (lessons.length > 0) {
                    let dayHtml = `<div style="font-weight:700; margin-top:10px; font-size:13px; color:var(--text-muted);">${day}</div>`;
                    lessons.forEach(l => {
                        dayHtml += `
                            <div class="schedule-item">
                                <div><strong>${l.subject}</strong></div>
                                <div class="schedule-time">${l.start} - ${l.end}</div>
                            </div>`;
                    });
                    scheduleContainer.innerHTML += dayHtml;
                }
            }
            return;
        }

        // ЯКЩО ПАРИ СКІНЧИЛИСЯ СЬОГОДНІ -> Показуємо розклад на ЗАВТРА
        if (allFinished) {
            const nextDayName = daysArr[(currentDayIndex + 1) % 7];
            scheduleTitle.textContent = `📅 Розклад на завтра (${nextDayName})`;
            const nextDayLessons = scheduleData[weekType][nextDayName] || [];

            if (nextDayLessons.length === 0) {
                scheduleContainer.innerHTML = `<div style="padding:15px; text-align:center; color:var(--text-muted);">Завтра пар немає! 🥳</div>`;
            } else {
                nextDayLessons.forEach(l => {
                    scheduleContainer.innerHTML += `
                        <div class="schedule-item">
                            <div><strong>${l.subject}</strong></div>
                            <div class="schedule-time">${l.start} - ${l.end}</div>
                        </div>`;
                });
            }
            return;
        }

        // ІНАКШЕ: Показуємо розклад на СЬОГОДНІ
        scheduleTitle.textContent = `📅 Розклад на сьогодні (${currentDayName})`;
        todayLessons.forEach(l => {
            scheduleContainer.innerHTML += `
                <div class="schedule-item">
                    <div><strong>${l.subject}</strong></div>
                    <div class="schedule-time">${l.start} - ${l.end}</div>
                </div>`;
        });
    }

    // 4. Перевірка часу та показування сповіщення за 10 хв
    function checkNotificationTimer() {
        if (!scheduleData) return;

        const now = new Date();
        const currentDayName = daysArr[now.getDay()];
        const todayLessons = scheduleData["week1"][currentDayName] || [];

        todayLessons.forEach(lesson => {
            const [startH, startM] = lesson.start.split(':').map(Number);
            const lessonStartTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startH, startM);
            
            // Різниця у хвилинах
            const diffMs = lessonStartTime - now;
            const diffMinutes = Math.floor(diffMs / 60000);

            // Якщо залишилося рівно 10 хвилин
            if (diffMinutes === 10) {
                showNotification(`🔔 Скоро пара!`, `Предмет "${lesson.subject}" розпочнеться через 10 хвилин (${lesson.start}).`);
            }
        });
    }

    function showNotification(title, text) {
        // Візуальне табло
        notificationText.textContent = text;
        notificationBanner.style.display = 'flex';
        setTimeout(() => { notificationBanner.style.display = 'none'; }, 8000);

        // Системний Push
        if ("Notification" in window && Notification.permission === "granted") {
            new Notification(title, { body: text });
        }
    }

    // Запускаємо перевірку таймера кожні 30 секунд
    setInterval(checkNotificationTimer, 30000);

    // 5. Авторизація та Адмін-аккаунт
    function checkSession() {
        const currentUser = JSON.parse(localStorage.getItem('du_current_user'));
        if (currentUser) {
            userFullNameElem.textContent = currentUser.fullName;
            userGroupElem.textContent = currentUser.group;

            // Якщо авторизовано адміна
            if (currentUser.isAdmin) {
                adminWidgetCard.style.display = 'block';
            } else {
                adminWidgetCard.style.display = 'none';
            }

            authOverlay.style.display = 'none';
        } else {
            authOverlay.style.display = 'flex';
        }
    }

    // Вхід / Реєстрація
    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const login = authLoginInput.value.trim();
        const password = authPasswordInput.value.trim();

        // Спеціальний акаунт для Адміна (login: admin, pass: admin)
        if (login === 'admin' && password === 'admin') {
            const adminUser = {
                login: 'admin',
                fullName: 'Адміністратор Системи',
                group: 'Адміністрація DU',
                isAdmin: true
            };
            localStorage.setItem('du_current_user', JSON.stringify(adminUser));
            checkSession();
            return;
        }

        // Звичайний користувач
        const user = {
            login,
            fullName: isRegisterMode ? (regFullNameInput.value || 'Студент') : 'Ігнатенко Євген Олександрович',
            group: isRegisterMode ? (regGroupInput.value || 'Б-Ф7-25-1-КС') : 'Б-Ф7-25-1-КС',
            isAdmin: false
        };

        localStorage.setItem('du_current_user', JSON.stringify(user));
        checkSession();
    });

    // Вихід
    document.getElementById('logoutBtnNav').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('du_current_user');
        checkSession();
    });

    // Модальне вікно адміна
    openAdminModalBtn.addEventListener('click', () => adminModal.style.display = 'flex');
    closeAdminModal.addEventListener('click', () => adminModal.style.display = 'none');

    // Адмін: Додавання нової пари у розклад
    adminScheduleForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const week = document.getElementById('adminWeekSelect').value;
        const day = document.getElementById('adminDaySelect').value;
        const subject = document.getElementById('adminSubject').value;
        const start = document.getElementById('adminStart').value;
        const end = document.getElementById('adminEnd').value;

        if (!scheduleData[week][day]) {
            scheduleData[week][day] = [];
        }

        scheduleData[week][day].push({ subject, start, end });
        
        // Зберігаємо в localStorage
        localStorage.setItem('du_schedule', JSON.stringify(scheduleData));
        alert(`Пару "${subject}" додано на ${day} (${week})!`);
        
        adminModal.style.display = 'none';
        renderCurrentSchedule();
    });

    // Перемикач режимів авторизації
    toggleAuthMode.addEventListener('click', () => {
        isRegisterMode = !isRegisterMode;
        fullNameGroup.style.display = isRegisterMode ? 'block' : 'none';
        groupNameGroup.style.display = isRegisterMode ? 'block' : 'none';
        authSubmitBtn.textContent = isRegisterMode ? 'Зареєструватися' : 'Увійти';
    });

    // Ініціалізація
    await loadSchedule();
    checkSession();
});
