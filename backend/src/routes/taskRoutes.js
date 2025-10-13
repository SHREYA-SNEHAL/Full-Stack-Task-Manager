import express from "express";
import upload from "../middlewares/upload.js";
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from "../controllers/taskController.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

router.post("/", authenticate,upload.array("documents", 3), createTask);    // Create
router.get("/", authenticate, getTasks);       // Read all
router.get("/:id", authenticate, getTaskById);  // Read one
router.put("/:id", authenticate,upload.array("documents", 3), updateTask); // Update
router.delete("/:id", authenticate, deleteTask);// Delete

export default router;
