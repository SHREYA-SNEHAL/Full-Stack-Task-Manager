import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";
import { authenticate, isAdmin } from "../src/middlewares/auth.js";

const JWT_SECRET = "Key"; // must match middleware

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

describe("auth middleware", () => {
  test("responds 401 when no Authorization header", () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = jest.fn();

    authenticate(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.payload).toHaveProperty("message", "Missing token");
    expect(next).not.toHaveBeenCalled();
  });

  test("responds 401 for invalid token", () => {
    const req = { headers: { authorization: "Bearer invalid" } };
    const res = mockRes();
    const next = jest.fn();

    authenticate(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.payload).toHaveProperty("message", "Invalid token");
    expect(next).not.toHaveBeenCalled();
  });

  test("calls next and sets req.user for valid token", () => {
    const token = jwt.sign({ id: 123, role: "user" }, JWT_SECRET, { expiresIn: "1h" });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = jest.fn();

    authenticate(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual(expect.objectContaining({ id: 123, role: "user" }));
  });

  test("isAdmin denies non-admins", () => {
    const req = { user: { id: 1, role: "user" } };
    const res = mockRes();
    const next = jest.fn();

    isAdmin(req, res, next);

    expect(res.statusCode).toBe(403);
    expect(res.payload).toHaveProperty("message", "Admins only");
    expect(next).not.toHaveBeenCalled();
  });

  test("isAdmin allows admins", () => {
    const req = { user: { id: 1, role: "admin" } };
    const res = mockRes();
    const next = jest.fn();

    isAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
