import mongoose from 'mongoose';

const CountriesSchema = new mongoose.Schema({
  country: {
    type: String,
    required: true,
  },
  continent: {
    type: String,
    required: true,
  },
  short: {
    type: String,
    required: true,
  },
  createdDate: {
    type: Date,
    required: true,
    default: new Date()
  },
});

const Tag = mongoose.model('countries', CountriesSchema);

export default Countries;