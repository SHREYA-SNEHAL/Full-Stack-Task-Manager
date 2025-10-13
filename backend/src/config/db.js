import { Sequelize } from "sequelize";

const sequelize = new Sequelize("task_manager_db", "root", "Shreya@19", {
  host: "localhost",
  dialect: "mysql", 
});

export default sequelize;