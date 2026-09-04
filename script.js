// Оновлений список користувачів з паролями
const defaultUsers = [
    { id: 1, name: "Зайчук Назарій Вікторович", group: "Б-Ф7-25-1-КС", code: "DU-8921", pass: "zaec1", blocked: false },
    { id: 2, name: "Ігнатенко Євген Олександрович", group: "Б-Ф7-25-1-КС", code: "DU-3412", pass: "12345", blocked: false },
    { id: 3, name: "Коваленко Олександр Дмитрович", group: "Б-Ф7-25-1-КС", code: "DU-5519", pass: "12345", blocked: false },
    { id: 4, name: "Крант Єлизавета Вячеславівна", group: "Б-Ф7-25-1-КС", code: "DU-7710", pass: "12345", blocked: false },
    { id: 5, name: "Мазуренко Ярослав Вадимович", group: "Б-Ф7-25-1-КС", code: "DU-1092", pass: "12345", blocked: false }
];

let systemUsers = JSON.parse(localStorage.getItem('du_users')) || defaultUsers;

document.addEventListener('DOMContentLoaded', () => {
    initAuthDropdown();
    checkUserSession();

    // Обробка форми входу
    document.getElementById('authForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const selVal = document.getElementById('userSelect').value;
        const pass = document.getElementById('authPass').value.trim();

        if (!selVal) {
            alert("Будь ласка, оберіть користувача!");
            return;
        }

        // Вхід для Адміністратора
        if (selVal === 'admin') {
            if (pass === 'admin') {
                saveSession({ name: "Адміністратор", group: "Керування", code: "ADMIN-ROOT", isAdmin: true });
            } else {
                alert("Невірний пароль адміністратора!");
            }
            return;
        }

        // Вхід для студентів
        const user = systemUsers.find(u => u.id == selVal);
        if (user) {
            if (user.blocked) {
                alert("Цього користувача заблоковано!");
                return;
            }
            
            // Перевірка індивідуального пароля
            if (user.pass && user.pass !== pass) {
                alert("Невірний пароль!");
                return;
            }

            saveSession({ ...user, isAdmin: false });
        }
    });
});
