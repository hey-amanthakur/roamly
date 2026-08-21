process.env.JWT_SECRET = "test-secret";

import request from "supertest";
import express from "express";

const mockFindOne = jest.fn();

jest.mock("../../models/User", () => {
  const MockUser = function (data) {
    this._doc = { ...data, _id: "newid", password: data.password };
    this.toObject = jest.fn().mockReturnValue(this._doc);
    this.save = jest.fn().mockResolvedValue(this);
  };
  MockUser.findOne = mockFindOne;
  MockUser.findById = jest.fn();
  return MockUser;
});

jest.mock("../../models/Post", () => ({}));
jest.mock("bcryptjs", () => ({
  genSalt: jest.fn().mockResolvedValue("$2b$10$"),
  hash: jest.fn().mockResolvedValue("$2b$10$hashedpassword"),
  compare: jest.fn(),
}));

import User from "../../models/User";
import authRouter from "../../routes/auth";

const app = express();
app.use(express.json());
app.use("/api/auth", authRouter);

describe("Auth Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/auth/register", () => {
    it("should return 400 if fields are missing", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ username: "test" });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("All fields are required");
    });

    it("should return 400 if password is too short", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ username: "test", email: "test@test.com", password: "123" });
      expect(res.status).toBe(400);
      expect(res.body.message).toContain("at least 6 characters");
    });

    it("should return 400 if user already exists", async () => {
      mockFindOne.mockResolvedValue({ email: "test@test.com", username: "existing" });
      const res = await request(app)
        .post("/api/auth/register")
        .send({ username: "test", email: "test@test.com", password: "password123" });
      expect(res.status).toBe(400);
    });

    it("should create user and return 201", async () => {
      mockFindOne.mockResolvedValue(null);

      const res = await request(app)
        .post("/api/auth/register")
        .send({ username: "newuser", email: "new@test.com", password: "password123" });
      expect(res.status).toBe(201);
    });
  });

  describe("POST /api/auth/login", () => {
    it("should return 400 if fields are missing", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ username: "test" });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Username and password are required");
    });

    it("should return 400 for wrong credentials (user not found)", async () => {
      mockFindOne.mockResolvedValue(null);
      const res = await request(app)
        .post("/api/auth/login")
        .send({ username: "nouser", password: "password123" });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Wrong credentials!");
    });

    it("should return 400 for wrong password", async () => {
      const bcrypt = require("bcryptjs") as { compare: jest.Mock };
      bcrypt.compare.mockResolvedValue(false);

      mockFindOne.mockResolvedValue({
        _id: "user1",
        username: "testuser",
        password: "$2b$10$hashedpassword",
        _doc: { _id: "user1", username: "testuser", password: "$2b$10$hashedpassword" },
      });

      const res = await request(app)
        .post("/api/auth/login")
        .send({ username: "testuser", password: "wrongpass" });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Wrong credentials!");
    });
  });
});
