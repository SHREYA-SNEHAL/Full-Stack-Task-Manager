import Task from "../models/Task.js";
import User from "../models/User.js";


// ✅ Create a new task
export const createTask = async (req, res) => {
  try {
    const files = req.files ? req.files.map((f) => f.filename) : [];
    const taskData = { ...req.body, documents: files };
    const task = await Task.create(taskData);
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get all tasks
export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.findAll();
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get task by ID
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update task
export const updateTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Only admin or task owner can update
    if (req.user.role !== "admin" && task.assignedTo !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const files = req.files ? req.files.map((f) => f.filename) : task.documents;
    await task.update({ ...req.body, documents: files });
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Delete task
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Only admin or task owner can delete
    if (req.user.role !== "admin" && task.assignedTo !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await task.destroy();
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//GET /api/tasks with Filters, Sorting, Pagination
export const getTask = async (req, res) => {
  try {
    const { status, priority, assignedTo, sort = "dueDate", order = "ASC", page = 1, limit = 10 } = req.query;

    const whereClause = {};

    // Filter by status
    if (status) whereClause.status = status;

    // Filter by priority
    if (priority) whereClause.priority = priority;

    // Filter by assigned user
    if (assignedTo) whereClause.assignedTo = assignedTo;

    // Regular users should only see their own tasks
    if (req.user.role !== "admin") {
      whereClause.assignedTo = req.user.id;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const tasks = await Task.findAndCountAll({
      where: whereClause,
      order: [[sort, order.toUpperCase()]],
      limit: parseInt(limit),
      offset,
      include: [{ model: User, attributes: ["id", "name", "email"] }], // optional: show assigned user details
    });

    res.json({
      total: tasks.count,
      page: parseInt(page),
      pages: Math.ceil(tasks.count / parseInt(limit)),
      tasks: tasks.rows,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
