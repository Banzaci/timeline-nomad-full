import express from 'express';
import authenticate from '../middlewares/auth.js';
import FriendRequestsSchema from '../models/friend-requests.js';
import { Types } from 'mongoose';

const router = express.Router();

const mapStatus = {
  'declined': 'You have declined the request',
  'accepted': 'You are now buddys',
}

router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params; // tags
    const { ObjectId } = Types;

    const friendRequests = await FriendRequestsSchema.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'senderId',
          foreignField: '_id',
          as: 'user'
        },
      },
      {
        $match: {
          receiverId: { $eq: new ObjectId(id) }
        }
      },
      {
        $project: {
          _id: 1, receiverId: 1, senderId: 1, fullname: 1, status: 1, user: { tags: 1, avatar: 1, fullname: 1, _id: 1 },
        }
      },
      { $sort: { createdDate: 1 } },
      {
        $group: {
          "_id": "$_id",
          "status": { "$first": "$status" },
          "senderId": { "$first": "$senderId" },
          "receiverId": { "$first": "$receiverId" },
          "fullname": { "$first": "$user.fullname" },
          "country": { "$first": "$user.country" },
          "avatar": { "$first": "$user.avatar" },
          "tags": { "$first": "$user.tags" },
        }
      },
    ]);
    res.json({ error: false, success: true, friendRequests });
  } catch (error) {
    res.json({ error, error: true, success: false });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { status, senderId } = req.body;
    await FriendRequestsSchema.findOneAndUpdate({ senderId, receiverId: req.user.id }, { status, lastUpdated: new Date() })
    res.json({ error: false, success: true, status: mapStatus[status] });
  } catch (error) {
    res.json({ error, error: true, success: false });
  }
});

export default router;