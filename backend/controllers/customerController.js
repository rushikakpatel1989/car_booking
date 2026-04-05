
const Model = require('../models/Customer');
const bcrypt = require('bcryptjs');
const token = require('../utils/generateToken');

exports.signup = async (req,res)=>{
  const {name,email,password} = req.body;
const existingUser = await Model.findOne({ email });

if (existingUser) {
    return res.status(400).json({
        message: "Email already registered"
    });
}
  const hash = await bcrypt.hash(password,10);
  const user = await Model.create({name,email,password:hash,location: undefined});
  res.json({token: token(user._id, 'customer')});
};

exports.login = async (req,res)=>{
  const {email,password} = req.body;
  const user = await Model.findOne({email});
  if(!user) return res.status(400).json({msg:'Invalid credentials'});

  const ok = await bcrypt.compare(password, user.password);
  if(!ok) return res.status(400).json({msg:'Invalid credentials'});

  res.json({token: token(user._id, 'customer')});
};

exports.profile = async (req,res)=>{
  const user = await Model.findById(req.user.id).select('-password');
  res.json(user);
};
