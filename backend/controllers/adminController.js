
const Model = require('../models/Admin');
const bcrypt = require('bcryptjs');
const token = require('../utils/generateToken');

exports.signup = async (req,res)=>{
  const {name,email,password} = req.body;
  const hash = await bcrypt.hash(password,10);
  const user = await Model.create({name,email,password:hash});
  res.json({token: token(user._id, 'admin')});
};

exports.login = async (req,res)=>{
  const {email,password} = req.body;
  const user = await Model.findOne({email});
  if(!user) return res.status(400).json({msg:'Invalid credentials'});

  const ok = await bcrypt.compare(password, user.password);
  if(!ok) return res.status(400).json({msg:'Invalid credentials'});

  res.json({token: token(user._id, 'admin')});
};

exports.profile = async (req,res)=>{
  const user = await Model.findById(req.user.id).select('-password');
  res.json(user);
};
