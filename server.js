function handleLogin() {
    const usernameInput = document.getElementById('loginUser');
    const passwordInput = document.getElementById('loginPass');

    if (!usernameInput || !passwordInput) return;

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
        alert("Будь ласка, введіть логін та пароль!");
        return;
    }

    let users = DB.getUsers();
    let user = users.find(u => u.username === username && u.password === password);

    if (!user) {
        alert("Невірний логін або пароль! Перевірте дані або зареєструйтесь.");
        return;
    }

    if (user.blocked) {
        alert("Ваш акаунт заблоковано!");
        return;
    }

    user.lastLogin = new Date().toLocaleString('uk-UA');
    currentUser = user;
    saveUserData();

    initApp();
}

function initApp() {
    const overlay = document.getElementById('authOverlay');
    if (!currentUser) {
        if (overlay) overlay.style.display = 'flex';
        return;
    }
    
    if (overlay) overlay.style.display = 'none';

    const userLabel = document.getElementById('currentUserLabel');
    if (userLabel) {
        userLabel.textContent = currentUser.username + (currentUser.isAdmin ? ' (Admin)' : '');
    }

    if (currentUser.isAdmin) {
        document.getElementById('adminSidebarBtn').style.display = 'flex';
        document.getElementById('adminAccessCard').style.display = 'block';
        loadAdminTable();
    } else {
        document.getElementById('adminSidebarBtn').style.display = 'none';
        document.getElementById('adminAccessCard').style.display = 'none';
    }

    renderHomeDashboard();
    renderStudentCardView();
    renderTasks();
    renderSchedule();
}
