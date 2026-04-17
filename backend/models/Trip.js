const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  details: { type: String },
  cost: { type: String },
  itinerary: { type: String },
  route_data: { type: String },
  map_image: { type: String },
  created_at: { type: Date, default: Date.now }
});

// Ensure Mongoose returns `id` instead of `_id` so the frontend HTML template works without modification
tripSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
  }
});

module.exports = mongoose.model('Trip', tripSchema);
