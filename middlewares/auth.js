import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import Business from '../models/business.js';

export default async function (req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const [a, b] = token.split('__');

    if (!a || !b) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decodedToken = jwt.verify(b, process.env.SECRET_KEY);

    if (a === 'user') {
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
    } else if (a === 'business') {
      const user = await Business.findById(decodedToken.businessId);
      console.log('decodedToken.businessId')
      if (!user) {
        return res.status(404).json({ message: 'Business not found' });
      }

      const { fullname, company, coordinates, email, status, role, avatar, tags } = user;

      req.user = {
        id: user.id,
        fullname,
        company,
        coordinates,
        email,
        status,
        role,
        avatar,
        tags
      };

      console.log('decodedToken.businessId')
      next();
    } else {
      return res.status(404).json({ message: 'Not found' });
    }
  } catch (error) {
    console.log(error)
    res.status(401).json({ message: 'Invalid token' });
  }
};
