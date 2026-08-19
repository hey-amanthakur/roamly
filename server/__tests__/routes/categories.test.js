const request = require("supertest");
const express = require("express");

const mockSave = jest.fn();
const mockFind = jest.fn();

jest.mock("../../models/Category", () => {
  const MockCategory = function (data) {
    this._doc = { ...data, _id: "cat1" };
    this.save = mockSave;
  };
  MockCategory.find = mockFind;
  return MockCategory;
});

const Category = require("../../models/Category");
const categoriesRouter = require("../../routes/categories");

const app = express();
app.use(express.json());
app.use("/api/categories", categoriesRouter);

describe("Categories Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/categories", () => {
    it("should return 400 if name is missing", async () => {
      const res = await request(app)
        .post("/api/categories")
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Category name is required");
    });

    it("should return 400 if name is empty", async () => {
      const res = await request(app)
        .post("/api/categories")
        .send({ name: "  " });
      expect(res.status).toBe(400);
    });

    it("should create category and return 201", async () => {
      mockSave.mockResolvedValue(true);
      const res = await request(app)
        .post("/api/categories")
        .send({ name: "Travel" });
      expect(res.status).toBe(201);
    });

    it("should return 400 for duplicate category", async () => {
      const err = new Error("Duplicate");
      err.code = 11000;
      mockSave.mockRejectedValue(err);

      const res = await request(app)
        .post("/api/categories")
        .send({ name: "Travel" });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Category already exists");
    });
  });

  describe("GET /api/categories", () => {
    it("should return all categories", async () => {
      mockFind.mockReturnValue({
        sort: jest.fn().mockResolvedValue([
          { _id: "1", name: "Food" },
          { _id: "2", name: "Travel" },
        ]),
      });

      const res = await request(app).get("/api/categories");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});
