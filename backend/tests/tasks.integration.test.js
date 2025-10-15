import request from "supertest";
import app from "../src/index.js";
import sequelize from "../src/config/db.js";

async function registerAndLogin(email, password, role = "user") {
  await request(app).post("/api/auth/register").send({ email, password, role });
  const login = await request(app).post("/api/auth/login").send({ email, password });
  return login.body.token;
}

describe("Tasks Integration", () => {
  let adminToken, userAToken, userBToken, userAId;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    adminToken = await registerAndLogin("admin@example.com", "adminpass", "admin");
    userAToken = await registerAndLogin("usera@example.com", "pass123", "user");
    userBToken = await registerAndLogin("userb@example.com", "pass123", "user");

    // decode token to get userA id (payload contains id)
    const [, payload] = userAToken.split(".");
    const decoded = JSON.parse(Buffer.from(payload, "base64").toString("utf8"));
    userAId = decoded.id;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test("GET /api/tasks requires auth", async () => {
    const res = await request(app).get("/api/tasks");
    expect(res.status).toBe(401);
  });

  test("admin can create a task for a user", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${adminToken}`)
      .field("title", "Task 1")
      .field("description", "Do something")
      .field("priority", "high")
      .field("assignedTo", String(userAId));

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
  });

  test("GET /api/tasks returns list for authenticated user", async () => {
    const res = await request(app)
      .get("/api/tasks")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("task owner can update their task", async () => {
    // create task assigned to userA
    const created = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${adminToken}`)
      .field("title", "Owner task")
      .field("assignedTo", String(userAId));

    const taskId = created.body.id;

    const res = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${userAToken}`)
      .field("title", "Owner task updated");

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Owner task updated");
  });

  test("non-owner non-admin cannot update task", async () => {
    // create task for userA
    const created = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${adminToken}`)
      .field("title", "Another task")
      .field("assignedTo", String(userAId));

    const taskId = created.body.id;

    const res = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${userBToken}`)
      .field("title", "Hacker update");

    expect(res.status).toBe(403);
  });

  test("getTaskById returns 404 when not found", async () => {
    const res = await request(app)
      .get("/api/tasks/999999")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });

  test("non-owner cannot delete task (403)", async () => {
    const created = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${adminToken}`)
      .field("title", "Delete Perm Test")
      .field("assignedTo", String(userAId));
    const taskId = created.body.id;

    const res = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${userBToken}`);
    expect(res.status).toBe(403);
  });

  test("updateTask returns 404 when not found", async () => {
    const res = await request(app)
      .put("/api/tasks/999999")
      .set("Authorization", `Bearer ${adminToken}`)
      .field("title", "nope");
    expect(res.status).toBe(404);
  });

  test("deleteTask returns 404 when not found", async () => {
    const res = await request(app)
      .delete("/api/tasks/999999")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });

  test("admin can delete task", async () => {
    const created = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${adminToken}`)
      .field("title", "Task to delete")
      .field("assignedTo", String(userAId));

    const taskId = created.body.id;

    const res = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "Task deleted successfully");
  });

  test("owner can delete their task", async () => {
    const created = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${adminToken}`)
      .field("title", "Owner deletes")
      .field("assignedTo", String(userAId));

    const taskId = created.body.id;

    const res = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${userAToken}`);

    expect(res.status).toBe(200);
  });

  test("createTask handles optional documents", async () => {
    const created = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${adminToken}`)
      .field("title", "No docs")
      .field("assignedTo", String(userAId));
    expect(created.status).toBe(201);
    expect(created.body.documents === null || Array.isArray(created.body.documents)).toBe(true);
  });
});
