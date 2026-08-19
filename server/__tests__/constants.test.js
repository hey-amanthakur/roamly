const constants = require("../constants");

describe("constants", () => {
  describe("PAGE_LIMITS", () => {
    it("should have valid page limits", () => {
      expect(constants.PAGE_LIMITS.DEFAULT).toBeGreaterThan(0);
      expect(constants.PAGE_LIMITS.MAX).toBeGreaterThan(constants.PAGE_LIMITS.DEFAULT);
      expect(constants.PAGE_LIMITS.SEARCH).toBeGreaterThan(0);
      expect(constants.PAGE_LIMITS.DRAFTS).toBeGreaterThan(0);
      expect(constants.PAGE_LIMITS.DASHBOARD).toBeGreaterThan(0);
      expect(constants.PAGE_LIMITS.BOOKMARKS).toBeGreaterThan(0);
    });
  });

  describe("PASSWORD_MIN_LENGTH", () => {
    it("should be at least 6", () => {
      expect(constants.PASSWORD_MIN_LENGTH).toBeGreaterThanOrEqual(6);
    });
  });

  describe("BCRYPT_SALT_ROUNDS", () => {
    it("should be a positive number", () => {
      expect(constants.BCRYPT_SALT_ROUNDS).toBeGreaterThan(0);
    });
  });

  describe("JWT_EXPIRY", () => {
    it("should be a valid expiry string", () => {
      expect(constants.JWT_EXPIRY).toMatch(/^\d+[dhm]$/);
    });
  });

  describe("FILE_UPLOAD", () => {
    it("should have valid max size (5MB)", () => {
      expect(constants.FILE_UPLOAD.MAX_SIZE).toBe(5 * 1024 * 1024);
    });

    it("should have valid allowed extensions regex", () => {
      expect(constants.FILE_UPLOAD.ALLOWED_EXTENSIONS.test("image.jpg")).toBe(true);
      expect(constants.FILE_UPLOAD.ALLOWED_EXTENSIONS.test("image.png")).toBe(true);
      expect(constants.FILE_UPLOAD.ALLOWED_EXTENSIONS.test("image.gif")).toBe(true);
      expect(constants.FILE_UPLOAD.ALLOWED_EXTENSIONS.test("image.webp")).toBe(true);
      expect(constants.FILE_UPLOAD.ALLOWED_EXTENSIONS.test("file.pdf")).toBe(false);
    });
  });

  describe("TRENDING_WINDOW_MS", () => {
    it("should be 3 days in milliseconds", () => {
      const THREE_DAYS = 3 * 24 * 60 * 60 * 1000;
      expect(constants.TRENDING_WINDOW_MS).toBe(THREE_DAYS);
    });
  });

  describe("ALLOWED_POST_FIELDS", () => {
    it("should contain required fields", () => {
      expect(constants.ALLOWED_POST_FIELDS).toContain("title");
      expect(constants.ALLOWED_POST_FIELDS).toContain("desc");
      expect(constants.ALLOWED_POST_FIELDS).toContain("photos");
      expect(constants.ALLOWED_POST_FIELDS).toContain("tags");
    });
  });

  describe("ALLOWED_USER_FIELDS", () => {
    it("should contain required fields", () => {
      expect(constants.ALLOWED_USER_FIELDS).toContain("username");
      expect(constants.ALLOWED_USER_FIELDS).toContain("email");
      expect(constants.ALLOWED_USER_FIELDS).toContain("bio");
    });

    it("should not contain password", () => {
      expect(constants.ALLOWED_USER_FIELDS).not.toContain("password");
    });
  });

  describe("RELATED_POSTS_LIMIT", () => {
    it("should be a small positive number", () => {
      expect(constants.RELATED_POSTS_LIMIT).toBeGreaterThan(0);
      expect(constants.RELATED_POSTS_LIMIT).toBeLessThanOrEqual(10);
    });
  });
});
