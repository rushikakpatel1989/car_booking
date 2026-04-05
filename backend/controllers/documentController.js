const DriverDocument = require("../models/DriverDocument");
const Model = require('../models/Provider');
const bcrypt = require('bcryptjs');
const token = require('../utils/generateToken');

exports.uploadDocuments = async (req, res) => {
  try {
    const doc = new DriverDocument({
      providerId: req.user.id,

      drivingLicense: {
        number: req.body.licenseNumber,
        file: req.files.license[0].path
      },

      aadharCard: {
        number: req.body.aadharNumber,
        file: req.files.aadhar[0].path
      },

      vehicleRC: {
        number: req.body.rcNumber,
        file: req.files.rc[0].path
      }

    });

    await doc.save();

    res.json({
      status: true,
      message: "Documents uploaded"
    });

  } catch (err) {

    res.status(500).json({
      status: false,
      error: err.message
    });

  }

};