import express from 'express';
import fs from 'fs';
import path from 'path';
import authenticate from '../middlewares/auth.js';
import UserCoordinates from '../models/user-coordinates.js';
import { formatDate } from '../utils/date.js';
import multer from 'multer';
import User from '../models/user.js';
import Tags from '../models/tags.js';
import sharp from 'sharp';
import Friends from '../models/friends.js';
import { Types } from 'mongoose';

const router = express.Router();
const directory = './uploads';

const storage = multer.diskStorage({
  limits: {
    fileSize: 200000,
  },
  fileFilter: function (req, file, cb) {
    if (!file.originalname.match(/.(png|jpeg|jpg)$/)) {
      return cb(new Error({ type: 'error', message: 'File must be .png OR .jpg' }))
    }
    cb(null, true);
  },
  destination: (req, file, cb) => {
    const dirPath = path.join(directory, req.user.id);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      cb(null, dirPath);
    } else {
      cb(null, dirPath);
    }
  },
  filename: (req, file, cb) => {
    const fileName = `${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage });

export const saveProfileData = ({ fullname, gender, country, city, dateOfBirth }) => {
  const dataToBeSaved = {
    lastUpdated: new Date(),
    ...{ ...(typeof fullname === "string" && { fullname }) },
    ...{ ...(typeof city === "string" && { city }) },
    ...{ ...(typeof country === "string" && { country }) },
    ...{ ...(dateOfBirth instanceof Date && { dateOfBirth: new Date(dateOfBirth) }) },
    ...{ ...((gender === 'Male' || gender === 'Female' || gender === 'Prefer not to say') && { gender }) }
  }
  return dataToBeSaved;
}

router.get('/profile', authenticate, async (req, res) => {
  if (req.user.id) {
    const userCoordinate = await UserCoordinates.findOne({ userId: req.user.id, endDate: null });
    if (userCoordinate) {
      res.json({ ...req.user, ...{ coordinates: userCoordinate.coordinates } });
    } else {
      res.json({ ...req.user, ...{ coordinates: [] } });
    }
  } else {
    res.json({ error: 'User does not exist', error: true, success: false });
  }
});

router.patch('/profile', authenticate, async (req, res) => {
  try {
    if (req.user.id) {
      const dataToBeSaved = saveProfileData(req.body);
      const user = await User.findOneAndUpdate(
        { _id: req.user.id }, dataToBeSaved
      )
      if (user) {
        const { fullname, gender, dateOfBirth, city, country } = user;
        res.json({ message: 'User profile updated', error: false, success: true, user: { fullname, gender, dateOfBirth, city, country } });
      }
    } else {
      res.json({ error: 'User does not exist', error: true, success: false });
    }
  } catch (error) {
    console.log(error)
    res.json({ error, error: true, success: false });
  }
});

router.post('/map', authenticate, async (req, res) => {
  const { myLocation, startDate, endDate } = req.body
  const { lat, lng } = myLocation;
  const todayDate = formatDate(new Date())
  const addStartDate = startDate ? startDate : todayDate;
  try {
    await UserCoordinates.findOneAndUpdate(
      { userId: req.user.id, endDate: null }, { endDate: todayDate }
    )
    const userCoordinates = new UserCoordinates({ userId: req.user.id, coordinates: [lng, lat], startDate: addStartDate, endDate });
    await userCoordinates.save();
    res.json({ message: 'User position is added', error: false, success: true });
  } catch (error) {
    res.json({ error, error: true, success: false });
  }
});

router.post('/map/get', authenticate, async (req, res) => {
  const { mapBounds, startDate, endDate } = req.body;
  const { _northEast, _southWest } = mapBounds
  const lat1 = _northEast.lat
  const lng1 = _northEast.lng;
  const lat2 = _southWest.lat
  const lng2 = _southWest.lng;

  const { ObjectId } = Types;

  const userCoordinatess = await UserCoordinates.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'users'
      },
    },
    {
      $match: {
        coordinates: { $geoWithin: { $box: [[lng2, lat2], [lng1, lat1]] } },
        endDate: null,
        userId: { $ne: new ObjectId(req.user.id.toString()) }
      }
    },
    {
      $project: {
        _id: 1, userId: 1, coordinates: 1, startDate: 1, endDate: 1, users: { avatar: 1, fullname: 1, city: 1, _id: 1 },
      }
    },
    {
      $group: {
        "_id": "$_id",
        "coordinates": { "$first": "$coordinates" },
        "userId": { "$first": "$userId" },
        "endDate": { "$first": "$endDate" },
        "fullname": { "$first": "$users.fullname" },
        "city": { "$first": "$users.city" },
        "country": { "$first": "$users.country" },
        "avatar": { "$first": "$users.avatar" },
      }
    },
  ]);
  res.json(userCoordinatess);
});

router.post('/upload-image', authenticate, upload.single('file'), async (req, res) => {
  try {
    const file = `uploads/${req.user.id}/thumbnails-${req.file.filename}`
    await User.findByIdAndUpdate(req.user.id, { avatar: file })
    sharp(req.file.path)
      .resize(250, 250).toFile(file, async (error, resizeImage) => {
        if (error) {
          res.json({ error, error: true, success: false });
        } else {
          try {
            fs.unlinkSync(req.file.path);
          } catch (error) {
            console.log(error);
          }
          res.json({ message: 'User profile image added', error: false, success: true, avatar: `${req.file.path}` });
        }
      });
  } catch (error) {
    res.json({ error, error: true, success: false });
  }
});

router.post('/tag', authenticate, async (req, res) => {
  const { tag } = req.body
  try {
    const exist = await Tags.exists({ userId: req.user.id, tagName: tag })
    if (exist) {
      res.json({ message: 'Tag already exist', error: true, success: false });
    } else {
      const userTag = new Tags({ userId: req.user.id, tagName: tag });
      await userTag.save();
      res.json({ message: 'Tag added', error: false, success: true, userTag: { _id: userTag._id, tagName: userTag.tagName } });
    }
  } catch (error) {
    res.json({ error, error: true, success: false });
  }
});

router.get('/tag', authenticate, async (req, res) => {
  try {
    const tags = await Tags.find({ userId: req.user.id }, 'id, tagName')
    res.json({ error: false, success: true, tagNames: tags });
  } catch (error) {
    res.json({ error, error: true, success: false });
  }
});

router.delete('/tag/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const response = await Tags.deleteOne({ _id: id, userId: req.user.id });
    if (response.acknowledged) {
      res.json({ error: false, success: true });
    } else {
      res.json({ error: true, success: false, error: 'Could not delete tag' });
    }
  } catch (error) {
    res.json({ error, error: true, success: false });
  }
});

router.delete('/profile/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    if (req.user.role === 'admin') {
      const user = await User.findById(id, 'email, avatar');
      fs.unlinkSync(user.avatar); // remove folder
      await User.deleteOne({ _id: id });
      await Tags.deleteMany({ userId: id });
      res.json({ error: false, success: true });
    }
  } catch (error) {
    res.json({ error, error: true, success: false });
  }
});

export default router;