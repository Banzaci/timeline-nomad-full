import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const HeaderSchema = new Schema({
  ownerUserId: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  receiverUserId: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  subject: {
    type: Schema.Types.ObjectId,
    type: String,
    required: true,
  },
  status: {
    type: Date,
    enum: ['inbox', 'outbox'],
    default: 'inbox',
  },
  createdDate: {
    type: Date,
    default: new Date()
  },
});

const Header = mongoose.model('header', HeaderSchema);

export default Header;