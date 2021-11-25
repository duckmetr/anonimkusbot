import { Telegraf } from 'telegraf'
import replyText from './replyText.js'
import dotenv from 'dotenv'

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

await bot.launch()
console.log('bot started..')