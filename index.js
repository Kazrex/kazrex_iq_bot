require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { startIQTest, handleIQAnswer } = require('./iq');
const { logHelpRequest } = require('./sheets');
const { handleAdminCommands } = require('./admin');
const fs = require('fs');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
console.log("✅ KazRex бот іске қосылды!");

const helpState = {};
const userMenuState = {};
const iqState = {};

const projects = JSON.parse(fs.readFileSync('projects.json', 'utf-8'));

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  userMenuState[chatId] = null;
  iqState[chatId] = null;

  const text = `🤖 Сәлем, ${msg.from.first_name || 'досым'}!  
🧠 KazRex ботқа қош келдің.

Мына мәзірден таңда:`;

  bot.sendMessage(chatId, text, {
    reply_markup: {
      keyboard: [
        ['📚 Жобалар', '🤝 Байланыс'],
        ['ℹ️ Біз туралы']
      ],
      resize_keyboard: true
    }
  });
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // 🔐 Админ пәрмендері
  const isAdmin = msg.from.id.toString() === process.env.ADMIN_ID;
  if (isAdmin && text.startsWith('/')) {
    return handleAdminCommands(bot, msg);
  }

  // IQ тест логикасы
  if (iqState[chatId]) {
    return handleIQAnswer(bot, msg, iqState);
  }

  // 🔙 Артқа
  if (text === '🔙 Артқа') {
    helpState[chatId] = null;
    iqState[chatId] = null;
    return bot.sendMessage(chatId, 'Басты мәзірге оралдыңыз:', {
      reply_markup: {
        keyboard: [
          ['📚 Жобалар', '🤝 Байланыс'],
          ['ℹ️ Біз туралы']
        ],
        resize_keyboard: true
      }
    });
  }

  // Жобалар
  if (text === '📚 Жобалар') {
    const projectButtons = projects.map(p => [p.name]);
    return bot.sendMessage(chatId, 'Қызықты жоба таңдаңыз:', {
      reply_markup: {
        keyboard: [...projectButtons, ['🔙 Артқа']],
        resize_keyboard: true
      }
    });
  }

  const project = projects.find(p => p.name === text);
  if (project) {
    return bot.sendMessage(chatId, `📂 ${project.name}\n${project.description}\n🔗 ${project.link}`);
  }

  // Байланыс
  if (text === '🤝 Байланыс') {
    return bot.sendMessage(chatId, 'Қажетті бөлімді таңдаңыз:', {
      reply_markup: {
        keyboard: [
          ['🗣 Көмек сұрау', '📞 Контакт'],
          ['🔙 Артқа']
        ],
        resize_keyboard: true
      }
    });
  }

  if (text === '📞 Контакт') {
    return bot.sendMessage(chatId, `📞 Байланыс үшін:\n@kazrex_admin\n🌐 https://kazrex.at.ua`);
  }

  // Көмек сұрау
  if (text === '🗣 Көмек сұрау') {
    helpState[chatId] = { stage: 'device' };
    return bot.sendMessage(chatId, 'Қай құрылғы бойынша көмек керек?', {
      reply_markup: {
        keyboard: [['💻 Компьютер', '📱 Телефон'], ['🔙 Артқа']],
        resize_keyboard: true
      }
    });
  }

  if (helpState[chatId]?.stage === 'device') {
    if (text === '💻 Компьютер') {
      helpState[chatId].device = 'Компьютер';
      helpState[chatId].stage = 'pc';
      return bot.sendMessage(chatId, 'Компьютерге қатысты қандай көмек керек?', {
        reply_markup: {
          keyboard: [['🧩 Программа орнату', '⚙️ Настройка жасау'], ['🌐 Интернет проблемасы'], ['🔙 Артқа']],
          resize_keyboard: true
        }
      });
    }
    if (text === '📱 Телефон') {
      helpState[chatId].device = 'Телефон';
      helpState[chatId].stage = 'phone';
      return bot.sendMessage(chatId, 'Қай жүйе бойынша көмек керек?', {
        reply_markup: {
          keyboard: [['🍏 iOS', '🤖 Android'], ['🔙 Артқа']],
          resize_keyboard: true
        }
      });
    }
  }

  const helpOptions = {
    '🧩 Программа орнату': 'Программа орнату',
    '⚙️ Настройка жасау': 'Настройка жасау',
    '🌐 Интернет проблемасы': 'Интернет проблемасы',
    '🍏 iOS': 'iOS көмек',
    '🤖 Android': 'Android көмек'
  };

  if (helpState[chatId] && helpOptions[text]) {
    const request = {
      user: `${msg.from.username || msg.from.first_name}`,
      device: helpState[chatId].device || 'Белгісіз',
      issue: helpOptions[text],
      time: new Date().toLocaleString()
    };

    await logHelpRequest(request);
    delete helpState[chatId];

    return bot.sendMessage(chatId, `✅ "${request.issue}" бойынша көмегіңіз тіркелді.`);
  }

  // IQ тест
  if (text === '🧠 IQ тест') {
    return startIQTest(bot, msg, iqState);
  }

  // Біз туралы
  if (text === 'ℹ️ Біз туралы') {
    return bot.sendMessage(chatId, `
🧠 *KazRex – Ақыл мен кодтың тоғысы*

Біз – интеллектуалдық және ұлттық мазмұндағы веб жобалармен айналысатын шағын команда.

📍 Мақсатымыз – қазақша сапалы цифрлық өнімдер ұсыну  
🛠 Құрылтайшы: *Kazrex*  
🌐 Сайт: https://kazrex.at.ua
`, { parse_mode: "Markdown" });
  }
});
