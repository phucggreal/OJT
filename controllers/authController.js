/**
 * LOGOUT
 */
const logout = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
    return res.json({ message: "Logout successful" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
/**
 * REFRESH TOKEN
 */
const refreshToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(401).json({ message: "Refresh token required" });

    const user = await User.findOne({ refreshToken: token });
    if (!user) return res.status(403).json({ message: "Invalid refresh token" });

    jwt.verify(token, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
      if (err) return res.status(403).json({ message: "Invalid refresh token" });

      const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.id);
      user.refreshToken = newRefreshToken;
      await user.save();
      return res.json({ accessToken, refreshToken: newRefreshToken });
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateTokens } from "../utils/generateTokens.js";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";
import { verifyEmailTemplate, resendOTPTemplate, resetPasswordTemplate } from "../utils/emailTemplates.js";

// Hàm tạo OTP 6 số
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

/**
 * REGISTER
 */
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      otpCode: otp,
      otpExpires,
      isVerified: false,
    });

    await sendEmail({
      to: email,
      subject: "Verify your email from PhucGG",
      html: verifyEmailTemplate(username, otp)
    });

    // Tạo accessToken và refreshToken cho user mới
    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    return res.status(201).json({
      message: "User registered. Please check your email for the OTP.",
      accessToken,
      refreshToken,
      user: { id: user._id, username: user.username, email: user.email, role: user.role },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * VERIFY EMAIL
 */
const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    if (user.isVerified) return res.status(400).json({ message: "Already verified" });
    if (user.otpCode !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otpCode = null;
    user.otpExpires = null;
    await user.save();

    return res.json({ message: "Email verified successfully!" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * LOGIN
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    if (!user.isVerified) return res.status(403).json({ message: "Please verify your email first" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Tạo accessToken và refreshToken
    const { accessToken, refreshToken } = generateTokens(user._id);
    // Lưu refreshToken vào DB
    user.refreshToken = refreshToken;
    await user.save();

    return res.json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: { id: user._id, username: user.username, email: user.email, role: user.role },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * PROFILE
 */
const profile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * RESEND OTP
 */
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    if (user.isVerified) return res.status(400).json({ message: "Already verified" });

    // Check 60s limit
    if (user.lastOtpSent && Date.now() - user.lastOtpSent.getTime() < 60 * 1000) {
      const wait = Math.ceil((60 * 1000 - (Date.now() - user.lastOtpSent.getTime())) / 1000);
      return res.status(429).json({ message: `Please wait ${wait}s before requesting again.` });
    }

    const otp = generateOTP();
    user.otpCode = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.lastOtpSent = new Date();
    await user.save();

    await sendEmail({
      to: email,
      subject: "Resend OTP",
      html: resendOTPTemplate(user.username, otp)
    });

    return res.json({ message: "New OTP sent to email." });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * FORGOT PASSWORD
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const otp = generateOTP();
    user.otpCode = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.resetVerified = false;
    await user.save();

    await sendEmail({
      to: email,
      subject: "Password Reset OTP",
      html: resetPasswordTemplate(user.username, otp)
    });

    return res.json({ message: "Password reset OTP sent." });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * VERIFY RESET OTP
 */
const verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    if (user.otpCode !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.resetVerified = true;
    await user.save();
    return res.json({ message: "OTP verified, you can reset password now." });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * RESET PASSWORD
 */
const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    if (!user.resetVerified) return res.status(400).json({ message: "OTP not verified" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.otpCode = null;
    user.otpExpires = null;
    user.resetVerified = false;
    await user.save();

    return res.json({ message: "Password reset successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ✅ Export tất cả hàm
export {
  register,
  verifyEmail,
  login,
  profile,
  resendOTP,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  refreshToken,
  logout
};
