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
  logout,
  updateProfile
} from "../controllers/authController.js";
/**
 * @swagger
 * /api/auth/update-profile:
 *   patch:
 *     summary: Cập nhật thông tin cá nhân (username, avatar)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               avatar:
 *                 type: string
 *                 description: Link ảnh đại diện
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.patch("/update-profile", authMiddleware, updateProfile);
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Đăng ký tài khoản mới
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 */
router.post("/register", register);
/**
 * @swagger
 * /api/auth/verify-email:
 *   post:
 *     summary: Xác thực email bằng OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Xác thực email thành công
 */
router.post("/verify-email", verifyEmail);
/**
 * @swagger
 * /api/auth/resend-otp:
 *   post:
 *     summary: Gửi lại OTP xác thực email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP đã được gửi lại
 */
router.post("/resend-otp", resendOTP);
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Đăng nhập
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 */
router.post("/login", login);
/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Quên mật khẩu - gửi OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP reset password đã gửi
 */
router.post("/forgot-password", forgotPassword);
/**
 * @swagger
 * /api/auth/verify-reset-otp:
 *   post:
 *     summary: Xác thực OTP reset password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Xác thực OTP thành công
 */
router.post("/verify-reset-otp", verifyResetOTP);
/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Đặt lại mật khẩu mới
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đặt lại mật khẩu thành công
 */
router.post("/reset-password", resetPassword);
/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Lấy access token mới từ refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Trả về access token mới
 */
router.post("/refresh-token", refreshToken);
/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Đăng xuất
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đăng xuất thành công
 */
router.post("/logout", logout);
/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Lấy thông tin profile user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trả về thông tin user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.get("/profile", authMiddleware, profile);

export default router;
