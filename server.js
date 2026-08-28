const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const db = new Database(process.env.DB_PATH || path.join(__dirname, 'university.db'));

db.pragma('journal_mode = WAL');
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  secret_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  text TEXT NOT NULL,
  done INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS student_cards (
  user_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  group_name TEXT NOT NULL,
  card_num TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
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

app.use(express.json({ limit: '100kb' }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'CHANGE_THIS_IN_PRODUCTION',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
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

app.post('/api/register', async (req, res) => {
  try {
    const { username, password, secret } = req.body || {};
    if (!validUsername(username)) return res.status(400).json({ error: 'Логін: 3–32 символи, тільки літери, цифри, _ . -' });
    if (typeof password !== 'string' || password.length < 6) return res.status(400).json({ error: 'Пароль має містити щонайменше 6 символів.' });
    if (typeof secret !== 'string' || secret.length < 2) return res.status(400).json({ error: 'Введіть секретне слово.' });

    const exists = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (exists) return res.status(409).json({ error: 'Користувач з таким логіном вже існує.' });

    const passwordHash = await bcrypt.hash(password, 12);
    const secretHash = await bcrypt.hash(secret.toLowerCase(), 12);
    db.prepare('INSERT INTO users (username,password_hash,secret_hash) VALUES (?,?,?)')
      .run(username, passwordHash, secretHash);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Не вдалося створити акаунт.' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username || '');
    if (!user || !(await bcrypt.compare(password || '', user.password_hash))) {
      return res.status(401).json({ error: 'Невірний логін або пароль.' });
    }
    req.session.userId = user.id;
    req.session.username = user.username;
    res.json({ ok: true, user: { id: user.id, username: user.username } });
  } catch {
    res.status(500).json({ error: 'Помилка входу.' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get('/api/me', (req, res) => {
  if (!req.session.userId) return res.json({ user: null });
  res.json({ user: { id: req.session.userId, username: req.session.username } });
});

app.post('/api/reset-password', async (req, res) => {
  try {
    const { username, secret, newPassword } = req.body || {};
    if (typeof newPassword !== 'string' || newPassword.length < 6)
      return res.status(400).json({ error: 'Новий пароль має містити щонайменше 6 символів.' });

    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username || '');
    if (!user || !(await bcrypt.compare((secret || '').toLowerCase(), user.secret_hash)))
      return res.status(400).json({ error: 'Невірне секретне слово або користувача не знайдено.' });

    const hash = await bcrypt.hash(newPassword, 12);
    db.prepare('UPDATE users SET password_hash=? WHERE id=?').run(hash, user.id);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Не вдалося змінити пароль.' });
  }
});

app.get('/api/tasks', requireAuth, (req, res) => {
  const rows = db.prepare('SELECT id,text,done FROM tasks WHERE user_id=? ORDER BY id DESC').all(req.session.userId);
  res.json({ tasks: rows.map(x => ({ ...x, done: !!x.done })) });
});

app.post('/api/tasks', requireAuth, (req, res) => {
  const text = String(req.body?.text || '').trim();
  if (!text || text.length > 500) return res.status(400).json({ error: 'Некоректний текст завдання.' });
  const result = db.prepare('INSERT INTO tasks(user_id,text) VALUES(?,?)').run(req.session.userId, text);
  res.json({ ok: true, id: result.lastInsertRowid });
});

app.patch('/api/tasks/:id', requireAuth, (req, res) => {
  const id = Number(req.params.id);
  db.prepare('UPDATE tasks SET done=? WHERE id=? AND user_id=?')
    .run(req.body?.done ? 1 : 0, id, req.session.userId);
  res.json({ ok: true });
});

app.delete('/api/tasks/:id', requireAuth, (req, res) => {
  db.prepare('DELETE FROM tasks WHERE id=? AND user_id=?').run(Number(req.params.id), req.session.userId);
  res.json({ ok: true });
});

app.get('/api/student-card', requireAuth, (req, res) => {
  const c = db.prepare('SELECT name,group_name as "group",card_num as num FROM student_cards WHERE user_id=?')
    .get(req.session.userId);
  res.json({ card: c || null });
});

app.put('/api/student-card', requireAuth, (req, res) => {
  const { name, group, num } = req.body || {};
  if (![name, group, num].every(v => typeof v === 'string' && v.trim()))
    return res.status(400).json({ error: 'Заповніть усі поля.' });
  db.prepare(`
    INSERT INTO student_cards(user_id,name,group_name,card_num) VALUES(?,?,?,?)
    ON CONFLICT(user_id) DO UPDATE SET name=excluded.name,group_name=excluded.group_name,card_num=excluded.card_num
  `).run(req.session.userId, name.trim(), group.trim(), num.trim());
  res.json({ ok: true });
});

app.delete('/api/student-card', requireAuth, (req, res) => {
  db.prepare('DELETE FROM student_cards WHERE user_id=?').run(req.session.userId);
  res.json({ ok: true });
});

app.get('/api/schedule', requireAuth, (req, res) => {
  const rows = db.prepare('SELECT id,week,day,time,name,room FROM schedules WHERE user_id=? ORDER BY day,id')
    .all(req.session.userId);
  const schedule = { week1: {}, week2: {} };
  for (const r of rows) {
    if (!schedule[r.week]) schedule[r.week] = {};
    if (!schedule[r.week][r.day]) schedule[r.week][r.day] = [];
    schedule[r.week][r.day].push(r);
  }
  res.json({ schedule });
});

app.post('/api/schedule', requireAuth, (req, res) => {
  const { week, day, time, name, room } = req.body || {};
  if (!['week1','week2'].includes(week) || !Number.isInteger(day) || day < 0 || day > 5 ||
      !String(name || '').trim()) {
    return res.status(400).json({ error: 'Некоректні дані пари.' });
  }
  db.prepare('INSERT INTO schedules(user_id,week,day,time,name,room) VALUES(?,?,?,?,?,?)')
    .run(req.session.userId, week, day, String(time || '08:30').slice(0,50),
         String(name).trim().slice(0,200), String(room || '').trim().slice(0,200));
  res.json({ ok: true });
});

app.delete('/api/schedule', requireAuth, (req, res) => {
  const { week, day, index } = req.body || {};
  const rows = db.prepare('SELECT id FROM schedules WHERE user_id=? AND week=? AND day=? ORDER BY id')
    .all(req.session.userId, week, day);
  if (!rows[index]) return res.status(404).json({ error: 'Пару не знайдено.' });
  db.prepare('DELETE FROM schedules WHERE id=? AND user_id=?').run(rows[index].id, req.session.userId);
  res.json({ ok: true });
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, () => console.log(`Digital University running on port ${PORT}`));
