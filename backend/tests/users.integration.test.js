import request from "supertest";
import app from "../src/index.js";
import sequelize from "../src/config/db.js";

async function registerAndLogin(email, password, role = "user") {
  await request(app).post("/api/auth/register").send({ email, password, role });
  const login = await request(app).post("/api/auth/login").send({ email, password });
  return login.body.token;
}

function decodeId(token) {
  const [, payload] = token.split(".");
  return JSON.parse(Buffer.from(payload, "base64").toString("utf8")).id;
}

describe("Users Integration", () => {
  let adminToken, userToken, userId;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    adminToken = await registerAndLogin("admin2@example.com", "adminpass", "admin");
    userToken = await registerAndLogin("user3@example.com", "pass123", "user");
    userId = decodeId(userToken);
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test("admin can list users with pagination", async () => {
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("users");
  });

  test("non-admin cannot list users", async () => {
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  test("user can get their own profile, not others", async () => {
    const self = await request(app)
      .get(`/api/users/${userId}`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(self.status).toBe(200);

    const other = await request(app)
      .get(`/api/users/${userId + 1}`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(other.status).toBe(403);
  });

  test("admin can create a user and delete a user", async () => {
    const create = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "NewUser", email: "new@example.com", password: "xxyyzz", role: "user" });
    expect(create.status).toBe(201);

    const id = create.body.id;
    const del = await request(app)
      .delete(`/api/users/${id}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(del.status).toBe(200);
  });

  test("createUser returns 400 when missing required fields", async () => {
    const res = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ email: "missing@name.com", password: "abc" });
    expect(res.status).toBe(400);
  });

  test("user can update own profile email; cannot update others", async () => {
    const selfUpdate = await request(app)
      .put(`/api/users/${userId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ email: "user3new@example.com" });
    expect(selfUpdate.status).toBe(200);
    expect(selfUpdate.body.email).toBe("user3new@example.com");

    const otherUpdate = await request(app)
      .put(`/api/users/${userId + 1}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ email: "hacker@example.com" });
    expect(otherUpdate.status).toBe(403);
  });

  test("admin can update role; duplicate email update returns 409", async () => {
    // Create another user to cause duplicate email conflict
    const u2Token = await registerAndLogin("dupeu@example.com", "pass123", "user");
    const u2Id = decodeId(u2Token);

    // Admin can elevate user role
    const roleUpdate = await request(app)
      .put(`/api/users/${u2Id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ role: "admin" });
    expect(roleUpdate.status).toBe(200);
    expect(roleUpdate.body.role).toBe("admin");

    // Attempt to change email to existing one
    const dup = await request(app)
      .put(`/api/users/${u2Id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ email: "admin2@example.com" });
    expect(dup.status).toBe(409);
  });

  test("getUserById returns 404 for non-existent user; delete returns 404/403", async () => {
    const notFound = await request(app)
      .get(`/api/users/999999`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(notFound.status).toBe(404);

    const del404 = await request(app)
      .delete(`/api/users/999999`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(del404.status).toBe(404);

    const del403 = await request(app)
      .delete(`/api/users/${userId}`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(del403.status).toBe(403);
  });
});
