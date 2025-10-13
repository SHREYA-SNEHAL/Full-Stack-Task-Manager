import express from "express";
import {
  createUser,
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/usersController.js";
import { authenticate, isAdmin } from "../middlewares/auth.js";

const router = express.Router();

// Public registration remains at /api/auth/register -- keep that
// Admin routes:
router.post("/", authenticate, isAdmin, createUser);
router.get("/", authenticate, isAdmin, listUsers);
router.get("/:id", authenticate, getUserById);        // permitted: admin or self
router.put("/:id", authenticate, updateUser);        // permitted: admin or self
router.delete("/:id", authenticate, isAdmin, deleteUser);

export default router;
