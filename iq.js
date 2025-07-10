// iq.js

const questions = [
  {
    question: '1. Екі, төрт, сегіз... Келесі сан қандай?',
    options: ['10', '12', '14', '16'],
    correct: 3
  },
  {
    question: '2. Қайсысы артық: алма, алмұрт, банан, картоп?',
    options: ['алма', 'алмұрт', 'банан', 'картоп'],
    correct: 3
  },
  {
    question: '3. 3 + 3 x 3 = ?',
    options: ['18', '12', '9', '15'],
    correct: 2
  },
  {
    question: '4. Жеті күнде неше дүйсенбі болуы мүмкін?',
    options: ['1', '2', '7', '0'],
    correct: 0
  },
  {
    question: '5. Бір жылда неше ай 30 күннен тұрады?',
    options: ['4', '6', '11', '12'],
    correct: 2
  }
]

function startIQTest(bot, msg, state) {
  const chatId = msg.chat.id
  state[chatId] = {
    current: 0,
    score: 0
  }
  sendQuestion(bot, chatId, state)
}

function sendQuestion(bot, chatId, state) {
  const test = state[chatId]
  const q = questions[test.current]

  bot.sendMessage(chatId, `*${q.question}*`, {
    parse_mode: 'Markdown',
    reply_markup: {
      keyboard: [
        [q.options[0], q.options[1]],
        [q.options[2], q.options[3]],
        ['🔙 Артқа']
      ],
      resize_keyboard: true
    }
  })
}

function handleIQAnswer(bot, msg, state) {
  const chatId = msg.chat.id
  const test = state[chatId]
  const q = questions[test.current]
  const answerIndex = q.options.indexOf(msg.text)

  if (answerIndex === -1) return // басқа жауап келсе өткізіп жібер

  if (answerIndex === q.correct) test.score++
  test.current++

  if (test.current < questions.length) {
    sendQuestion(bot, chatId, state)
  } else {
    const result = test.score
    const percent = Math.round((result / questions.length) * 100)
    let comment = ''
    if (percent >= 90) comment = '🔥 Өте жоғары интеллект!'
    else if (percent >= 70) comment = '👍 Жақсы нәтиже'
    else if (percent >= 50) comment = '🙂 Орташа деңгей'
    else comment = '🤔 Тағы да байқап көр'

    bot.sendMessage(chatId, `🧠 IQ тест аяқталды!
Сенің нәтижең: *${result}/${questions.length}* (${percent}%)
${comment}`, {
      parse_mode: 'Markdown',
      reply_markup: {
        keyboard: [
          ['📚 Жобалар', '🤝 Байланыс'],
          ['ℹ️ Біз туралы']
        ],
        resize_keyboard: true
      }
    })
    delete state[chatId]
  }
}

module.exports = { startIQTest, handleIQAnswer }
