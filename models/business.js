import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const BusinessSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true,
  },
  fullname: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    maxlength: 60,
  },
  coordinates: {
    type: Object,
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  avatar: {
    type: String,
  },
  createdDate: {
    type: Date,
    default: new Date()
  },
  tags: {
    type: Array,
    default: []
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'deleted', 'banned'],
    default: 'pending'
  },
  role: {
    type: String,
    enum: ['company', 'paid'],
    default: 'company'
  }
});

BusinessSchema.methods.comparePassword = async function (password) {
  const matching = await bcrypt.compare(password, this.password);
  return matching
};

const Business = mongoose.model('business', BusinessSchema);

export default Business;