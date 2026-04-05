const pricing = require("../config/pricing");

const calculateFare = ({ vehicleType, distance, duration }) => {

    const config = pricing[vehicleType];

    if (!config) {
        throw new Error("Invalid vehicle type");
    }

    const baseFare = config.baseFare;
    const distanceFare = distance * config.perKm;
    const timeFare = duration * config.perMin;

    // Surge (can be dynamic)
    const surgeMultiplier = 1;

    const subtotal = (baseFare + distanceFare + timeFare) * surgeMultiplier;

    const tax = (subtotal * pricing.taxPercent) / 100;

    const total = subtotal + tax;

    return {
        baseFare,
        distanceFare,
        timeFare,
        surgeMultiplier,
        tax,
        total: Math.round(total)
    };
};

module.exports = calculateFare;