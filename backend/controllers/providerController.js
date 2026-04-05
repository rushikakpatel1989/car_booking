
const Provider = require('../models/Provider');
const bcrypt = require('bcryptjs');
const token = require('../utils/generateToken');

exports.signup = async (req,res)=>{
  const {name,email,password,vehicleType} = req.body;
  const hash = await bcrypt.hash(password,10);
  const existingUser = await Provider.findOne({ email });

  if(!(vehicleType=='car' || vehicleType=='bike' || vehicleType=='auto')){
	return res.status(400).json({
                message: "vehicleType must be car, bike or auto"
            });
  }
  if (existingUser) {
    return res.status(400).json({
        message: "Email already registered"
    });
  }

  const user = await Provider.create({name,email,password:hash,status:'pending',vehicleType:vehicleType});
  res.json({token: token(user._id, 'provider')});
};

exports.updateLocation = async (req, res) => {
    try {
        let { lng, lat } = req.body;

        // ✅ validation
        if (lng === undefined || lat === undefined) {
            return res.status(400).json({
                message: "lng and lat are required"
            });
        }

        // ✅ convert to number
        lng = parseFloat(lng);
        lat = parseFloat(lat);

        const driver = await Provider.findByIdAndUpdate(
            req.user.id,
            {
                location: {
                    type: "Point",
                    coordinates: [lng, lat], // [lng, lat]
                    updatedAt: new Date()
                },
                isOnline: true,            // 👈 important
                lastActiveAt: new Date()  // 👈 tracking
            },
            { new: true }
        );

        // ✅ driver check
        if (!driver) {
            return res.status(404).json({
                message: "Driver not found"
            });
        }

        res.json({
            success: true,
            message: "Location updated",
            data: driver
        });

    } catch (err) {
        console.error("UPDATE LOCATION ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
};
exports.goOnline = async (req, res) => {
    const driver = await Provider.findByIdAndUpdate(
        req.user.id,
        {
            isOnline: true,
            isAvailable: true
        },
        { new: true }
    );

    res.json({ success: true, data: driver });
};
exports.login = async (req,res)=>{
  const {email,password} = req.body;
  const user = await Provider.findOne({email});
  if(!user) return res.status(400).json({msg:'Invalid credentials'});

  const ok = await bcrypt.compare(password, user.password);
  if(!ok) return res.status(400).json({msg:'Invalid credentials'});

  res.json({token: token(user._id, 'provider')});
};

exports.profile = async (req,res)=>{
  const user = await Provider.findById(req.user.id).select('-password');
  res.json(user);
};
