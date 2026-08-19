import { Router, Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  BCRYPT_SALT_ROUNDS,
  JWT_EXPIRY,
  PASSWORD_MIN_LENGTH,
} from "../constants";
import { IUserDocument } from "../types";

const router = Router();

const generateToken = (userId: string, username: string): string => {
  return jwt.sign({ id: userId, username }, process.env.JWT_SECRET || "", {
    expiresIn: JWT_EXPIRY,
  });
};

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password]
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error or user already exists
 *       500:
 *         description: Server error
 */
router.post("/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
      res.status(400).json({ message: "Password must be at least 6 characters" });
      return;
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });
    if (existingUser) {
      const field = existingUser.email === email ? "Email" : "Username";
      res.status(400).json({ message: `${field} already exists` });
      return;
    }

    const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
    const hashedPass = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPass,
    });

    const savedUser = await newUser.save();
    const { password: _, ...userWithoutPassword } = savedUser.toObject();

    res.status(201).json(userWithoutPassword);
  } catch (err) {
    res.status(500).json({ message: "Server error during registration" });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with username and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful, returns user data with JWT token
 *       400:
 *         description: Wrong credentials
 *       500:
 *         description: Server error
 */
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ message: "Username and password are required" });
      return;
    }

    const user = await User.findOne({ username });
    if (!user) {
      res.status(400).json({ message: "Wrong credentials!" });
      return;
    }

    const validated = await bcrypt.compare(password, user.password);
    if (!validated) {
      res.status(400).json({ message: "Wrong credentials!" });
      return;
    }

    const token = generateToken(user._id.toString(), user.username);
    const { password: _, ...userWithoutPassword } = user.toObject();

    res.status(200).json({ ...userWithoutPassword, token });
  } catch (err) {
    res.status(500).json({ message: "Server error during login" });
  }
});

export default router;
