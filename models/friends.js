import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const FriendsSchema = new mongoose.Schema({
  senderId: { // Person who ask
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiverId: {// Person who has been asked
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdDate: {
    type: Date,
    default: new Date(),
    required: true,
  },
});

const Friends = mongoose.model('friends', FriendsSchema);

export default Friends;