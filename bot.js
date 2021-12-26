import { Telegraf } from 'telegraf'
import LocalSession from 'telegraf-session-local'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

import replyText from './replyText.js'
import Message from './models/messages.js'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI
const MONGODB_OPTIONS = {useNewUrlParser: true, useUnifiedTopology: true}
const bot = new Telegraf(process.env.BOT_TOKEN)

bot.use((new LocalSession({ database: 'session.json' })).middleware())

bot.start(ctx => {
  if (ctx.startPayload) {
    if (ctx.startPayload == ctx.from.id) {
      return ctx.reply(replyText.recieverYS)
    }

    ctx.session.mode = true
    ctx.session.receiver = ctx.startPayload

    ctx.reply(replyText.try)
  } else {
    ctx.reply(replyText.start + replyText.link.replace('<bot_username>', ctx.botInfo.username).replace('<id>', ctx.from.id))
  }
})

bot.command('link', ctx => ctx.reply('Вот твоя ссылка:\n\n' + replyText.link.replace('<bot_username>', ctx.botInfo.username).replace('<id>', ctx.from.id)))

bot.on('text', async ctx => {
  if (ctx.session.mode === true) {
    ctx.session.mode = false

    console.log(`${ctx.from.id} -> ${ctx.session.receiver} ${ctx.message.text}`)
    const res = await Message.create({from: ctx.from.id, to: ctx.session.receiver, text: ctx.message.text, createdAt: new Date().toISOString()})

    ctx.telegram.sendMessage(ctx.session.receiver, `У вас новое сообщение:\n\n${ctx.message.text}`)
    ctx.reply(replyText.done + 
              replyText.start.replace('Чтобы начать', 'А если ты тоже хочешь') +
              replyText.link.replace('<bot_username>', ctx.botInfo.username).replace('<id>', ctx.from.id)
            )
  } else {
    ctx.reply(replyText.unknownCommand)
  }
})

main()

async function main() {
  try {
    await mongoose.connect(MONGODB_URI, MONGODB_OPTIONS)
    await bot.launch()
    console.log('bot started..')
  } catch (err) {
    console.log(err.message)
  }
}
