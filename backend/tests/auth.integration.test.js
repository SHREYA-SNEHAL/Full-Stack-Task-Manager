import request from "supertest";
import app from "../src/index.js";
import sequelize from "../src/config/db.js";

describe("Auth Integration", () => {
  beforeAll(async () => {
    
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test("register creates a user and hides password", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "user1@example.com", password: "pass123", role: "user" });

    expect(res.status).toBe(201);
    expect(res.body.email).toBe("user1@example.com");
    expect(res.body).not.toHaveProperty("password");
  });

  test("register returns 500 on duplicate email", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ email: "dupe@example.com", password: "p", role: "user" });

    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "dupe@example.com", password: "p", role: "user" });
    // current controller returns 500 for any error
    expect([409, 500]).toContain(res.status);
  });

  test("login returns a JWT for valid credentials", async () => {
    // register second user then login
    await request(app)
      .post("/api/auth/register")
      .send({ email: "user2@example.com", password: "pass123", role: "user" });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "user2@example.com", password: "pass123" });

    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe("string");
  });

  test("login fails for wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "user2@example.com", password: "wrong" });
    expect(res.status).toBe(401);
  });

  test("login fails for non-existent user", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nouser@example.com", password: "pass123" });
    expect(res.status).toBe(404);
  });
});
