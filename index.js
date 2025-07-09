require('dotenv').config()
const TelegramBot = require('node-telegram-bot-api')

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true })

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, `Сәлем, ${msg.from.first_name}! IQ тестін бастау үшін /iq басыңыз немесе сайтымызға өту үшін /visit басыңыз.`);
});

bot.onText(/\/visit/, (msg) => {
  const opts = {
    reply_markup: {
      inline_keyboard: [[{ text: "🌐 Сайтқа өту", url: "https://kazrex.at.ua" }]]
    }
  };
  bot.sendMessage(msg.chat.id, "Біздің ресми сайт:", opts);
});

let iqQuestions = [
  { q: "1. 2 + 2 = ?", a: "4" },
  { q: "2. Күн шығыстан шыға ма, әлде батыстан ба?", a: "шығыстан" },
  { q: "3. 5 * 6 = ?", a: "30" },
  { q: "4. Қазақтың астанасы қай қала?", a: "астана" },
  { q: "5. Бір жылда неше ай бар?", a: "12" }
];

let userProgress = {};

bot.onText(/\/iq/, (msg) => {
  userProgress[msg.chat.id] = { index: 0, score: 0 };
  bot.sendMessage(msg.chat.id, "🧠 IQ тест басталды!\n" + iqQuestions[0].q);
});

bot.on("message", (msg) => {
  const id = msg.chat.id;
  const text = msg.text.trim().toLowerCase();

  if (!userProgress[id] || text.startsWith("/")) return;

  let user = userProgress[id];
  let current = iqQuestions[user.index];

  if (text === current.a) user.score++;

  user.index++;

  if (user.index < iqQuestions.length) {
    bot.sendMessage(id, iqQuestions[user.index].q);
  } else {
    bot.sendMessage(id, `✅ Тест аяқталды!\nНәтиже: ${user.score} / ${iqQuestions.length}`);
    delete userProgress[id];
  }
});
