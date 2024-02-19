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

    const { type, fullname, gender, email, country, status, role, avatar, dateOfBirth, tags, company } = user;

    if (type === 'business') {
      req.user = {
        id: user.id,
        fullname,
        type,
        email,
        country,
        status,
        role,
        avatar,
        tags,
        company
      };
    } else if (type === 'user') {
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
    }
    next();
  } catch (error) {
    console.log(error)
    res.status(401).json({ message: 'Invalid token' });
  }
};
