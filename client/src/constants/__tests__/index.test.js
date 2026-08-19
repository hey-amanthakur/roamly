import {
  CATEGORIES,
  SORT_OPTIONS,
  DEFAULT_AVATAR,
  PAGE_LIMITS,
  MAX_UPLOAD_FILES,
  PASSWORD_MIN_LENGTH,
  BIO_MAX_LENGTH,
  SOCIAL_LINKS,
  AUTHOR,
  ROUTES,
  COLORS,
  HERO_IMAGE,
  HERO_STATS,
  HERO_TECH,
  PRESET_LOCATIONS,
  REPORT_REASONS,
} from "../index";

describe("constants", () => {
  describe("CATEGORIES", () => {
    it("should have 3 categories", () => {
      expect(CATEGORIES).toHaveLength(3);
    });

    it("each category should have key, label, and icon", () => {
      CATEGORIES.forEach((cat) => {
        expect(cat).toHaveProperty("key");
        expect(cat).toHaveProperty("label");
        expect(cat).toHaveProperty("icon");
        expect(cat).toHaveProperty("desc");
      });
    });

    it("should include travel, food, and code", () => {
      const keys = CATEGORIES.map((c) => c.key);
      expect(keys).toContain("travel");
      expect(keys).toContain("food");
      expect(keys).toContain("code");
    });
  });

  describe("SORT_OPTIONS", () => {
    it("should have 4 sort options", () => {
      expect(SORT_OPTIONS).toHaveLength(4);
    });

    it("should include empty value for latest", () => {
      expect(SORT_OPTIONS[0].value).toBe("");
    });
  });

  describe("DEFAULT_AVATAR", () => {
    it("should be a non-empty string", () => {
      expect(typeof DEFAULT_AVATAR).toBe("string");
      expect(DEFAULT_AVATAR.length).toBeGreaterThan(0);
    });
  });

  describe("PAGE_LIMITS", () => {
    it("should have DEFAULT and PROFILE limits", () => {
      expect(PAGE_LIMITS).toHaveProperty("DEFAULT");
      expect(PAGE_LIMITS).toHaveProperty("PROFILE");
    });

    it("PROFILE should be smaller than DEFAULT", () => {
      expect(PAGE_LIMITS.PROFILE).toBeLessThan(PAGE_LIMITS.DEFAULT);
    });
  });

  describe("MAX_UPLOAD_FILES", () => {
    it("should be 5", () => {
      expect(MAX_UPLOAD_FILES).toBe(5);
    });
  });

  describe("PASSWORD_MIN_LENGTH", () => {
    it("should be at least 6", () => {
      expect(PASSWORD_MIN_LENGTH).toBeGreaterThanOrEqual(6);
    });
  });

  describe("BIO_MAX_LENGTH", () => {
    it("should be 200", () => {
      expect(BIO_MAX_LENGTH).toBe(200);
    });
  });

  describe("SOCIAL_LINKS", () => {
    it("should have github, twitter, linkedin, instagram", () => {
      expect(SOCIAL_LINKS).toHaveProperty("github");
      expect(SOCIAL_LINKS).toHaveProperty("twitter");
      expect(SOCIAL_LINKS).toHaveProperty("linkedin");
      expect(SOCIAL_LINKS).toHaveProperty("instagram");
      expect(SOCIAL_LINKS).toHaveProperty("avatar");
    });

    it("all links should be valid URLs", () => {
      Object.values(SOCIAL_LINKS).forEach((url) => {
        expect(url).toMatch(/^https?:\/\//);
      });
    });
  });

  describe("AUTHOR", () => {
    it("should have name and bio", () => {
      expect(AUTHOR).toHaveProperty("name");
      expect(AUTHOR).toHaveProperty("bio");
      expect(AUTHOR.name.length).toBeGreaterThan(0);
      expect(AUTHOR.bio.length).toBeGreaterThan(0);
    });
  });

  describe("ROUTES", () => {
    it("should have all main routes", () => {
      expect(ROUTES.HOME).toBe("/");
      expect(ROUTES.LOGIN).toBe("/login");
      expect(ROUTES.REGISTER).toBe("/register");
      expect(ROUTES.WRITE).toBe("/write");
      expect(ROUTES.SETTINGS).toBe("/settings");
      expect(ROUTES.BOOKMARKS).toBe("/bookmarks");
      expect(ROUTES.TRENDING).toBe("/trending");
      expect(ROUTES.DASHBOARD).toBe("/dashboard");
    });
  });

  describe("COLORS", () => {
    it("should have muted, error, gray, teal, green", () => {
      expect(COLORS).toHaveProperty("muted");
      expect(COLORS).toHaveProperty("error");
      expect(COLORS).toHaveProperty("gray");
      expect(COLORS).toHaveProperty("teal");
      expect(COLORS).toHaveProperty("green");
    });
  });

  describe("HERO_IMAGE", () => {
    it("should be a valid URL", () => {
      expect(HERO_IMAGE).toMatch(/^https?:\/\//);
    });
  });

  describe("HERO_STATS", () => {
    it("should have 3 stats", () => {
      expect(HERO_STATS).toHaveLength(3);
    });

    it("each stat should have value and label", () => {
      HERO_STATS.forEach((stat) => {
        expect(stat).toHaveProperty("value");
        expect(stat).toHaveProperty("label");
      });
    });
  });

  describe("HERO_TECH", () => {
    it("should have 5 tech items", () => {
      expect(HERO_TECH).toHaveLength(5);
    });

    it("should include React and Node.js", () => {
      expect(HERO_TECH).toContain("React");
      expect(HERO_TECH).toContain("Node.js");
    });
  });

  describe("PRESET_LOCATIONS", () => {
    it("should have 10 preset locations", () => {
      expect(PRESET_LOCATIONS).toHaveLength(10);
    });

    it("each location should have name, city, country, lat, lng", () => {
      PRESET_LOCATIONS.forEach((loc) => {
        expect(loc).toHaveProperty("name");
        expect(loc).toHaveProperty("city");
        expect(loc).toHaveProperty("country");
        expect(loc).toHaveProperty("lat");
        expect(loc).toHaveProperty("lng");
      });
    });

    it("should include Paris and Tokyo", () => {
      const names = PRESET_LOCATIONS.map((l) => l.name);
      expect(names).toContain("Paris, France");
      expect(names).toContain("Tokyo, Japan");
    });
  });

  describe("REPORT_REASONS", () => {
    it("should have 6 report reasons", () => {
      expect(REPORT_REASONS).toHaveLength(6);
    });

    it("each reason should have value and label", () => {
      REPORT_REASONS.forEach((r) => {
        expect(r).toHaveProperty("value");
        expect(r).toHaveProperty("label");
      });
    });

    it("should include spam and harassment", () => {
      const values = REPORT_REASONS.map((r) => r.value);
      expect(values).toContain("spam");
      expect(values).toContain("harassment");
    });
  });
});
