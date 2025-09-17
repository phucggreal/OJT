import express from "express";
import {
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
} from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Auth routes
router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/resend-otp", resendOTP);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOTP);
router.post("/reset-password", resetPassword);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);
router.get("/profile", authMiddleware, profile);

export default router;
