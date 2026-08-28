const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Разрешаем CORS-запросы с вашего фронтенда на GitHub Pages
app.use(cors({
  origin: ['https://eee666777.github.io', 'http://localhost:3000'],
  credentials: true
}));

// Обязательно для работы сессий через прокси Render (HTTPS)
app.set('trust proxy', 1);

// Инициализация базы данных SQLite
const dbPath = process.env.DB_PATH || path.join('/tmp', 'university.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Помилка подключения до БД:', err.message);
  } else {
    console.log('Подключено до SQLite БД.');
  }
});

// Создание таблиц
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      secret_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      text TEXT NOT NULL,
      done INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS student_cards (
      user_id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      group_name TEXT NOT NULL,
      card_num TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      week TEXT NOT NULL,
      day INTEGER NOT NULL,
      time TEXT NOT NULL,
      name TEXT NOT NULL,
      room TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
});

app.use(express.json({ limit: '100kb' }));

// Настройка сессий для работы между GitHub Pages и Render
app.use(session({
  secret: process.env.SESSION_SECRET || 'CHANGE_THIS_IN_PRODUCTION',
  resave: false,
  saveUninitialized: false,
  proxy: true,
  cookie: {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}));

function requireAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'Потрібно увійти в акаунт.' });
  next();
}

function validUsername(u) {
  return typeof u === 'string' && /^[a-zA-Zа-яА-ЯіІїЇєЄґҐ0-9_.-]{3,32}$/.test(u);
}

// Регистрация
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, secret } = req.body || {};
    if (!validUsername(username)) return res.status(400).json({ error: 'Логін: 3–32 символи, тільки літери, цифри, _ . -' });
    if (typeof password !== 'string' || password.length < 6) return res.status(400).json({ error: 'Пароль має містити щонайменше 6 символів.' });
    if (typeof secret !== 'string' || secret.length < 2) return res.status(400).json({ error: 'Введіть секретне слово.' });

    db.get('SELECT id FROM users WHERE username = ?', [username], async (err, user) => {
      if (err) return res.status(500).json({ error: 'Помилка бази даних.' });
      if (user) return res.status(409).json({ error: 'Користувач з таким логіном вже існує.' });

      const passwordHash = await bcrypt.hash(password, 12);
      const secretHash = await bcrypt.hash(secret.toLowerCase(), 12);

      db.run('INSERT INTO users (username, password_hash, secret_hash) VALUES (?,?,?)', 
        [username, passwordHash, secretHash], 
        function(err) {
          if (err) return res.status(500).json({ error: 'Не вдалося створити акаунт.' });
          res.json({ ok: true });
        }
      );
    });
  } catch (e) {
    res.status(500).json({ error: 'Не вдалося створити акаунт.' });
  }
});

// Логин
app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  db.get('SELECT * FROM users WHERE username = ?', [username || ''], async (err, user) => {
    if (err || !user || !(await bcrypt.compare(password || '', user.password_hash))) {
      return res.status(401).json({ error: 'Невірний логін або пароль.' });
    }
    req.session.userId = user.id;
    req.session.username = user.username;
    res.json({ ok: true, user: { id: user.id, username: user.username } });
  });
});

// Выход
app.post('/api/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

// Проверка сессии
app.get('/api/me', (req, res) => {
  if (!req.session.userId) return res.json({ user: null });
  res.json({ user: { id: req.session.userId, username: req.session.username } });
});

// Сброс пароля
app.post('/api/reset-password', (req, res) => {
  const { username, secret, newPassword } = req.body || {};
  if (typeof newPassword !== 'string' || newPassword.length < 6)
    return res.status(400).json({ error: 'Новий пароль має містити щонайменше 6 символів.' });

  db.get('SELECT * FROM users WHERE username = ?', [username || ''], async (err, user) => {
    if (err || !user || !(await bcrypt.compare((secret || '').toLowerCase(), user.secret_hash))) {
      return res.status(400).json({ error: 'Невірне секретне слово або користувача не знайдено.' });
    }

    const hash = await bcrypt.hash(newPassword, 12);
    db.run('UPDATE users SET password_hash=? WHERE id=?', [hash, user.id], (err) => {
      if (err) return res.status(500).json({ error: 'Не вдалося змінити пароль.' });
      res.json({ ok: true });
    });
  });
});

// Задачи (Tasks)
app.get('/api/tasks', requireAuth, (req, res) => {
  db.all('SELECT id, text, done FROM tasks WHERE user_id=? ORDER BY id DESC', [req.session.userId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Помилка БД.' });
    res.json({ tasks: (rows || []).map(x => ({ ...x, done: !!x.done })) });
  });
});

app.post('/api/tasks', requireAuth, (req, res) => {
  const text = String(req.body?.text || '').trim();
  if (!text || text.length > 500) return res.status(400).json({ error: 'Некоректний текст завдання.' });

  db.run('INSERT INTO tasks(user_id, text) VALUES(?,?)', [req.session.userId, text], function(err) {
    if (err) return res.status(500).json({ error: 'Помилка БД.' });
    res.json({ ok: true, id: this.lastID });
  });
});

app.patch('/api/tasks/:id', requireAuth, (req, res) => {
  const id = Number(req.params.id);
  db.run('UPDATE tasks SET done=? WHERE id=? AND user_id=?', 
    [req.body?.done ? 1 : 0, id, req.session.userId], 
    (err) => {
      if (err) return res.status(500).json({ error: 'Помилка БД.' });
      res.json({ ok: true });
    }
  );
});

app.delete('/api/tasks/:id', requireAuth, (req, res) => {
  db.run('DELETE FROM tasks WHERE id=? AND user_id=?', [Number(req.params.id), req.session.userId], (err) => {
    if (err) return res.status(500).json({ error: 'Помилка БД.' });
    res.json({ ok: true });
  });
});

// Студенческий билет (Student Card)
app.get('/api/student-card', requireAuth, (req, res) => {
  db.get('SELECT name, group_name as "group", card_num as num FROM student_cards WHERE user_id=?', 
    [req.session.userId], 
    (err, card) => {
      if (err) return res.status(500).json({ error: 'Помилка БД.' });
      res.json({ card: card || null });
    }
  );
});

app.put('/api/student-card', requireAuth, (req, res) => {
  const { name, group, num } = req.body || {};
  if (![name, group, num].every(v => typeof v === 'string' && v.trim()))
    return res.status(400).json({ error: 'Заповніть усі поля.' });

  const sql = `
    INSERT INTO student_cards(user_id, name, group_name, card_num) VALUES(?,?,?,?)
    ON CONFLICT(user_id) DO UPDATE SET name=excluded.name, group_name=excluded.group_name, card_num=excluded.card_num
  `;
  db.run(sql, [req.session.userId, name.trim(), group.trim(), num.trim()], (err) => {
    if (err) return res.status(500).json({ error: 'Помилка БД.' });
    res.json({ ok: true });
  });
});

app.delete('/api/student-card', requireAuth, (req, res) => {
  db.run('DELETE FROM student_cards WHERE user_id=?', [req.session.userId], (err) => {
    if (err) return res.status(500).json({ error: 'Помилка БД.' });
    res.json({ ok: true });
  });
});

// Расписание (Schedule)
app.get('/api/schedule', requireAuth, (req, res) => {
  db.all('SELECT id, week, day, time, name, room FROM schedules WHERE user_id=? ORDER BY day, id', 
    [req.session.userId], 
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Помилка БД.' });
      const schedule = { week1: {}, week2: {} };
      for (const r of rows || []) {
        if (!schedule[r.week]) schedule[r.week] = {};
        if (!schedule[r.week][r.day]) schedule[r.week][r.day] = [];
        schedule[r.week][r.day].push(r);
      }
      res.json({ schedule });
    }
  );
});

app.post('/api/schedule', requireAuth, (req, res) => {
  const { week, day, time, name, room } = req.body || {};
  if (!['week1', 'week2'].includes(week) || !Number.isInteger(day) || day < 0 || day > 5 || !String(name || '').trim()) {
    return res.status(400).json({ error: 'Некоректні дані пари.' });
  }

  db.run('INSERT INTO schedules(user_id, week, day, time, name, room) VALUES(?,?,?,?,?,?)', 
    [req.session.userId, week, day, String(time || '08:30').slice(0, 50), String(name).trim().slice(0, 200), String(room || '').trim().slice(0, 200)], 
    (err) => {
      if (err) return res.status(500).json({ error: 'Помилка БД.' });
      res.json({ ok: true });
    }
  );
});

app.delete('/api/schedule', requireAuth, (req, res) => {
  const { week, day, index } = req.body || {};
  db.all('SELECT id FROM schedules WHERE user_id=? AND week=? AND day=? ORDER BY id', 
    [req.session.userId, week, day], 
    (err, rows) => {
      if (err || !rows || !rows[index]) return res.status(404).json({ error: 'Пару не знайдено.' });

      db.run('DELETE FROM schedules WHERE id=? AND user_id=?', [rows[index].id, req.session.userId], (err) => {
        if (err) return res.status(500).json({ error: 'Помилка БД.' });
        res.json({ ok: true });
      });
    }
  );
});

// Раздача статики (если репозиторий содержит папку public)
app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'public', 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) res.status(404).send('API Server is running.');
  });
});

app.listen(PORT, () => console.log(`Digital University running on port ${PORT}`));
