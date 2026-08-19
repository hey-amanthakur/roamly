process.env.JWT_SECRET = "test-secret";

import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";

const mockFindOne = jest.fn();
const mockSave = jest.fn();

jest.mock("../../models/Report", () => {
  const MockReport = function (data) {
    this._doc = { ...data, _id: "rpt1" };
    this.save = mockSave;
  };
  MockReport.findOne = mockFindOne;
  return MockReport;
});

jest.mock("../../models/User", () => ({ findById: jest.fn().mockResolvedValue({ _id: "507f1f77bcf86cd799439011" }) }));
jest.mock("../../models/Post", () => ({ findById: jest.fn().mockResolvedValue({ _id: "507f1f77bcf86cd799439011" }) }));

import Report from "../../models/Report";
import reportsRouter from "../../routes/reports";

const app = express();
app.use(express.json());
app.use("/api/reports", reportsRouter);

const JWT_SECRET = process.env.JWT_SECRET as string;

const generateToken = (payload: any): string => jwt.sign(payload, JWT_SECRET);

describe("Reports Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/reports", () => {
    it("should return 401 without auth token", async () => {
      const res = await request(app)
        .post("/api/reports")
        .send({ targetType: "post", targetId: "p1", reason: "spam" });
      expect(res.status).toBe(401);
    });

    it("should return 400 if fields are missing", async () => {
      const token = generateToken({ id: "user1", username: "test" });
      const res = await request(app)
        .post("/api/reports")
        .set("Authorization", `Bearer ${token}`)
        .send({ targetType: "post" });
      expect(res.status).toBe(400);
    });

    it("should return 400 for invalid target type", async () => {
      const token = generateToken({ id: "user1", username: "test" });
      const res = await request(app)
        .post("/api/reports")
        .set("Authorization", `Bearer ${token}`)
        .send({ targetType: "invalid", targetId: "p1", reason: "spam" });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid target type");
    });

    it("should return 400 for invalid reason", async () => {
      const token = generateToken({ id: "user1", username: "test" });
      const res = await request(app)
        .post("/api/reports")
        .set("Authorization", `Bearer ${token}`)
        .send({ targetType: "post", targetId: "p1", reason: "invalid-reason" });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid reason");
    });

    it("should return 400 if already reported", async () => {
      const token = generateToken({ id: "user1", username: "test" });
      mockFindOne.mockResolvedValue({ reporterId: "user1" });
      const res = await request(app)
        .post("/api/reports")
        .set("Authorization", `Bearer ${token}`)
        .send({ targetType: "post", targetId: "507f1f77bcf86cd799439011", reason: "spam" });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("You have already reported this");
    });

    it("should create report successfully", async () => {
      const token = generateToken({ id: "user1", username: "test" });
      mockFindOne.mockResolvedValue(null);
      mockSave.mockResolvedValue(true);

      const res = await request(app)
        .post("/api/reports")
        .set("Authorization", `Bearer ${token}`)
        .send({
          targetType: "post",
          targetId: "507f1f77bcf86cd799439011",
          reason: "spam",
          description: "Test description",
        });
      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Report submitted");
    });
  });
});
