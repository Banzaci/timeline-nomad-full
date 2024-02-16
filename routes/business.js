import express from 'express';
import fs from 'fs';
import path from 'path';
import authenticate from '../middlewares/auth.js';
import { formatDate } from '../utils/date.js';
import multer from 'multer';
import User from '../models/user.js';
import sharp from 'sharp';
import Business from '../models/business.js';

const router = express.Router();
const directory = './uploads-business';

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

router.get('/profile', authenticate, async (req, res) => {
  if (req.user.id) {
    // const userCoordinate = await Business.findOne({ userId: req.user.id })
    res.json({ ...req.user });
  } else {
    res.json({ error: 'User does not exist', error: true, success: false });
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
    const userCoordinates = new UserCoordinates({ userId: req.user.id, coordinates: [lng, lat], startDate: addStartDate, endDate, createdDate: formatDate(new Date()) });
    await userCoordinates.save();
    res.json({ message: 'User country added', error: false, success: true });
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

  const userCoordinatess = await UserCoordinates.find({ 'coordinates': { $geoWithin: { $box: [[lng2, lat2], [lng1, lat1]] } } });
  res.json(userCoordinatess);
});

router.post('/upload-image', authenticate, upload.single('file'), async (req, res) => {
  try {
    const file = `uploads/${req.user.id}/thumbnails-${req.file.filename}`
    await User.findByIdAndUpdate(req.user.id, { avatar: file })
    sharp(req.file.path)
      .resize(250, 250).toFile(file, async (error, resizeImage) => {
        console.log(resizeImage)
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

export default router;