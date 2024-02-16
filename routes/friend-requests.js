import express from 'express';
import authenticate from '../middlewares/auth.js';
import FriendRequestsSchema from '../models/friend-requests.js';
import getFriendRequest from '../utils/friend-requests.js';

const router = express.Router();

const mapStatus = {
  'declined': 'You have declined the request',
  'accepted': 'You are now buddys',
}

router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params; // tags
    const friendRequests = await getFriendRequest(id);
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