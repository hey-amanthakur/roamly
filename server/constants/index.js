const PAGE_LIMITS = {
  DEFAULT: 5,
  SEARCH: 10,
  DRAFTS: 10,
  DASHBOARD: 10,
  BOOKMARKS: 10,
  MAX: 50,
};

const RELATED_POSTS_LIMIT = 5;

const PASSWORD_MIN_LENGTH = 6;
const BCRYPT_SALT_ROUNDS = 10;
const JWT_EXPIRY = "3d";

const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024,
  ALLOWED_EXTENSIONS: /jpeg|jpg|png|gif|webp/,
};

const TRENDING_WINDOW_MS = 3 * 24 * 60 * 60 * 1000;

const ALLOWED_POST_FIELDS = [
  "title",
  "desc",
  "photos",
  "photo",
  "categories",
  "tags",
  "location",
  "status",
];

const ALLOWED_USER_FIELDS = ["username", "email", "bio", "profilePic"];

module.exports = {
  PAGE_LIMITS,
  RELATED_POSTS_LIMIT,
  PASSWORD_MIN_LENGTH,
  BCRYPT_SALT_ROUNDS,
  JWT_EXPIRY,
  FILE_UPLOAD,
  TRENDING_WINDOW_MS,
  ALLOWED_POST_FIELDS,
  ALLOWED_USER_FIELDS,
};
