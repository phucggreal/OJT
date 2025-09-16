const express = require("express");
const { register, login, profile, verifyOTP, forgotPassword, verifyForgotOtp, resetPassword } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/forgot-password", forgotPassword);
router.post("/verify-forgot-otp", verifyForgotOtp);
router.post("/reset-password", resetPassword);
router.post("/register", register);
router.post("/verify-otp", verifyOTP);
router.post("/login", login);
router.get("/profile", authMiddleware, profile);

module.exports = router;