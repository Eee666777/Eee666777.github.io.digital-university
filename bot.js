require('dotenv').config();
const { 
    Client, 
    GatewayIntentBits, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle 
} = require('discord.js');
const config = require('./config.json');

// Отримання токена зі змінних оточення
const TOKEN = process.env.DISCORD_TOKEN;

// Перевірка наявності токена
if (!TOKEN) {
    console.error('❌ ПОМИЛКА: Змінна DISCORD_TOKEN відсутня!');
    process.exit(1);
}

// Ініціалізація клієнта Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Подія запуску бота
client.once('ready', () => {
    console.log(`=================================`);
    console.log(`🤖 Бот успішно запущений: ${client.user.tag}`);
    console.log(`🎓 Система: ${config.university.title} (${config.university.subTitle})`);
    console.log(`=================================`);
});

// Подія отримання повідомлення
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const command = message.content.toLowerCase().trim();

    // Команда !du або !profile
    if (command === '!du' || command === '!profile') {
        const profileEmbed = new EmbedBuilder()
            .setColor('#0284c7')
            .setTitle(`🎓 ${config.university.title} — ${config.university.subTitle}`)
            .setDescription(`**Особиста інформація студента**`)
            .addFields(
                { name: '👤 ПІБ', value: config.student.fullName, inline: false },
                { name: '👥 Група', value: config.student.group, inline: true },
                { name: '📚 Курс', value: `${config.student.course}`, inline: true },
                { name: '🪪 Студентський квиток', value: 'Завантажте фото з двох сторін для розпізнавання.', inline: false },
                { 
                    name: '📅 Розклад (Тиждень 1)', 
                    value: config.schedule.week1.map(s => `• **${s.day}**: ${s.subject} (${s.time})`).join('\n'), 
                    inline: false 
                },
                { 
                    name: '📊 Статистика системи', 
                    value: `Всього у системі: **${config.system.totalUsers} користувачів** + Адмін`, 
                    inline: false 
                }
            )
            .setFooter({ text: 'DU App • Цифровий університет' })
            .setTimestamp();

        // Кнопки посилань
        const buttonsRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Telegram')
                    .setStyle(ButtonStyle.Link)
                    .setURL(config.links.telegram),
                new ButtonBuilder()
                    .setLabel('Classroom')
                    .setStyle(ButtonStyle.Link)
                    .setURL(config.links.classroom)
            );

        await message.reply({ embeds: [profileEmbed], components: [buttonsRow] });
    }

    // Допоміжна команда !help
    if (command === '!help') {
        await message.reply('📋 **Доступні команди:**\n`!du` або `!profile` — відкрити картку студента та розклад.');
    }
});

// Авторизація бота
client.login(TOKEN).catch(err => {
    console.error('❌ Не вдалося авторизувати бота в Discord:', err.message);
    process.exit(1);
});
