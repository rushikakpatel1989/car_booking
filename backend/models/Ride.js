const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema({

    // 👤 USER & DRIVER
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true
    },

    providerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Provider",
        default: null
    },
    vehicleType: {
        type: String,
        enum: ["car", "bike", "auto"],
        default: "car"
    },

    // 📍 LOCATIONS
    pickupLocation: {
        type: {
            type: String,
            default: "Point"
        },
        coordinates: {
            type: [Number], // [lng, lat]
            required: true
        },
        address: String
    },

    dropLocation: {
        type: {
            type: String,
            default: "Point"
        },
        coordinates: {
            type: [Number],
            required: true
        },
        address: String
    },

    // 🛣 ROUTE DETAILS
    distance: Number, // in KM
    duration: Number, // in minutes

    // ⏱ RIDE TYPE (NOW / LATER)
    rideType: {
        type: String,
        enum: ["now", "scheduled"],
        default: "now"
    },

    scheduledAt: {
        type: Date,
        default: null
    },

    // 🚦 STATUS FLOW
    status: {
        type: String,
        enum: [
	    "scheduled",
            "searching",
            "driver_assigned",
            "driver_arriving",
            "ride_started",
            "ride_completed",
            "ride_cancelled"
        ],
        default: "searching"
    },
	
    cancelReason: String,
    cancelledBy: {
        type: String,
        enum: ["customer", "driver", "system"]
    },

    // 💰 FARE DETAILS
    fare: {
        baseFare: { type: Number, default: 0 },
        distanceFare: { type: Number, default: 0 },
        timeFare: { type: Number, default: 0 },
        surgeMultiplier: { type: Number, default: 1 },
        tax: { type: Number, default: 0 },
        total: { type: Number, default: 0 }
    },

    // 💳 PAYMENT
    paymentMethod: {
        type: String,
        enum: ["cash", "card"],
        default: "cash"
    },

    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed"],
        default: "pending"
    },

    stripePaymentIntentId: String,

    // ⭐ RATINGS
    customerRating: {
        rating: Number,
        review: String
    },

    driverRating: {
        rating: Number,
        review: String
    },

    // ⏳ TIMESTAMPS (VERY IMPORTANT)
    assignedAt: Date,
    driverArrivedAt: Date,
    startedAt: Date,
    completedAt: Date,
    cancelledAt: Date,

    // 📡 REAL-TIME TRACKING (optional but powerful)
    driverCurrentLocation: {
        type: {
            type: String,
            default: "Point"
        },
        coordinates: [Number]
    },

    // 🧾 META
    otp: String, // ride start verification
    notes: String,
    invoice: {
	invoiceNumber:String,
        generatedAt: Date
	} // in KM

}, {
    timestamps: true // adds createdAt & updatedAt
});


// 🌍 GEO INDEXES (IMPORTANT)
rideSchema.index({ pickupLocation: "2dsphere" });
rideSchema.index({ dropLocation: "2dsphere" });

module.exports = mongoose.model("Ride", rideSchema);