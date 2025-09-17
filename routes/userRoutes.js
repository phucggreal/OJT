import express from "express";
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  changePassword
} from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import authorize from "../middleware/authorize.js";
import { body } from "express-validator";
import validateRequest from "../middleware/validateRequest.js";

const router = express.Router();

// Admin create user
router.post(
  "/",
  authMiddleware,
  authorize("admin"),
  [
    body("username").isString().isLength({ min: 2 }),
    body("email").isEmail(),
    body("password").isLength({ min: 6 })
  ],
  validateRequest,
  createUser
);

// Get users (admin only)
router.get("/", authMiddleware, authorize("admin"), getUsers);

// Get one user (admin or owner)
router.get("/:id", authMiddleware, getUserById);

// Update user (admin or owner)
router.patch("/:id", authMiddleware, updateUser);

// Soft delete (admin)
router.delete("/:id", authMiddleware, authorize("admin"), deleteUser);

// Change own password
router.post("/change-password", authMiddleware, [
  body("currentPassword").isString().notEmpty(),
  body("newPassword").isLength({ min: 6 })
], validateRequest, changePassword);

export default router;
