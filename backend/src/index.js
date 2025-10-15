import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import sequelize from "./config/db.js";
import User from "./models/User.js";
import Task from "./models/Task.js";
import taskRoutes from "./routes/taskRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import usersRoutes from "./routes/usersRoutes.js";



dotenv.config();
const app = express();
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));




app.use(express.json());

// Relationships
Task.belongsTo(User, { foreignKey: "assignedTo", as: "assignee" });
User.hasMany(Task, { foreignKey: "assignedTo", as: "tasks" });


// test database connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully!");
    await sequelize.sync({ alter: true });
    console.log("✅ All models synced!");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }
})();




app.get('/health', (req, res) => {
res.json({ status: 'OK' });
});

app.use("/api/tasks", taskRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/uploads", express.static("uploads"));



const PORT = process.env.PORT || 6000;
app.listen(PORT,'0.0.0.0', () => console.log(`Server running on port ${PORT}`));
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, ()=> console.log("Server..."));
}
export default app;