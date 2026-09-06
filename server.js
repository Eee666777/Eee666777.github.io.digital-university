const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Віддача статичних файлів (HTML, CSS, JS, відео) з папки public
app.use(express.static(path.join(__dirname, 'public')));

// База даних у пам'яті сервера
const database = {
  users: [],
  globalSchedule: [],
  customClasses: {}, // userId: []
  tasks: {}          // userId: []
};

// --- ЕНДПОЙНТИ АВТОРИЗАЦІЇ ---

app.post('/api/register', (req, res) => {
  const { fio, email, password } = req.body;
  const existingUser = database.users.find(u => u.email === email);
  
  if (existingUser) {
    return res.status(400).json({ error: 'Користувач з таким email вже існує' });
  }

  const role = password === 'Admin-pass444' ? 'admin' : 'student';
  const newUser = { id: 'user_' + Date.now(), fio, email, password, role, group: '', dob: '' };
  
  database.users.push(newUser);
  database.customClasses[newUser.id] = [];
  database.tasks[newUser.id] = [];

  res.json({ success: true, user: newUser });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = database.users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({ error: 'Невірний email або пароль' });
  }

  res.json({ success: true, user });
});

// --- ЕНДПОЙНТИ РОЗКЛАДУ ТА ЗАВДАНЬ ---

app.get('/api/schedule/global', (req, res) => {
  res.json(database.globalSchedule);
});

app.post('/api/schedule/global', (req, res) => {
  const classItem = req.body;
  database.globalSchedule.push(classItem);
  res.json({ success: true });
});

app.get('/api/schedule/custom/:userId', (req, res) => {
  const userId = req.params.userId;
  res.json(database.customClasses[userId] || []);
});

app.post('/api/schedule/custom/:userId', (req, res) => {
  const userId = req.params.userId;
  if (!database.customClasses[userId]) database.customClasses[userId] = [];
  database.customClasses[userId].push(req.body);
  res.json({ success: true });
});

app.get('/api/tasks/:userId', (req, res) => {
  const userId = req.params.userId;
  res.json(database.tasks[userId] || []);
});

app.post('/api/tasks/:userId', (req, res) => {
  const userId = req.params.userId;
  if (!database.tasks[userId]) database.tasks[userId] = [];
  const newTask = { id: 'task_' + Date.now(), ...req.body, completed: false };
  database.tasks[userId].push(newTask);
  res.json({ success: true, task: newTask });
});

app.post('/api/tasks/:userId/toggle/:taskId', (req, res) => {
  const { userId, taskId } = req.params;
  const userTasks = database.tasks[userId] || [];
  const task = userTasks.find(t => t.id === taskId);
  if (task) {
    task.completed = !task.completed;
  }
  res.json({ success: true });
});

app.get('/api/users', (req, res) => {
  res.json(database.users);
});

app.post('/api/users/update/:userId', (req, res) => {
  const userId = req.params.userId;
  const user = database.users.find(u => u.id === userId);
  if (user) {
    Object.assign(user, req.body);
  }
  res.json({ success: true, user });
});

app.listen(PORT, () => {
  console.log(`Сервер запущено на http://localhost:${PORT}`);
});
