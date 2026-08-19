export const PAGE_LIMITS = {
  DEFAULT: 5,
  SEARCH: 10,
  DRAFTS: 10,
  DASHBOARD: 10,
  BOOKMARKS: 10,
  MAX: 50,
} as const;

export const RELATED_POSTS_LIMIT = 5;

export const PASSWORD_MIN_LENGTH = 6;
export const BCRYPT_SALT_ROUNDS = 10;
export const JWT_EXPIRY = "3d";

export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024,
  ALLOWED_EXTENSIONS: /jpeg|jpg|png|gif|webp/,
} as const;

export const TRENDING_WINDOW_MS = 3 * 24 * 60 * 60 * 1000;

export const ALLOWED_POST_FIELDS = [
  "title",
  "desc",
  "photos",
  "photo",
  "categories",
  "tags",
  "location",
  "status",
] as const;

export const ALLOWED_USER_FIELDS = ["username", "email", "bio", "profilePic"] as const;

export type AllowedPostField = (typeof ALLOWED_POST_FIELDS)[number];
export type AllowedUserField = (typeof ALLOWED_USER_FIELDS)[number];
