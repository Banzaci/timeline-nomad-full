import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const ConversationSchema = new Schema({
  isFromUserId: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  headerId: {
    type: Schema.Types.ObjectId,
    ref: 'header',
    required: true,
  },
  message: {
    type: String
  },
  status: {
    type: String,
    enum: ['unread', 'read', 'deleted', 'updated'],
    default: 'unread'
  },
  createdDate: {
    type: Date,
    default: new Date()
  },
});

const Conversation = mongoose.model('conversation', ConversationSchema);

export default Conversation;