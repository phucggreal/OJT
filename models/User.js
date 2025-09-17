import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true, index: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["member", "admin"], default: "member" },
  isVerified: { type: Boolean, default: false },
  otpCode: { type: String, default: null },
  otpExpires: { type: Date, default: null },
  resetVerified: { type: Boolean, default: false },
  refreshToken: { type: String, default: null },
  lastOtpSent: { type: Date, default: null },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

userSchema.index({ username: "text", email: "text" });

export default mongoose.model("User", userSchema);
