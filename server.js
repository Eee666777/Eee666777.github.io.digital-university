const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// Сервінг статичних файлів із кореневої директорії
app.use(express.static(__dirname));

// Перенаправлення всіх маршрутів на index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Запуск веб-сервера
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
