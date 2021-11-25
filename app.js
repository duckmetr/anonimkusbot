import http from 'http'
import { Telegraf } from 'telegraf'
import dotenv from 'dotenv'
import replyText from './replyText.js'

dotenv.config()

const bot = new Telegraf(process.env.TG_TOKEN)
let mode = false
let sender

bot.start(ctx => {
  const id = ctx.update.message.text.split(' ')[1]
 
  if (id) {
    mode = true
    sender = id
    ctx.reply(replyText.try)
  } else {
    ctx.reply(replyText.start.replace('*id*', ctx.from.id))
  }
})

bot.on('text', ctx => {
  if (mode === true) {
    mode = false
    console.log(`${ctx.from.id} -> ${sender} ${ctx.message.text}`)
    ctx.telegram.sendMessage(sender, `У вас новое сообщение:\n\n${ctx.message.text}`)
    ctx.reply(replyText.done)
  } else {
    ctx.reply(replyText.unknownCommand)
  }
})

http
  .createServer()
  .listen(process.env.PORT || 5000)
  .on('request', res => res.end(''))

await bot.launch()
console.log('bot started..')