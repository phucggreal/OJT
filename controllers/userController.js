import bcrypt from "bcryptjs";
import User from "../models/User.js";

/**
 * Create user (admin)
 */
export const createUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: "Email already exists" });
    }
    const hashed = await bcrypt.hash(password || Math.random().toString(36).slice(-8), 10);
    const user = await User.create({ username, email, password: hashed, role });
    const out = user.toObject();
    delete out.password;
    return res.status(201).json({ user: out });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get users (paginate, search, filter, sort)
 */
export const getUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1"));
    const limit = Math.max(1, parseInt(req.query.limit || "10"));
    const skip = (page - 1) * limit;
    const { search, role, isVerified, sort } = req.query;
    const filter = { isDeleted: false };
    if (role) filter.role = role;
    if (typeof isVerified !== "undefined") filter.isVerified = isVerified === "true";
    if (search) {
      filter.$text = { $search: search };
    }
    let sortObj = { createdAt: -1 };
    if (sort) {
      const [key, dir] = sort.split(":");
      sortObj = { [key]: dir === "asc" ? 1 : -1 };
    }
    const [items, total] = await Promise.all([
      User.find(filter).sort(sortObj).skip(skip).limit(limit).select("-password"),
      User.countDocuments(filter)
    ]);
    const totalPages = Math.ceil(total / limit);
    return res.json({ items, meta: { total, page, limit, totalPages } });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get user by id
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password");
    if (!user || user.isDeleted) return res.status(404).json({ message: "User not found" });
    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Update user (admin or owner)
 */
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    delete updates.password;
    delete updates.refreshToken;
    delete updates.otpCode;
    delete updates.otpExpires;
    delete updates.resetVerified;
    delete updates.isDeleted;
    if (req.user.role !== "admin" && req.user._id.toString() !== id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const user = await User.findByIdAndUpdate(id, updates, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Soft delete user (admin)
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
    const user = await User.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ message: "User deleted (soft)", userId: id });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Change password (owner)
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Current password incorrect" });
    if (await bcrypt.compare(newPassword, user.password)) {
      return res.status(400).json({ message: "New password must be different" });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    return res.json({ message: "Password changed successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
