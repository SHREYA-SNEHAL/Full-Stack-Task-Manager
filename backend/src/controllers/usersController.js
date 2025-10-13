import bcrypt from "bcrypt";
import User from "../models/User.js";

// Create user (admin only) — password is hashed
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role = "user" } = req.body;
    if (!email || !password || !name) return res.status(400).json({ message: "name, email and password required" });

    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ message: "Email already in use" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role });
    // hide password in response
    user.password = undefined;
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// List users with filtering, sorting, pagination (admin only)
export const listUsers = async (req, res) => {
  try {
    const { role, email, sort = "id", order = "ASC", page = 1, limit = 10 } = req.query;
    const where = {};
    if (role) where.role = role;
    if (email) where.email = email;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const result = await User.findAndCountAll({
      where,
      order: [[sort, order.toUpperCase()]],
      limit: parseInt(limit),
      offset,
      attributes: { exclude: ["password"] },
    });

    res.json({
      total: result.count,
      page: parseInt(page),
      pages: Math.ceil(result.count / parseInt(limit)),
      users: result.rows,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get user by ID (admin can get any user, user can get self)
export const getUserById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    // If not admin, only allow access to own user
    if (req.user.role !== "admin" && req.user.id !== id) {
      return res.status(403).json({ message: "Not authorized" });
    }
    const user = await User.findByPk(id, { attributes: { exclude: ["password"] } });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update user (admin can update any; user can update self)
// If password provided, hash it
export const updateUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (req.user.role !== "admin" && req.user.id !== id) {
      return res.status(403).json({ message: "Not authorized" });
    }
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { name, email, password, role } = req.body;

    if (email && email !== user.email) {
      const existing = await User.findOne({ where: { email } });
      if (existing) return res.status(409).json({ message: "Email already in use" });
    }

    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (typeof role !== "undefined" && req.user.role === "admin") updates.role = role; // only admin can change role
    if (password) updates.password = await bcrypt.hash(password, 10);

    await user.update(updates);
    const safe = user.toJSON();
    delete safe.password;
    res.json(safe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete user (admin only)
export const deleteUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Admins only" });

    const id = parseInt(req.params.id);
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.destroy();
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
