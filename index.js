require('dotenv').config()
const TelegramBot = require('node-telegram-bot-api')
const { startIQTest, handleIQAnswer } = require('./iq')
const { startVirtualAssistant, handleVirtualReply } = require('./virtual') // 👈 Осы жолды үстіне көшірдік

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true })
console.log('✅ Kazrex бот іске қосылды!')

const state = {}

bot.onText(/\/start/, (msg) => {
  const name = msg.from.first_name || 'қонақ'
  const welcome = `Сәлем, *${name}*!\n\n🤖 *KazRex Assistant* ботқа қош келдің!\n\nМүмкіндіктер:\n- 🧠 IQ тест\n- 🧬 Шежіре генераторы\n- 📞 Виртуалды көмекші\n\nТөмендегі мәзірден таңдаңыз:`

  bot.sendMessage(msg.chat.id, welcome, {
    parse_mode: 'Markdown',
    reply_markup: {
      keyboard: [
        ['📚 Жобалар', '🤝 Байланыс'],
        ['ℹ️ Біз туралы']
      ],
      resize_keyboard: true
    }
  })
})

bot.on('message', (msg) => {
  const text = msg.text
  const chatId = msg.chat.id

  // IQ жауаптарын өңдеу
  if (state[chatId]) {
    return handleIQAnswer(bot, msg, state)
  }

  // Виртуалды көмекші логикасы
  handleVirtualReply(bot, msg)

  // Мәзір логикасы
  switch (text) {
    case '📚 Жобалар':
      bot.sendMessage(chatId, 'Біздің жобалар:\n\n🧠 IQ тест\n🌳 Шежіре генераторы', {
        reply_markup: {
          keyboard: [
            ['🧠 IQ тесті бастау', '🌳 Шежіре генераторы'],
            ['🔙 Артқа']
          ],
          resize_keyboard: true
        }
      })
      break

    case '🧠 IQ тесті бастау':
      startIQTest(bot, msg, state)
      break

    case '🌳 Шежіре генераторы':
      bot.sendMessage(chatId, '🔗 Шежіре құралы: https://kazrex.github.io/shezhire', {
        reply_markup: {
          keyboard: [['🔙 Артқа']],
          resize_keyboard: true
        }
      })
      break

    case '🤝 Байланыс':
      bot.sendMessage(chatId, 'Байланыс түрін таңдаңыз:', {
        reply_markup: {
          keyboard: [
            ['📞 Виртуалды оператор'],
            ['🔙 Артқа']
          ],
          resize_keyboard: true
        }
      })
      break

    case '📞 Виртуалды оператор':
      startVirtualAssistant(bot, msg)
      break

    case 'ℹ️ Біз туралы':
      bot.sendMessage(chatId, `*KazRex Assistant* — қолданушыларға көмек көрсететін интеллектуалды көмекші.\n\nЖобаларымыз: https://github.com/Kazrex`, {
        parse_mode: 'Markdown'
      })
      break

    case '🔙 Артқа':
      bot.sendMessage(chatId, '🔙 Басты мәзірге қайттық.', {
        reply_markup: {
          keyboard: [
            ['📚 Жобалар', '🤝 Байланыс'],
            ['ℹ️ Біз туралы']
          ],
          resize_keyboard: true
        }
      })
      break

    default:
      bot.sendMessage(chatId, 'Сұрағыңызды нақтырақ жазыңыз немесе мәзірден таңдаңыз.')
  }
})

// Render портына тыңдау
const PORT = process.env.PORT || 3000
require('http').createServer().listen(PORT, () => {
  console.log(`🌐 Server is running on port ${PORT}`)
})

