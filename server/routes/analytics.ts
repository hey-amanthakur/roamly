import { Router, Response } from "express";
import mongoose from "mongoose";
import Post from "../models/Post";
import { verifyToken } from "../middleware/auth";
import { PAGE_LIMITS } from "../constants";
import { AuthRequest, PostAnalytics, DashboardPost, DashboardStats } from "../types";

const router = Router();

/**
 * @swagger
 * /api/analytics/posts/{id}:
 *   get:
 *     summary: Get analytics for a specific post (author only)
 *     tags: [Analytics]
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
 *         description: Post analytics
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Post not found
 */
router.get("/posts/:id", verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    if (post.userId.toString() !== req.user!.id) {
      res.status(401).json({
        message: "You can only view analytics for your own posts",
      });
      return;
    }

    const analytics: PostAnalytics = {
      postId: post._id.toString(),
      title: post.title,
      views: post.views,
      likes: post.likes.length,
      bookmarks: post.bookmarks.length,
      comments: post.comments.length,
      createdAt: post.createdAt,
    };

    res.status(200).json(analytics);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @swagger
 * /api/analytics/dashboard:
 *   get:
 *     summary: Get author dashboard with stats
 *     tags: [Analytics]
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
 *         description: Dashboard data with stats
 */
router.get("/dashboard", verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(
    PAGE_LIMITS.MAX,
    Math.max(1, parseInt(req.query.limit as string) || PAGE_LIMITS.DASHBOARD)
  );
  const skip = (page - 1) * limit;

  try {
    const [posts, total] = await Promise.all([
      Post.find({ userId: req.user!.id })
        .select("title views likes bookmarks comments createdAt status")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Post.countDocuments({ userId: req.user!.id }),
    ]);

    const analytics: DashboardPost[] = posts.map((p) => ({
      postId: p._id.toString(),
      title: p.title,
      status: p.status,
      views: p.views,
      likes: p.likes.length,
      bookmarks: p.bookmarks.length,
      comments: p.comments.length,
      createdAt: p.createdAt,
    }));

    const totalStats = await Post.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user!.id) } },
      {
        $group: {
          _id: null,
          totalViews: { $sum: "$views" },
          totalLikes: { $sum: { $size: "$likes" } },
          totalComments: { $sum: { $size: "$comments" } },
          totalPosts: { $sum: 1 },
        },
      },
    ]);

    const stats: DashboardStats = totalStats[0] || {
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0,
      totalPosts: 0,
    };

    res.status(200).json({
      posts: analytics,
      total,
      page,
      pages: Math.ceil(total / limit),
      stats,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
