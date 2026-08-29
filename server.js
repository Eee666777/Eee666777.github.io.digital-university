const express = require('express');
const path = require('path');

const app = express();

// Динамічний порт для хостингу (Render, Railway тощо)
const PORT = process.env.PORT || 3000;

// Middleware для обробки JSON та URL-encoded даних
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Обслуговування статичних файлів із папки public (якщо є)
app.use(express.static(path.join(__dirname, 'public')));

// Головний маршрут: віддає index.html
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, 'public', 'index.html');
    
    // Якщо файл index.html існує у папці public, відправляємо його
    res.sendFile(indexPath, (err) => {
        if (err) {
            // Якщо index.html відсутній у папці public, шукаємо у корінні
            res.sendFile(path.join(__dirname, 'index.html'), (err2) => {
                if (err2) {
                    // Якщо HTML-файлу немає, віддаємо текстове вітання
                    res.status(200).send('<h1>Server is running!</h1><p>Додайте index.html у проєкт.</p>');
                }
            });
        }
    });
});

// Ендпоінт перевірки стану сервера (Health Check)
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// Обробка неіснуючих маршрутів (404)
app.use((req, res) => {
    res.status(404).send('<h1>404: Сторінку не знайдено</h1>');
});

// Глобальна обробка помилок (запобігає падінню сервера)
app.use((err, req, res, next) => {
    console.error('Помилка сервера:', err.stack);
    res.status(500).send('<h1>500: Внутрішня помилка сервера</h1>');
});

// Запуск сервера на 0.0.0.0 для коректної роботи у контейнерах Docker / Cloud
app.listen(PORT, '0.0.0.0', () => {
    console.log(`[OK] Сервер успішно запущено на порту ${PORT}`);
});
