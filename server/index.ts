import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import fs from "fs";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import cors from "cors";
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

const app = express();
const port = process.env.PORT || 5001;
const IMAGES_DIR = path.join(process.cwd(), "images");
fs.mkdirSync(IMAGES_DIR, { recursive: true });

// Swagger configuration
const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Travel Experience Sharing Platform API",
      version: "1.0.0",
      description:
        "API for a travel experience sharing platform with posts, users, bookmarks, comments, and more.",
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
  customSiteTitle: "Travel Platform API Docs",
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
  .run(() =>
    (mongoose as any).connect(
      process.env.MONGO_URL || "mongodb://localhost:27017/travel-blog"
    )
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((err: any) => {
    console.error("Failed to connect to MongoDB after retries:", err.message);
    process.exit(1);
  });

// Global rate limiting (throttle-box)
app.use(globalRateLimit);

app.use(cors());
app.use(express.json());
app.use("/images", express.static(IMAGES_DIR));

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, server is up and running...");
});

// File upload configuration
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: any) => {
    cb(null, IMAGES_DIR);
  },
  filename: (req: Request, file: Express.Multer.File, cb: any) => {
    if (req.body.name) {
      cb(null, req.body.name);
    } else {
      const ext = path.extname(file.originalname);
      const safeName = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
      cb(null, safeName);
    }
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: any
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
};

const upload = multer({
  storage,
  fileFilter,
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
  (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }
    res.status(200).json({ filename: req.file.filename });
  }
);

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
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    res.status(400).json({ message: `Upload error: ${err.message}` });
    return;
  }
  if (err.message) {
    res.status(400).json({ message: err.message });
    return;
  }
  res.status(500).json({ message: "Internal server error" });
});

export { app };

app.listen(port, () => {
  console.log(`Backend is running at ${port}`);
  console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
});
