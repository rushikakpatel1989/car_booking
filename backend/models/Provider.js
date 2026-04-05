const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema({

  name: { type: String, required: true },

  email: { 
    type: String, 
    unique: true,
    lowercase: true,
    trim: true
  },

  password: { type: String, required: true },

  phone: String,

  vehicle: {
    type: {
      type: String,
      enum: ["bike", "auto", "car"]
    },
    number: String,
    model: String,
    color: String
  },

  isAvailable: {
    type: Boolean,
    default: false
  },

  isOnline: {
    type: Boolean,
    default: false
  },

  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: undefined
    },
    coordinates: {
      type: [Number],
      default: undefined
    }
  }, // ✅ fixed

  stats: {
    totalRides: { type: Number, default: 0 },
    rating: { type: Number, default: 5 },
    cancelledRides: { type: Number, default: 0 }
  },

  currentRideId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ride",
    default: null
  },
  status: {
        type: String,
        enum: ["pending","approved","rejected"],
        default: "pending"
  },
  lastActiveAt: Date

}, { timestamps: true });

providerSchema.index({ location: "2dsphere" });
providerSchema.index({ isAvailable: 1, isOnline: 1 });

module.exports = mongoose.model('Provider', providerSchema);