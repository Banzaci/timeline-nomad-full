import jwt from 'jsonwebtoken';
import User from '../models/user.js';

export default async function (req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(decodedToken.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { fullname, gender, email, country, status, role, avatar, dateOfBirth, tags } = user;

    req.user = {
      id: user.id,
      fullname,
      gender,
      email,
      country,
      status,
      role,
      avatar,
      dateOfBirth,
      tags
    };

    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
