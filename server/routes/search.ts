import { Router, Request, Response } from "express";
import Post from "../models/Post";
import { PAGE_LIMITS } from "../constants";
import { FilterQuery } from "mongoose";
import { PaginatedResponse, IPostDocument } from "../types";

const router = Router();

/**
 * @swagger
 * /api/search:
 *   get:
 *     summary: Search posts by query
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Search results
 *       400:
 *         description: Search query required
 */
router.get("/", async (req: Request, res: Response): Promise<void> => {
  const { q, page = "1", limit = String(PAGE_LIMITS.SEARCH) } = req.query;
  const pageNum = Math.max(1, parseInt(page as string));
  const limitNum = Math.min(
    PAGE_LIMITS.MAX,
    Math.max(1, parseInt(limit as string))
  );
  const skip = (pageNum - 1) * limitNum;

  if (!q || !(q as string).trim()) {
    res.status(400).json({ message: "Search query is required" });
    return;
  }

  const escaped = (q as string).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const searchRegex = new RegExp(escaped, "i");

  try {
    const filter: FilterQuery<IPostDocument> = {
      status: "published",
      $or: [
        { title: searchRegex },
        { desc: searchRegex },
        { tags: { $in: [searchRegex] } },
        { categories: { $in: [searchRegex] } },
        { "location.city": searchRegex },
        { "location.country": searchRegex },
        { "location.name": searchRegex },
      ],
    };

    const [posts, total] = await Promise.all([
      Post.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Post.countDocuments(filter),
    ]);

    const response: PaginatedResponse<IPostDocument> & { query: string } = {
      posts,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      query: (q as string).trim(),
    };

    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
