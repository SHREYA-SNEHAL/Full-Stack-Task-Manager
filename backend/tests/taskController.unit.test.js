import { getTask } from "../src/controllers/taskController.js";
import sequelize from "../src/config/db.js";
import Task from "../src/models/Task.js";
import User from "../src/models/User.js";
import "../src/index.js"; // ensure associations

function mockRes() {
  const res = {};
  res.statusCode = 200;
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (payload) => {
    res.payload = payload;
    return res;
  };
  return res;
}

describe("taskController.getTask (unit)", () => {
  let admin, userA, userB;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    admin = await User.create({ email: "adminu@example.com", password: "x", role: "admin" });
    userA = await User.create({ email: "ua@example.com", password: "x", role: "user" });
    userB = await User.create({ email: "ub@example.com", password: "x", role: "user" });

    await Task.bulkCreate([
      { title: "T1", status: "pending", priority: "low", assignedTo: userA.id },
      { title: "T2", status: "in-progress", priority: "high", assignedTo: userA.id },
      { title: "T3", status: "completed", priority: "medium", assignedTo: userB.id },
    ]);
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test("admin can filter by status and sort desc", async () => {
    const req = {
      query: { status: "pending", sort: "id", order: "DESC", page: 1, limit: 10 },
      user: { id: admin.id, role: "admin" },
    };
    const res = mockRes();
    await getTask(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.payload.total).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(res.payload.tasks)).toBe(true);
  });

  test("regular user only sees own tasks regardless of filter", async () => {
    const req = {
      query: { status: "completed", page: 1, limit: 10 },
      user: { id: userA.id, role: "user" },
    };
    const res = mockRes();
    await getTask(req, res);
    expect(res.statusCode).toBe(200);
    // userA should not see userB's completed task
    const tasks = res.payload.tasks;
    expect(tasks.every((t) => t.assignedTo === userA.id)).toBe(true);
  });
});
