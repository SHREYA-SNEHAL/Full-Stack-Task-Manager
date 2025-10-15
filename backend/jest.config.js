import db from "./src/config/db.js"; // relative path


export default async function globalSetup() {
  let retries = 5;
  while (retries) {
    try {
      await sequelize.authenticate();
      console.log("✅ Database connected for tests");
      break;
    } catch (err) {
      console.log("⏳ Waiting for Postgres...");
      retries -= 1;
      await new Promise((res) => setTimeout(res, 3000));
    }
  }
}
