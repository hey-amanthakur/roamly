import express, { Request, Response, ErrorRequestHandler } from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import { Readable } from "stream";
import cors from "cors";
import helmet from "helmet";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { RetryEngine, exponential } from "@hey-amanthakur/retry-box";

import authRoute from "./routes/auth";
import userRoute from "./routes/users";
import postRoute from "./routes/posts";
import categoryRoute from "./routes/categories";
import searchRoute from "./routes/search";
import bookmarkRoute from "./routes/bookmarks";
import reportRoute from "./routes/reports";
import newsletterRoute from "./routes/newsletter";
import analyticsRoute from "./routes/analytics";
import { FILE_UPLOAD } from "./constants";
import { verifyToken } from "./middleware/auth";
import { globalRateLimit } from "./middleware/rateLimit";

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.warn(
    "WARNING: JWT_SECRET is not set — falling back to an insecure default. Set it before deploying."
  );
}

const app = express();
const port = process.env.PORT || 5001;

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Swagger configuration
const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Roamly API",
        version: "1.0.0",
        description:
          "API for Roamly — a travel experience sharing platform with posts, users, bookmarks, comments, and more.",
      contact: {
        name: "Aman Thakur",
        url: "https://github.com/amanthakur",
      },
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./routes/*.ts", "./routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: ".swagger-ui .topbar { display: none }",
  customSiteTitle: "Roamly API Docs",
}));

// Serve Swagger spec as JSON
app.get("/api-docs.json", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// MongoDB connection with retry (retry-box)
const mongoRetry = new RetryEngine({
  maxAttempts: 5,
  strategy: exponential({ initialDelay: 1000, multiplier: 2, maxDelay: 15000 }),
  timeout: 10000,
});

mongoRetry
  .run(() => mongoose.connect(process.env.MONGO_URL || "mongodb://localhost:27017/roamly"))
  .then(() => console.log("Connected to MongoDB"))
  .catch((err: unknown) => {
    console.error(
      "Failed to connect to MongoDB after retries:",
      err instanceof Error ? err.message : err
    );
    process.exit(1);
  });

// CORS must run before rate limiting so rejected requests still carry CORS headers
app.use(cors());
app.use(express.json());

// Global rate limiting (throttle-box)
app.use(globalRateLimit);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, server is up and running...");
});

// GridFS bucket (initialized after MongoDB connects)
let gfs: InstanceType<typeof mongoose.mongo.GridFSBucket>;
mongoose.connection.on("open", () => {
  gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db!, { bucketName: "uploads" });
  console.log("GridFS bucket initialized");
});

// File upload configuration (memory storage — files buffered then written to GridFS)
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (
    _req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ): void => {
    const extOk = FILE_UPLOAD.ALLOWED_EXTENSIONS.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimeOk = (FILE_UPLOAD.ALLOWED_MIMES as readonly string[]).includes(file.mimetype);
    if (extOk && mimeOk) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed (jpg, png, gif, webp)"));
    }
  },
  limits: { fileSize: FILE_UPLOAD.MAX_SIZE },
});

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Upload an image file
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *       400:
 *         description: No file uploaded or invalid file type
 */
app.post(
  "/api/upload",
  verifyToken,
  upload.single("file"),
  async (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }
    if (!gfs) {
      res.status(503).json({ message: "Storage not ready" });
      return;
    }

    const filename = req.body.name || req.file.originalname;
    const ext = path.extname(req.file.originalname);
    const contentType = req.file.mimetype;

    const uploadStream = gfs.openUploadStream(filename, {
      contentType,
      metadata: { originalName: req.file.originalname, ext },
    });

    const readableStream = new Readable();
    readableStream.push(req.file.buffer);
    readableStream.push(null);

    readableStream.pipe(uploadStream);

    uploadStream.on("finish", () => {
      res.status(200).json({ filename });
    });
    uploadStream.on("error", (err: Error) => {
      res.status(500).json({ message: "Upload failed: " + err.message });
    });
  }
);

/**
 * @swagger
 * /api/images/{filename}:
 *   get:
 *     summary: Serve an image from GridFS
 *     tags: [Upload]
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Image file
 *       404:
 *         description: File not found
 */
app.get("/api/images/:filename", async (req: Request, res: Response) => {
  if (!gfs) {
    res.status(503).json({ message: "Storage not ready" });
    return;
  }

  try {
    const files = await gfs.find({ filename: req.params.filename }).toArray();
    if (!files || files.length === 0) {
      res.status(404).json({ message: "File not found" });
      return;
    }

    const file = files[0];
    res.set("Content-Type", file.contentType || "application/octet-stream");
    res.set("Cache-Control", "public, max-age=31536000, immutable");

    const downloadStream = gfs.openDownloadStream(file._id);
    downloadStream.pipe(res);
    downloadStream.on("error", () => {
      res.status(404).json({ message: "File not found" });
    });
  } catch {
    res.status(500).json({ message: "Error retrieving file" });
  }
});

// Routes
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/categories", categoryRoute);
app.use("/api/search", searchRoute);
app.use("/api/bookmarks", bookmarkRoute);
app.use("/api/reports", reportRoute);
app.use("/api/newsletter", newsletterRoute);
app.use("/api/analytics", analyticsRoute);

// Error handling middleware
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    res.status(400).json({ message: `Upload error: ${err.message}` });
    return;
  }
  if (err instanceof Error && err.message) {
    res.status(400).json({ message: err.message });
    return;
  }
  res.status(500).json({ message: "Internal server error" });
  next();
};
app.use(errorHandler);

export { app };

app.listen(port, () => {
  console.log(`Backend is running at ${port}`);
  console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
});
