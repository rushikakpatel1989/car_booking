const Ride = require("../models/Ride");
const Provider = require("../models/Provider");
const MAX_DISTANCE = parseInt(process.env.MAX_DRIVER_DISTANCE) || 5000;

const autoAssignDriver = async () => {
    console.log("🚀 Auto assigning drivers...");

    try {
        const now = new Date();

        // 1. Get rides needing assignment
        const rides = await Ride.find({
	    status: "searching",
            providerId: null,
            $or: [
                { status: "searching" },
                {
                    status: "scheduled",
                    scheduledAt: { $lte: now }
                }
            ]
        }).limit(10); // prevent overload

        for (let ride of rides) {

            const [lng, lat] = ride.pickupLocation.coordinates;

            // 2. Find nearest AVAILABLE + ONLINE driver
            const driver = await Provider.findOne({
		"vehicle.type": ride.vehicleType,
                isAvailable: true,
                isOnline: true,
                currentRideId: null,
                location: {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: [lng, lat]
                        },
                        $maxDistance: MAX_DISTANCE // 5 KM radius
                    }
                }
            }).sort({ "stats.rating": -1 }); // best driver first

            if (!driver) {
                console.log(`❌ No driver found for ride ${ride._id}`);
                continue;
            }

            // 3. Assign driver (IMPORTANT: atomic thinking)
            ride.providerId = driver._id;
            ride.status = "driver_assigned";
            ride.assignedAt = new Date();

            await ride.save();

            // 4. Update driver
            driver.isAvailable = false;
            driver.currentRideId = ride._id;
            await driver.save();

            console.log(`✅ Driver ${driver._id} assigned to ride ${ride._id}`);
        }

    } catch (error) {
        console.error("❌ Auto assign error:", error);
    }
};

module.exports = autoAssignDriver;