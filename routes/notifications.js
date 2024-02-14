import express from 'express';
import authenticate from '../middlewares/auth.js';
import FriendRequestsSchema from '../models/friend-requests.js';
import { Types } from 'mongoose';

const router = express.Router();

router.get('/:id', async (req, res) => {//authenticate
  try {
    const { id } = req.params;
    // const friendRequests = await FriendRequestsSchema.find({ receiverId: id })
    const { ObjectId } = Types;

    const friendRequests = await FriendRequestsSchema.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'receiverId',
          foreignField: '_id',
          as: 'user'
        },
      },
      // {
      //   $unwind: {
      //     path: "$user",
      //   }
      // },
      {
        $match: {
          // $expr: { $eq: ["$user._id", "$senderId"] },
          receiverId: { $eq: new ObjectId(id) }
        }
      },
      {
        $project: {
          _id: 1, receiverId: 1, senderId: 1, fullname: 1, status: 1, users: { avatar: 1, fullname: 1, _id: 1 },
        }
      },
      {
        $group: {
          "_id": "$_id",
          "status": { "$first": "$status" },
          "senderId": { "$first": "$senderId" },
          "receiverId": { "$first": "$receiverId" },
          "fullname": { "$first": "$users.fullname" },
          "country": { "$first": "$users.country" },
          "avatar": { "$first": "$users.avatar" },
        }
      },
    ]);
    res.json({ error: false, success: true, friendRequests });
  } catch (error) {
    console.log(error)
    res.json({ error, error: true, success: false });
  }
});

export default router;