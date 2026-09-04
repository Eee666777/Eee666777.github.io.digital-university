document.addEventListener('DOMContentLoaded', () => {
    // Базові дані розкладу за замовчуванням
    const defaultSchedule = {
        week1: {
            "Понеділок": [
                { id: 1, subject: "Вища математика", start: "08:30", end: "09:50" },
                { id: 2, subject: "Програмування C#", start: "10:05", end: "11:25" }
            ],
            "Вівторок": [
                { id: 3, subject: "Фізика", start: "08:30", end: "09:50" }
            ],
            "Середа": [], "Четвер": [], "П'ятниця": [], "Субота": []
        },
        week2: {
            "Понеділок": [
                { id: 4, subject: "Бази даних", start: "10:05", end: "11:25" }
            ],
            "Вівторок": [], "Середа": [], "Четвер": [], "П'ятниця": [], "Субота": []
        }
    };

    const studentsList = [
        "Зайчук Назарій Вікторович",
        "Ігнатенко Євген Олександрович",
        "Коваленко Олександр Дмитрович",
        "Крант Єлизавета Вячеславівна",
        "Мазуренко Ярослав Вадимович",
        "Молодан Богдан Вікторович",
        "Пелих Михайло Євгенович",
        "Рябчун Ярослав Олегович",
        "Фесенко Олексій Михайлович"
    ];

    let scheduleData = JSON.parse(localStorage.getItem('du_schedule')) || defaultSchedule;
    let selectedWeek = 'week1';
    let currentUploadSide = null; // 'front' або 'back'

    // DOM-елементи
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

    const infoModal = document.getElementById('infoModal');
    const infoModalTitle = document.getElementById('infoModalTitle');
    const infoModalContent = document.getElementById('infoModalContent');
    const closeInfoModal = document.getElementById('closeInfoModal');

    const tabWeek1 = document.getElementById('tabWeek1');
    const tabWeek2 = document.getElementById('tabWeek2');
    const scheduleContainer = document.getElementById('scheduleContainer');

    const cardFileInput = document.getElementById('cardFileInput');
    const slotFront = document.getElementById('slotFront');
    const slotBack = document.getElementById('slotBack');

    // 1. Збереження розкладу
    function saveSchedule() {
        localStorage.setItem('du_schedule', JSON.stringify(scheduleData));
        renderSchedule();
    }

    // 2. Відображення розкладу
    function renderSchedule() {
        const days = ["Неділя", "Понеділок", "Вівторок", "Середа", "Четвер", "П'ятниця", "Субота"];
        const todayName = days[new Date().getDay()] === "Неділя" ? "Понеділок" : days[new Date().getDay()];
        
        document.getElementById('currentDaySub').textContent = `${todayName} (${selectedWeek === 'week1' ? '1-й тиждень' : '2-й тиждень'})`;

        const currentUser = JSON.parse(localStorage.getItem('du_current_user'));
        const lessons = scheduleData[selectedWeek][todayName] || [];

        scheduleContainer.innerHTML = '';

        if (lessons.length === 0) {
            scheduleContainer.innerHTML = `<div style="text-align:center; padding:12px; font-size:12px; color:#64748b;">Пар немає</div>`;
            return;
        }

        lessons.forEach(lesson => {
            const item = document.createElement('div');
            item.className = 'schedule-item';
            item.innerHTML = `
                <div><strong>${lesson.subject}</strong></div>
                <div style="display:flex; align-items:center;">
                    <span class="schedule-time">${lesson.start} - ${lesson.end}</span>
                    ${currentUser && currentUser.isAdmin ? `<button class="delete-lesson-btn" data-id="${lesson.id}"><i class="fa-solid fa-trash"></i></button>` : ''}
                </div>
            `;
            scheduleContainer.appendChild(item);
        });

        // Додаємо видалення пар для адміна
        if (currentUser && currentUser.isAdmin) {
            document.querySelectorAll('.delete-lesson-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = Number(e.currentTarget.getAttribute('data-id'));
                    scheduleData[selectedWeek][todayName] = scheduleData[selectedWeek][todayName].filter(l => l.id !== id);
                    saveSchedule();
                });
            });
        }
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

    // 3. Авторизація
    function checkSession() {
        const currentUser = JSON.parse(localStorage.getItem('du_current_user'));
        if (currentUser) {
            userFullName.innerHTML = currentUser.fullName.replace(' ', '<br>');
            userGroup.textContent = currentUser.group;

            if (currentUser.isAdmin) {
                adminPanel.style.display = 'block';
            } else {
                adminPanel.style.display = 'none';
            }

            authOverlay.style.display = 'none';
            loadCardPhotos();
            renderSchedule();
        } else {
            authOverlay.style.display = 'flex';
        }
    }

    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const selected = studentSelect.value;
        const pass = authPassword.value;

        if (!selected) {
            alert('Будь ласка, оберіть користувача зі списку!');
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
                alert('Невірний пароль для адміністратора!');
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

    // 4. Кнопки інформації (ПІБ, Група, Курс)
    document.getElementById('btnPib').addEventListener('click', () => {
        infoModalTitle.textContent = "👥 Список студентів групи";
        infoModalContent.innerHTML = studentsList.map(s => `<li>${s}</li>`).join('');
        infoModal.style.display = 'flex';
    });

    document.getElementById('btnGroup').addEventListener('click', () => {
        infoModalTitle.textContent = "🏫 Назва групи";
        infoModalContent.innerHTML = `<li><strong>Група:</strong> Б-Ф7-25-1-КС</li><li><strong>Спеціальність:</strong> Комп'ютерні науки</li>`;
        infoModal.style.display = 'flex';
    });

    document.getElementById('btnCourse').addEventListener('click', () => {
        infoModalTitle.textContent = "🎓 Інформація про курс";
        infoModalContent.innerHTML = `<li><strong>Поточний курс:</strong> 1 курс</li><li><strong>Навчальний рік:</strong> 2025/2026</li>`;
        infoModal.style.display = 'flex';
    });

    closeInfoModal.addEventListener('click', () => infoModal.style.display = 'none');

    // 5. Адмін: додавання пар
    openAdminModalBtn.addEventListener('click', () => adminModal.style.display = 'flex');
    closeAdminModal.addEventListener('click', () => adminModal.style.display = 'none');

    adminScheduleForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const week = document.getElementById('adminWeekSelect').value;
        const day = document.getElementById('adminDaySelect').value;
        const subject = document.getElementById('adminSubject').value;
        const start = document.getElementById('adminStart').value;
        const end = document.getElementById('adminEnd').value;

        scheduleData[week][day].push({
            id: Date.now(),
            subject,
            start,
            end
        });

        saveSchedule();
        adminModal.style.display = 'none';
        adminScheduleForm.reset();
    });

    // 6. Робота зі студентським квитком (Камера / Завантаження фото)
    slotFront.addEventListener('click', () => {
        currentUploadSide = 'front';
        cardFileInput.click();
    });

    slotBack.addEventListener('click', () => {
        currentUploadSide = 'back';
        cardFileInput.click();
    });

    cardFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64Image = event.target.result;
            const user = JSON.parse(localStorage.getItem('du_current_user'));
            const userKey = user ? user.fullName : 'guest';

            if (currentUploadSide === 'front') {
                localStorage.setItem(`card_front_${userKey}`, base64Image);
            } else {
                localStorage.setItem(`card_back_${userKey}`, base64Image);
            }
            loadCardPhotos();
        };
        reader.readAsDataURL(file);
    });

    function loadCardPhotos() {
        const user = JSON.parse(localStorage.getItem('du_current_user'));
        const userKey = user ? user.fullName : 'guest';

        const frontImg = localStorage.getItem(`card_front_${userKey}`);
        const backImg = localStorage.getItem(`card_back_${userKey}`);

        if (frontImg) {
            slotFront.innerHTML = `<img src="${frontImg}" alt="Front">`;
        } else {
            slotFront.innerHTML = `<i class="fa-solid fa-camera"></i><span>Лицьова сторона</span>`;
        }

        if (backImg) {
            slotBack.innerHTML = `<img src="${backImg}" alt="Back">`;
        } else {
            slotBack.innerHTML = `<i class="fa-solid fa-camera"></i><span>Зворотна сторона</span>`;
        }
    }

    checkSession();
});
