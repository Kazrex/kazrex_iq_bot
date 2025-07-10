// admin.js

function handleAdminCommands(bot, msg) {
  const chatId = msg.chat.id
  const text = msg.text

  if (text === '/stats') {
    return bot.sendMessage(chatId, '📊 Статистика функциясы кейін қосылады.')
  }

  if (text === '/adminhelp') {
    return bot.sendMessage(chatId, `🔐 Админ пәрмендері:
/stats – статистиканы көру
/adminhelp – көмек`)
  }

  return bot.sendMessage(chatId, '⚠️ Белгісіз админ пәрмені.')
}

module.exports = { handleAdminCommands }
