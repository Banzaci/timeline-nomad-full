import FriendRequestsSchema from '../models/friend-requests.js';

const getFriends = async (id) => {
  const friendRequests = await FriendRequestsSchema.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'senderId',
        foreignField: '_id',
        as: 'user'
      },
    },
    { "$unwind": { "path": "$users", "preserveNullAndEmptyArrays": true } },
    {
      $match: {
        $or: [{ 'senderId': id }, { 'receiverId': id }],
        status: 'accepted'
      }
    },
    {
      $project: {
        _id: 1, fullname: 1, status: 1, user: { tags: 1, avatar: 1, fullname: 1, _id: 1 },
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
  return friendRequests;
}

export default getFriends