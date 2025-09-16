// POST /auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { reset_token, password } = req.body;
    const jwt = require("jsonwebtoken");
    let payload;
    try {
      payload = jwt.verify(reset_token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: "Token không hợp lệ hoặc đã hết hạn!" });
    }
    if (payload.purpose !== "reset_password" || !payload.userId) {
      return res.status(400).json({ message: "Token không hợp lệ!" });
    }
    // Chỉ kiểm tra không rỗng
    if (!password) {
      return res.status(400).json({ message: "Vui lòng nhập mật khẩu!" });
    }
    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.findById(payload.userId);
    if (!user) return res.status(404).json({ message: "User không tồn tại!" });
    user.password = hashedPassword;
    user.lastLogin = null; // invalidate session (tùy JWT logic)
    await user.save();
    // Gửi email cảnh báo đổi mật khẩu (optional)
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// POST /auth/verify-forgot-otp
exports.verifyForgotOtp = async (req, res) => {
  try {
    const { contact, channel, otp } = req.body;
    // Tìm OTP chưa dùng, chưa hết hạn, không bị block
    const record = await PasswordOtp.findOne({ contact, channel, usedAt: null, blocked: false, expiresAt: { $gt: new Date() } });
    if (!record) return res.status(400).json({ message: "OTP không hợp lệ hoặc đã hết hạn" });
    if (record.attempts >= 5) return res.status(429).json({ message: "Bạn đã nhập sai quá nhiều lần!" });
    const computedHash = crypto.createHmac("sha256", process.env.JWT_SECRET).update(otp + record.salt).digest("hex");
    if (computedHash === record.otpHash) {
      record.usedAt = new Date();
      await record.save();
      // Tạo reset_token JWT ngắn hạn
      const jwt = require("jsonwebtoken");
      const token = jwt.sign({ userId: record.userId, purpose: "reset_password" }, process.env.JWT_SECRET, { expiresIn: "15m" });
      return res.json({ verified: true, reset_token: token });
    } else {
      record.attempts++;
      if (record.attempts >= 5) record.blocked = true;
      await record.save();
      return res.status(400).json({ message: "OTP không đúng!" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const PasswordOtp = require("../models/PasswordOtp");
const crypto = require("crypto");
// POST /auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { contact } = req.body;
    // enforce rate limit: kiểm tra số lần gửi trong 1 giờ
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentOtps = await PasswordOtp.countDocuments({ contact, channel: "email", createdAt: { $gte: oneHourAgo } });
    if (recentOtps >= 5) {
      return res.status(429).json({ message: "Bạn đã yêu cầu quá nhiều lần. Vui lòng thử lại sau." });
    }

    // Tìm user theo email
    const user = await User.findOne({ email: contact });
    // Trả về thông điệp chung (không reveal user)
    if (!user) {
      return res.json({ message: "Nếu tài khoản tồn tại, mã đã được gửi." });
    }

    // Sinh OTP bằng CSPRNG
    const otp = crypto.randomInt(100000, 999999).toString();
    const salt = crypto.randomBytes(16).toString("hex");
    const otpHash = crypto.createHmac("sha256", process.env.JWT_SECRET).update(otp + salt).digest("hex");
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

    // Invalidate OTP cũ
    await PasswordOtp.updateMany({ contact, channel: "email", usedAt: null }, { $set: { blocked: true } });

    // Lưu OTP mới
    await PasswordOtp.create({
      userId: user._id,
      contact,
      channel: "email",
      otpHash,
      salt,
      expiresAt,
      requestIp: req.ip,
      userAgent: req.headers["user-agent"] || "",
    });

    // Gửi email OTP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: contact,
      subject: "Mã đặt lại mật khẩu của bạn (HSD 10 phút)",
      html: `<p>Chào bạn,<br>Mã để đặt lại mật khẩu của bạn là: <b>${otp}</b><br>Mã có hiệu lực trong 10 phút. Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>`
    });

    return res.json({ message: "Nếu tài khoản tồn tại, mã đã được gửi." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Xác nhận OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User không tồn tại" });
    if (user.isVerified) return res.status(400).json({ message: "Tài khoản đã xác thực" });
    if (!user.otp || !user.otpExpires || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "OTP hết hạn" });
    }
    if (user.otp !== otp) return res.status(400).json({ message: "OTP không đúng" });
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();
    res.json({ message: "Xác thực thành công!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


const nodemailer = require("nodemailer");
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check trùng email/username
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) return res.status(400).json({ message: "Email hoặc username đã tồn tại" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Sinh OTP
    const otp = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 phút

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      otp,
      otpExpires,
      isVerified: false,
      role: "member"
    });

    // Gửi email OTP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Xác thực đăng ký tài khoản",
      html: `<h2>Mã xác thực của bạn là: <b>${otp}</b></h2><p>Mã có hiệu lực trong 10 phút.</p>`
    });

    res.status(201).json({ message: "Đã gửi OTP xác thực về email!", userId: newUser._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // Tìm user theo email hoặc username
    const user = await User.findOne({ $or: [ { email }, { username } ] });
    if (!user) return res.status(400).json({ message: "Tài khoản không tồn tại" });

    // Kiểm tra đã xác thực email chưa
    if (!user.isVerified) return res.status(403).json({ message: "Bạn chưa xác thực email!" });

    // Kiểm tra password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Mật khẩu không đúng" });

    // Lưu log đăng nhập
    user.lastLogin = new Date();
    user.lastLoginIP = req.ip;
    await user.save();

    // Tạo token kèm role
    const token = jwt.sign(
      { id: user._id, email: user.email, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.profile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};