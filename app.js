// import http from 'http'
import { Telegraf } from 'telegraf'
import LocalSession from 'telegraf-session-local'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

import replyText from './replyText.js'
import Message from './models/messages.js'

dotenv.config()

// const PORT = process.env.PORT || 5000
const MONGODB_URI = process.env.MONGODB_URI
const MONGODB_OPTIONS = {useNewUrlParser: true, useUnifiedTopology: true}
const bot = new Telegraf(process.env.TG_TOKEN)

bot.use((new LocalSession({ database: 'session.json' })).middleware())

bot.start(ctx => {
  if (ctx.startPayload) {
    ctx.session.mode = true
    ctx.session.receiver = ctx.startPayload

    ctx.reply(replyText.try)
  } else {
    ctx.reply(replyText.start.replace('<id>', ctx.from.id))
  }
})

bot.on('text', async ctx => {
  if (ctx.session.mode === true) {
    ctx.session.mode = false

    console.log(`${ctx.from.id} -> ${ctx.session.receiver} ${ctx.message.text}`)
    const res = await Message.create({from: ctx.from.id, to: ctx.session.receiver, text: ctx.message.text, createdAt: new Date().toISOString()})

    ctx.telegram.sendMessage(ctx.session.receiver, `У вас новое сообщение:\n\n${ctx.message.text}`)
    ctx.reply(replyText.done)
  } else {
    ctx.reply(replyText.unknownCommand)
  }
})

// http
//   .createServer()
//   .listen(PORT)
//   .on('request', res => res.end(''))

await mongoose.connect(MONGODB_URI, MONGODB_OPTIONS)
await bot.launch()
console.log('bot started..')