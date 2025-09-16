const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "member" },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpires: { type: Date },
  lastLogin: { type: Date },
  lastLoginIP: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);