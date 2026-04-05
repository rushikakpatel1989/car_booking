const Ride = require("../models/Ride");
const Provider = require("../models/Provider");
const bcrypt = require('bcryptjs');
const token = require('../utils/generateToken');
const calculateDistance = require("../utils/calculateDistance");
const calculateFare = require("../utils/calculateFare");
const autoAssignDriver = require("../utils/autoAssignDriver");
const pricing = require("../config/pricing");
const generateInvoice = require("../utils/generateInvoice");

// Generate OTP
const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

exports.getFareEstimate = async (req, res) => {
    try {
        const { pickupLocation, dropLocation, vehicleType } = req.body;

        if (!pickupLocation || !dropLocation || !vehicleType) {
            return res.status(400).json({
                message: "Missing required fields"
            });
        }

        // 📍 Distance
        const distance = calculateDistance(
            pickupLocation.coordinates,
            dropLocation.coordinates
        );

        // ⏱ Duration (approx)
        const duration = (distance / 30) * 60; // minutes

        // 💰 Fare
        const fare = calculateFare({
            vehicleType,
            distance,
            duration
        });

        res.json({
            success: true,
            data: {
                distance: distance.toFixed(2) + " KM",
                duration: Math.round(duration) + " mins",
                fare
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createRide = async (req, res) => {
    try {
        const {
            pickupLocation,
            dropLocation,
            rideType,
	    vehicleType,
            scheduledAt,
            paymentMethod
        } = req.body;

        // ✅ validation for scheduled rides
        if (rideType === "scheduled") {
            if (!scheduledAt) {
                return res.status(400).json({
                    message: "scheduledAt is required for scheduled rides"
                });
            }

            const scheduleTime = new Date(scheduledAt);
            const now = new Date();

            if (scheduleTime <= now) {
                return res.status(400).json({
                    message: "Scheduled time must be in future"
                });
            }
        }

        const ride = await Ride.create({
            customerId: req.user.id,
            pickupLocation,
            dropLocation,
            rideType,
            scheduledAt: rideType === "scheduled" ? scheduledAt : null,
            paymentMethod,
            status: rideType === "scheduled" ? "scheduled" : "searching",
            otp: Math.floor(1000 + Math.random() * 9000).toString()
        });

        // ✅ only auto-assign if ride is NOW
        if (rideType === "now") {
            await autoAssignDriver(ride._id);
        }

        res.status(201).json({
            success: true,
            message: "Ride booked successfully",
            data: ride
        });

    } catch (err) {
        console.error("CREATE RIDE ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }

};
exports.assignDriver = async (req, res) => {
    try {
        const { rideId, driverId } = req.body;

        const ride = await Ride.findByIdAndUpdate(
            rideId,
            {
                providerId: driverId,
                status: "driver_assigned",
                assignedAt: new Date()
            },
            { new: true }
        );

        res.json({
            success: true,
            message: "Driver assigned",
            data: ride
        });

    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};
exports.startRide = async (req, res) => {
    try {
        const { rideId, otp } = req.body;

        const ride = await Ride.findById(rideId);

        if (ride.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        ride.status = "ride_started";
        ride.startedAt = new Date();

        await ride.save();

        res.json({
            success: true,
            message: "Ride started",
            data: ride
        });

    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};
exports.completeRide = async (req, res) => {
    try {
        const { rideId, distance, duration } = req.body;

        const ride = await Ride.findById(rideId);
	const vehicalType=ride.vehicleType;
	
        // Simple fare calculation
       /* const baseFare = 50;
        const distanceFare = distance * 10;
        const timeFare = duration * 2;

        const total =
            (baseFare + distanceFare + timeFare) *
            ride.fare.surgeMultiplier;

        ride.distance = distance;
        ride.duration = duration;
        ride.status = "ride_completed";
        ride.completedAt = new Date();

        ride.fare = {
            baseFare,
            distanceFare,
            timeFare,
            surgeMultiplier: 1,
            tax: 0,
            total
        };
*/
 	// -----------------------------
        const fare = calculateFare({
            vehicleType: vehicalType,
            distance,
            duration
        });
	ride.fare = fare;

        // Payment handling
        if (ride.paymentMethod === "cash") {
            ride.paymentStatus = "paid";
	 //   const invoice = generateInvoice(ride);
          //  ride.invoice = invoice;
        }else {
            ride.paymentStatus = "pending";
        }
	ride.status = "ride_completed";
	// status: "ride_completed",

        await ride.save();

        res.json({
            success: true,
            message: "Ride completed",
            data: ride
        });

    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};
exports.cancelRide = async (req, res) => {
    try {
        const { rideId, reason } = req.body;

        const ride = await Ride.findByIdAndUpdate(
            rideId,
            {
                status: "ride_cancelled",
                cancelReason: reason,
                cancelledBy: "customer",
                cancelledAt: new Date()
            },
            { new: true }
        );

        res.json({
            success: true,
            message: "Ride cancelled",
            data: ride
        });

    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};
exports.getRide = async (req, res) => {
    try {
        const ride = await Ride.findById(req.params.id)
            .populate("customerId", "name phone")
            .populate("providerId", "name phone vehicleDetails");

        res.json({
            success: true,
            data: ride
        });

    } catch (err) {
console.error("GET RIDE ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getRideHistory = async (req, res) => {
    try {
        const rides = await Ride.find({
            customerId: req.user.id,
            status:{ $in: ["ride_completed", "ride_cancelled"] }
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: rides.length,
            data: rides
        });

    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};
exports.getUpcomingRides = async (req, res) => {
    try {
        const now = new Date();

        const rides = await Ride.find({
            customerId: req.user.id,
            rideType: "scheduled",
            scheduledAt: { $gt: now },
            status: { $in: ["scheduled", "searching", "driver_assigned"] }
        }).sort({ scheduledAt: 1 });

        res.json({
            success: true,
            count: rides.length,
            data: rides
        });

    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.getRideDriver = async (req, res) => {
    try {
        const ride = await Ride.findById(req.params.id)
            .populate("customerId", "name phone")
            .populate("providerId", "name phone vehicleDetails");

        res.json({
            success: true,
            data: ride
        });

    } catch (err) {
console.error("GET RIDE ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getRideHistoryDriver = async (req, res) => {
    try {
        const rides = await Ride.find({
            providerId: req.user.id,
            status:{ $in: ["ride_completed", "ride_cancelled"] }
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: rides.length,
            data: rides
        });

    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};
exports.getUpcomingRidesDriver = async (req, res) => {
    try {
        const now = new Date();

        const rides = await Ride.find({
            providerId: req.user.id,
            rideType: "scheduled",
            scheduledAt: { $gt: now },
            status: { $in: ["scheduled", "searching", "driver_assigned"] }
        }).sort({ scheduledAt: 1 });

        res.json({
            success: true,
            count: rides.length,
            data: rides
        });

    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.getNearbyDrivers = async (req, res) => {
    try {
        let { lng, lat,vehicleType, radius } = req.query;

        // ✅ validation
        if (!lng || !lat || !vehicleType) {
            return res.status(400).json({
                message: "lng, lat and vehicleType are required"
            });
        }

        lng = parseFloat(lng);
        lat = parseFloat(lat);
        radius = radius ? parseInt(radius) : 3000; // default 3km

        const drivers = await Provider.find({
	    "vehicle.type": vehicleType,
            isOnline: true,
            isAvailable: true,
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [lng, lat]
                    },
                    $maxDistance: radius
                }
            }
        })
        .select("name phone vehicle location stats")
        .limit(10);

        res.json({
            success: true,
            count: drivers.length,
            data: drivers
        });

    } catch (err) {
        console.error("NEARBY DRIVER ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
};
exports.confirmPayment = async (req, res) => {
    try {
        const { rideId } = req.body;

        const ride = await Ride.findById(rideId);

        if (!ride) {
            return res.status(404).json({ message: "Ride not found" });
        }

        if (ride.paymentStatus === "paid") {
            return res.status(400).json({ message: "Already paid" });
        }

        // Only driver of ride can confirm
        if (ride.providerId.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized" });
        }

        ride.paymentStatus = "paid";
        ride.paidAt = new Date();
        ride.paymentConfirmedBy = req.user.id;

        const invoice = generateInvoice(ride);

        ride.invoice = invoice;

        await ride.save();

        res.json({
            success: true,
            message: "Payment marked as received",
            data: ride
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getInvoice = async (req, res) => {
    try {
        const { rideId } = req.params;

        const ride = await Ride.findById(rideId)
            .populate("customerId", "name phone")
            .populate("providerId", "name phone");

        if (!ride) {
            return res.status(404).json({ message: "Ride not found" });
        }

        if (!ride.invoice) {
            return res.status(404).json({ message: "Invoice not generated yet" });
        }

        res.json({
            success: true,
            data: {
                invoiceNumber: ride.invoice.invoiceNumber,
                generatedAt: ride.invoice.generatedAt,
                customer: ride.customerId,
                driver: ride.providerId,
                fare: ride.fare,
                paymentStatus: ride.paymentStatus
            }
        });

    } catch (err) {
        console.error("INVOICE ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
};