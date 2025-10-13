import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Task = sequelize.define("Task", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  status: {
    type: DataTypes.ENUM("pending", "in-progress", "completed"),
    defaultValue: "pending",
  },

  priority: {
    type: DataTypes.ENUM("low", "medium", "high"),
    defaultValue: "medium",
  },

  dueDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },

  assignedTo: {
    type: DataTypes.STRING,
    allowNull: true, // could later be changed to a foreign key (user)
  },

  attachedDocuments: {
    type: DataTypes.JSON, // store array of file URLs or metadata
    allowNull: true,
  },
});

export default Task;
