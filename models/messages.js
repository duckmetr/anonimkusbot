import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
  from: Number,
  to: Number,
  text: String,
  createdAt: {type: Date, default: new Date()}
})

const Message = mongoose.model('messages', messageSchema)

export default Message