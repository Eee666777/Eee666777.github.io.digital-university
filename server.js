const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('./config.json');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Токен вашого Discord бота
const TOKEN = 'YOUR_BOT_TOKEN_HERE';

client.once('ready', () => {
    console.log(`[DU Bot] Успішно запущено як ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // Команда !du або !profile
    if (message.content === '!du' || message.content === '!profile') {
        
        // Створення Embed-картки у блакитних тонах
        const profileEmbed = new EmbedBuilder()
            .setColor('#0284c7')
            .setTitle(`🎓 ${config.university.title} — ${config.university.subTitle}`)
            .setDescription(`**Особиста інформація студента**`)
            .addFields(
                { name: '👤 ПІБ', value: config.student.fullName, inline: false },
                { name: '👥 Група', value: config.student.group, inline: true },
                { name: '📚 Курс', value: `${config.student.course}`, inline: true },
                { name: '🪪 Студентський квиток', value: 'Завантажте фото з двох сторін для розпізнавання.', inline: false },
                { name: '📅 Розклад (Тиждень 1)', value: config.schedule.week1.map(s => `• **${s.day}**: ${s.subject} (${s.time})`).join('\n'), inline: false },
                { name: '📊 Статистика системи', value: `Користувачів у системі: **${config.system.totalUsers}**`, inline: false }
            )
            .setFooter({ text: 'DU App • Цифровий університет' })
            .setTimestamp();

        // Кнопки для швидкого переходу
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Telegram')
                    .setStyle(ButtonStyle.Link)
                    .setURL(config.links.telegram)
                    .setEmoji('🟦'),
                new ButtonBuilder()
                    .setLabel('Classroom')
                    .setStyle(ButtonStyle.Link)
                    .setURL(config.links.classroom)
                    .setEmoji('🟩')
            );

        await message.reply({ embeds: [profileEmbed], components: [row] });
    }
});

client.login(TOKEN);
