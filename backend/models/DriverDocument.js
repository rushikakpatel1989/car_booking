const mongoose = require("mongoose");

const driverDocumentSchema = new mongoose.Schema({
    providerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Provider",
        required: true
    },

    drivingLicense: {
        number: String,
        file: String,
        verified: { type: Boolean, default: false }
    },

    aadharCard: {
        number: String,
        file: String,
        verified: { type: Boolean, default: false }
    },

    panCard: {
        number: String,
        file: String,
        verified: { type: Boolean, default: false }
    },

    vehicleRC: {
        number: String,
        file: String,
        verified: { type: Boolean, default: false }
    },

    vehicleInsurance: {
        file: String,
        expiryDate: Date
    },

    pucCertificate: {
        file: String,
        expiryDate: Date
    },

    permit: {
        file: String
    }

}, { timestamps: true });

module.exports = mongoose.model("DriverDocument", driverDocumentSchema);