import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const UserCoordinatesSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  coordinates: {
    type: Object,
    required: true,
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  createdDate: {
    type: Date,
    default: new Date()
  },
});

const UserCoordinates = mongoose.model('UserCoordinates', UserCoordinatesSchema);

export default UserCoordinates;