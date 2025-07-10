// virtual.js

const userHelpState = {}

function startVirtualAssistant(bot, msg) {
  const chatId = msg.chat.id
  userHelpState[chatId] = { step: 'device' }

  bot.sendMessage(chatId, 'Қай құрылғы бойынша көмектесу керек?', {
    reply_markup: {
      keyboard: [['💻 Компьютер', '📱 Телефон'], ['🔙 Артқа']],
      resize_keyboard: true
    }
  })
}

function handleVirtualReply(bot, msg) {
  const chatId = msg.chat.id
  const state = userHelpState[chatId]

  if (!state) return

  // Құрылғы таңдау
  if (state.step === 'device') {
    if (msg.text === '💻 Компьютер') {
      state.device = 'computer'
      state.step = 'pc-help'
      bot.sendMessage(chatId, 'Қандай көмек керек?', {
        reply_markup: {
          keyboard: [['🛠 Программа орнату', '⚙️ Настройка жасау'], ['🌐 Интернет жоқ', '🔙 Артқа']],
          resize_keyboard: true
        }
      })
    } else if (msg.text === '📱 Телефон') {
      state.device = 'phone'
      state.step = 'phone-os'
      bot.sendMessage(chatId, 'Телефон жүйесін таңдаңыз:', {
        reply_markup: {
          keyboard: [['🍏 iOS', '🤖 Android'], ['🔙 Артқа']],
          resize_keyboard: true
        }
      })
    }
  }

  // Компьютер көмегі
  else if (state.step === 'pc-help') {
    const responses = {
      '🛠 Программа орнату': 'Бағдарлама орнату бойынша нұсқаулық: https://kazrex.at.ua/install',
      '⚙️ Настройка жасау': 'Настройка жасау үшін: https://kazrex.at.ua/setup',
      '🌐 Интернет жоқ': 'Интернет ақаулары туралы кеңес: https://kazrex.at.ua/internet'
    }
    if (responses[msg.text]) {
      bot.sendMessage(chatId, responses[msg.text])
      delete userHelpState[chatId]
    }
  }

  // Телефон жүйесі
  else if (state.step === 'phone-os') {
    const responses = {
      '🍏 iOS': 'iPhone үшін көмек парағы: https://kazrex.at.ua/ios',
      '🤖 Android': 'Android көмегі: https://kazrex.at.ua/android'
    }
    if (responses[msg.text]) {
      bot.sendMessage(chatId, responses[msg.text])
      delete userHelpState[chatId]
    }
  }

  // Артқа оралу
  if (msg.text === '🔙 Артқа') {
    delete userHelpState[chatId]
    bot.sendMessage(chatId, '🔙 Басты мәзірге оралдыңыз.', {
      reply_markup: {
        keyboard: [['📚 Жобалар', '🤝 Байланыс'], ['ℹ️ Біз туралы']],
        resize_keyboard: true
      }
    })
  }
}

module.exports = { startVirtualAssistant, handleVirtualReply }
