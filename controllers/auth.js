import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/user.js';

export const register = async (req, res, next) => {
  const { fullName, password, email } = req.body;
  console.log(fullName, password, email)
  try {
    const findUser = await User.findOne({ email });
    if (findUser) {
      return res.status(401).json({ message: 'A user with this email already exist' });
    }
    if (!password) {
      return res.status(401).json({ message: 'Enter a password' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ fullname: fullName, email, password: hashedPassword });
    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: '48 hour'
    });
    res.json(token);
  } catch (error) {
    console.log(error)
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const passwordMatch = await user.comparePassword(password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: '48 hour'
    });
    res.json(token);
  } catch (error) {
    next(error);
  }
};

