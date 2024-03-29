import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/user.js';

const emailRegex = new RegExp(/^[A-Za-z0-9_!#$%&'*+\/=?`{|}~^.-]+@[A-Za-z0-9.-]+$/, "gm");
const checkIfValidEmail = (email) => emailRegex.test(email);

const insertUserAndCreateToken = async (fullname, email, password, type, company) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ fullname, email, password: hashedPassword, type, company });
  await user.save();
  const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
    expiresIn: '48 hour'
  });
  return token;
}

export const register = async (req, res, next) => {
  const { fullname, password, email } = req.body;
  try {
    // const response = await axios.post(
    //   `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.CAPTCHA_PRIVATE_KEY}&response=${token}`
    // );
    // if (response.data.success) {
    const findUser = await User.findOne({ email });
    if (findUser) {
      return res.status(401).json({ message: 'A user with this email already exist' });
    }
    if (!password) {
      return res.status(401).json({ message: 'Enter a password' });
    }
    if (!checkIfValidEmail(email)) {
      return res.status(401).json({ message: 'Un-valid email' });
    }
    const token = insertUserAndCreateToken(fullname, email, password, 'user');
    res.json({ token, page: '/profile' });
    // } else {
    //   res.send("Robot 🤖");
    // }
  } catch (error) {
    console.log(error)
    next(error);
  }
};

export const registerBusiness = async (req, res, next) => {
  const { company, fullname, password, email } = req.body;
  try {
    // const response = await axios.post(
    //   `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.CAPTCHA_PRIVATE_KEY}&response=${token}`
    // );
    // if (response.data.success) {
    const findUser = await User.findOne({ email });
    if (findUser) {
      return res.status(401).json({ message: 'A user with this email already exist' });
    }
    if (!password) {
      return res.status(401).json({ message: 'Enter a password' });
    }
    if (!checkIfValidEmail(email)) {
      return res.status(401).json({ message: 'Un-valid email' });
    }
    const token = insertUserAndCreateToken(fullname, email, password, 'business', company);
    res.json({ token, page: '/profile' });
    // } else {
    //   res.send("Robot 🤖");
    // }
  } catch (error) {
    console.log(error)
    next(error);
  }
};
const types = ['user', 'business']

export const login = async (req, res, next) => {
  try {
    const { email, password, type } = req.body;

    if (!types.includes(type)) {
      return res.status(404).json({ message: 'User type not found' });
    }

    const user = await User.findOne({ email, type });

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
    res.json({ token, page: '/profile' });
  } catch (error) {
    next(error);
  }
};

