import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const NotificationsSchema = new mongoose.Schema({
  createdDate: {
    type: Date,
    default: new Date(),
    required: true,
  },
  lastUpdated: {
    type: Date,
    required: true,
  },
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiverId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'blocked'],
    default: 'pending'
  },
});

const Friends = mongoose.model('notification', NotificationsSchema);

export default Notifications;