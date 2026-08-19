process.env.JWT_SECRET = "test-secret";

const jwt = require("jsonwebtoken");
const { verifyToken, optionalToken } = require("../../middleware/auth");

const JWT_SECRET = process.env.JWT_SECRET;

describe("auth middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  describe("verifyToken", () => {
    it("should return 401 if no authorization header", () => {
      verifyToken(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Access denied. No token provided." });
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 401 if authorization header does not start with Bearer", () => {
      req.headers.authorization = "Basic abc123";
      verifyToken(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 403 for invalid token", () => {
      req.headers.authorization = "Bearer invalidtoken";
      verifyToken(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid or expired token." });
      expect(next).not.toHaveBeenCalled();
    });

    it("should call next and set req.user for valid token", () => {
      const payload = { id: "user123", username: "testuser" };
      const token = jwt.sign(payload, JWT_SECRET);
      req.headers.authorization = `Bearer ${token}`;

      verifyToken(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user.id).toBe("user123");
      expect(req.user.username).toBe("testuser");
    });
  });

  describe("optionalToken", () => {
    it("should call next without setting req.user if no header", () => {
      optionalToken(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(req.user).toBeUndefined();
    });

    it("should call next without setting req.user for invalid token", () => {
      req.headers.authorization = "Bearer invalidtoken";
      optionalToken(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(req.user).toBeUndefined();
    });

    it("should set req.user for valid token", () => {
      const payload = { id: "user123", username: "testuser" };
      const token = jwt.sign(payload, JWT_SECRET);
      req.headers.authorization = `Bearer ${token}`;

      optionalToken(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user.id).toBe("user123");
    });
  });
});
