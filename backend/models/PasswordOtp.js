const mongoose = require("mongoose");

const passwordOtpSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  contact: { type: String, required: true }, // email hoặc phone
  channel: { type: String, enum: ["email", "sms"], required: true },
  otpHash: { type: String, required: true },
  salt: { type: String },
  expiresAt: { type: Date, required: true },
  usedAt: { type: Date },
  attempts: { type: Number, default: 0 },
  blocked: { type: Boolean, default: false },
  requestIp: { type: String },
  userAgent: { type: String },
  createdAt: { type: Date, default: Date.now },
});

passwordOtpSchema.index({ contact: 1, channel: 1 });

module.exports = mongoose.model("PasswordOtp", passwordOtpSchema);
