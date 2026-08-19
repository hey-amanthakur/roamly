const request = require("supertest");
const express = require("express");

const mockFindOne = jest.fn();
const mockSave = jest.fn();

jest.mock("../../models/Newsletter", () => {
  const MockNewsletter = function (data) {
    this._doc = { ...data, _id: "nl1" };
    this.save = mockSave;
  };
  MockNewsletter.findOne = mockFindOne;
  return MockNewsletter;
});

const Newsletter = require("../../models/Newsletter");
const newsletterRouter = require("../../routes/newsletter");

const app = express();
app.use(express.json());
app.use("/api/newsletter", newsletterRouter);

describe("Newsletter Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/newsletter", () => {
    it("should return 400 if email is missing", async () => {
      const res = await request(app)
        .post("/api/newsletter")
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Email is required");
    });

    it("should return 400 for invalid email", async () => {
      const res = await request(app)
        .post("/api/newsletter")
        .send({ email: "notanemail" });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid email format");
    });

    it("should return 400 if already subscribed", async () => {
      mockFindOne.mockResolvedValue({ email: "test@test.com", active: true });
      const res = await request(app)
        .post("/api/newsletter")
        .send({ email: "test@test.com" });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Already subscribed");
    });

    it("should resubscribe inactive user", async () => {
      const mockSub = {
        email: "test@test.com",
        active: false,
        save: jest.fn().mockResolvedValue(true),
      };
      mockFindOne.mockResolvedValue(mockSub);

      const res = await request(app)
        .post("/api/newsletter")
        .send({ email: "test@test.com" });
      expect(res.status).toBe(200);
      expect(mockSub.active).toBe(true);
    });

    it("should create new subscription", async () => {
      mockFindOne.mockResolvedValue(null);
      mockSave.mockResolvedValue(true);

      const res = await request(app)
        .post("/api/newsletter")
        .send({ email: "new@test.com" });
      expect(res.status).toBe(201);
    });
  });

  describe("POST /api/newsletter/unsubscribe", () => {
    it("should return 400 if email is missing", async () => {
      const res = await request(app)
        .post("/api/newsletter/unsubscribe")
        .send({});
      expect(res.status).toBe(400);
    });

    it("should return 404 if subscription not found", async () => {
      mockFindOne.mockResolvedValue(null);
      const res = await request(app)
        .post("/api/newsletter/unsubscribe")
        .send({ email: "nobody@test.com" });
      expect(res.status).toBe(404);
    });

    it("should unsubscribe successfully", async () => {
      const mockSub = {
        email: "test@test.com",
        active: true,
        save: jest.fn().mockResolvedValue(true),
      };
      mockFindOne.mockResolvedValue(mockSub);

      const res = await request(app)
        .post("/api/newsletter/unsubscribe")
        .send({ email: "test@test.com" });
      expect(res.status).toBe(200);
      expect(mockSub.active).toBe(false);
    });
  });
});
