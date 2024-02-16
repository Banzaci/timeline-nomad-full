import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const UserSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  avatar: {
    type: String,
  },
  gender: {
    type: String,
  },
  country: {
    type: String,
  },
  dateOfBirth: {
    type: Number,
  },
  createdDate: {
    type: Date,
    default: new Date()
  },
  lastUpdated: {
    type: Date,
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
    enum: ['user', 'admin', 'paid', 'test'],
    default: 'test' // måste ändras
  }
});

UserSchema.methods.comparePassword = async function (password) {
  const matching = await bcrypt.compare(password, this.password);
  return matching
};

const User = mongoose.model('users', UserSchema);

export default User;