// models/user.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: String,
  displayName: String,
  email: String,
  isAdmin:{
    type:Number,
    default:0,
  }
  
},{timestamps:true});

module.exports = mongoose.model('User', userSchema);
