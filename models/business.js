import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const BusinessSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    maxlength: 60,
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  avatar: {
    type: String,
  },
  country: {
    type: String,
  },
  city: {
    type: String,
  },
  createdDate: {
    type: Date,
    required: true,
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

const Business = mongoose.model('Business', BusinessSchema);

export default Business;