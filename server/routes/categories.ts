import { Router, Request, Response } from "express";
import Category from "../models/Category";

const router = Router();

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Category created
 *       400:
 *         description: Category already exists or name missing
 */
router.post("/", async (req: Request, res: Response): Promise<void> => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    res.status(400).json({ message: "Category name is required" });
    return;
  }

  try {
    const newCat = new Category({ name: name.trim() });
    const savedCat = await newCat.save();
    res.status(201).json(savedCat);
  } catch (err: any) {
    if (err.code === 11000) {
      res.status(400).json({ message: "Category already exists" });
      return;
    }
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const cats = await Category.find().sort({ name: 1 });
    res.status(200).json(cats);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
