import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  receiverId: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['unread', 'read', 'deleted', 'updated'],
    default: 'unread'
  },
  createdDate: {
    type: Date,
    default: new Date().getTime()
  },
});

const Conversation = mongoose.model('messages', MessageSchema);

export default Conversation;