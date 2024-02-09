import mongoose from 'mongoose';

const TagSchema = new mongoose.Schema({
  tagName: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  businessId: {
    type: Schema.Types.ObjectId,
    ref: 'Business',
  },
  createdDate: {
    type: Date,
    required: true,
  },
});

const Tag = mongoose.model('Tag', TagSchema);

export default Tag;