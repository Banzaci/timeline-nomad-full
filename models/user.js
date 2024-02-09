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
  gender: {
    type: String,
  },
  country: {
    type: String,
  },
  city: {
    type: String,
  },
  dateOfBirth: {
    type: Number,
  },
  createdDate: {
    type: Date,
    default: new Date()
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'deleted', 'banned'],
    default: 'pending'
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'paid'],
    default: 'user'
  }
});

UserSchema.methods.comparePassword = async function (password) {
  const matching = await bcrypt.compare(password, this.password);
  return matching
};

const User = mongoose.model('User', UserSchema);

export default User;