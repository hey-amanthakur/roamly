const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const authRoute = require("./routes/auth");
const userRoute = require("./routes/users");
const postRoute = require("./routes/posts");
const categoryRoute = require("./routes/categories");
const searchRoute = require("./routes/search");
const bookmarkRoute = require("./routes/bookmarks");
const reportRoute = require("./routes/reports");
const newsletterRoute = require("./routes/newsletter");
const analyticsRoute = require("./routes/analytics");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const { FILE_UPLOAD } = require("./constants");

dotenv.config();

const port = process.env.PORT || 5001;

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

app.use(cors());
app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "images")));

app.get("/", (req, res) => {
  res.send("Hello, server is up and running...");
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeName = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, safeName);
  },
});

const fileFilter = (req, file, cb) => {
  const extOk = FILE_UPLOAD.ALLOWED_EXTENSIONS.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = FILE_UPLOAD.ALLOWED_EXTENSIONS.test(file.mimetype);
  if (extOk && mimeOk) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpg, png, gif, webp)"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: FILE_UPLOAD.MAX_SIZE },
});

app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  res.status(200).json({ filename: req.file.filename });
});

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/categories", categoryRoute);
app.use("/api/search", searchRoute);
app.use("/api/bookmarks", bookmarkRoute);
app.use("/api/reports", reportRoute);
app.use("/api/newsletter", newsletterRoute);
app.use("/api/analytics", analyticsRoute);

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }
  if (err.message) {
    return res.status(400).json({ message: err.message });
  }
  res.status(500).json({ message: "Internal server error" });
});

app.listen(port, () => {
  console.log(`Backend is running at ${port}`);
});
