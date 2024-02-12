import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const FriendsSchema = new mongoose.Schema({
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

const Friends = mongoose.model('friends', FriendsSchema);

export default Friends;