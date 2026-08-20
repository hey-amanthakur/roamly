import { Router, Response } from "express";
import User from "../models/User";
import Post from "../models/Post";
import { verifyToken } from "../middleware/auth";
import { PAGE_LIMITS } from "../constants";
import { AuthRequest } from "../types";
import { lock } from "../middleware/lock";

const router = Router();

/**
 * @swagger
 * /api/bookmarks/posts/{id}:
 *   put:
 *     summary: Toggle bookmark on a post
 *     tags: [Bookmarks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Bookmark toggled
 *       404:
 *         description: Post not found
 */
router.put("/posts/:id", verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    const user = await User.findById(req.user!.id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const toggleResult = await lock.withLock(
      `bookmark:${req.user!.id}:${req.params.id}`,
      async () => {
        const addResult = await User.findOneAndUpdate(
          { _id: req.user!.id, bookmarks: { $ne: req.params.id as any } },
          { $push: { bookmarks: req.params.id } },
          { new: true }
        );

        if (addResult) {
          await post.updateOne({ $push: { bookmarks: req.user!.id } });
          return { bookmarked: true, message: "Post bookmarked" };
        } else {
          await User.findByIdAndUpdate(req.user!.id, { $pull: { bookmarks: req.params.id } });
          await post.updateOne({ $pull: { bookmarks: req.user!.id } });
          return { bookmarked: false, message: "Bookmark removed" };
        }
      },
      { ttlMs: 3000 }
    );

    res.status(200).json(toggleResult);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @swagger
 * /api/bookmarks:
 *   get:
 *     summary: Get user's bookmarked posts
 *     tags: [Bookmarks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of bookmarked posts
 */
router.get("/", verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(
    PAGE_LIMITS.MAX,
    Math.max(1, parseInt(req.query.limit as string) || PAGE_LIMITS.BOOKMARKS)
  );
  const skip = (page - 1) * limit;

  try {
    const user = await User.findById(req.user!.id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    const bookmarkIds = user.bookmarks || [];

    const [posts, total] = await Promise.all([
      Post.find({ _id: { $in: bookmarkIds } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Post.countDocuments({ _id: { $in: bookmarkIds } }),
    ]);

    res.status(200).json({
      posts,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
