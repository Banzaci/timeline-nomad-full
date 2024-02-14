import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const FriendRequestsSchema = new mongoose.Schema({
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
  lastUpdated: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'blocked'],
    default: 'pending'
  },
});

const FriendRequests = mongoose.model('friendrequests', FriendRequestsSchema);

export default FriendRequests;