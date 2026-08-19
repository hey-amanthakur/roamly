import { Router, Response } from "express";
import Post from "../models/Post";
import User from "../models/User";
import { verifyToken, optionalToken } from "../middleware/auth";
import {
  PAGE_LIMITS,
  RELATED_POSTS_LIMIT,
  TRENDING_WINDOW_MS,
  ALLOWED_POST_FIELDS,
} from "../constants";
import { AuthRequest, PaginatedResponse, IPostDocument } from "../types";
import { sanitizeText } from "../utils/sanitize";

const router = Router();

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, desc]
 *             properties:
 *               title:
 *                 type: string
 *               desc:
 *                 type: string
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *               photo:
 *                 type: string
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               location:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   city:
 *                     type: string
 *                   country:
 *                     type: string
 *                   lat:
 *                     type: number
 *                   lng:
 *                     type: number
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *     responses:
 *       201:
 *         description: Post created
 *       400:
 *         description: Validation error
 */
router.post("/", verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, desc, photos, photo, categories, tags, location, status } = req.body;

  if (!title || !desc) {
    res.status(400).json({ message: "Title and description are required" });
    return;
  }

  const newPost = new Post({
    title: sanitizeText(title),
    desc: sanitizeText(desc),
    photos: photos || [],
    photo: photo || "",
    username: req.user!.username,
    userId: req.user!.id,
    categories: categories || [],
    tags: tags || [],
    location: location || {},
    status: status || "published",
  });

  try {
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (err: any) {
    if (err.code === 11000) {
      res.status(400).json({ message: "A post with this title already exists" });
      return;
    }
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @swagger
 * /api/posts/{id}:
 *   put:
 *     summary: Update a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               desc:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Post updated
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Post not found
 */
router.put("/:id", verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    if (post.userId.toString() !== req.user!.id) {
      res.status(401).json({ message: "You can update only your post!" });
      return;
    }

    const updates: Record<string, any> = {};
    for (const field of ALLOWED_POST_FIELDS) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedPost);
  } catch (err: any) {
    if (err.code === 11000) {
      res.status(400).json({ message: "A post with this title already exists" });
      return;
    }
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @swagger
 * /api/posts/{id}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts]
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
 *         description: Post deleted
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Post not found
 */
router.delete("/:id", verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    if (post.userId.toString() !== req.user!.id) {
      res.status(401).json({ message: "You can delete only your post!" });
      return;
    }

    await post.deleteOne();
    res.status(200).json({ message: "Post has been deleted..." });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @swagger
 * /api/posts/{id}:
 *   get:
 *     summary: Get a single post with view count
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post found
 *       404:
 *         description: Post not found
 */
router.get("/:id", optionalToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );

    const postObj = updatedPost!.toObject();
    (postObj as any).isLiked = req.user
      ? postObj.likes.some((id: any) => id.toString() === req.user!.id)
      : false;
    (postObj as any).isBookmarked = req.user
      ? postObj.bookmarks.some((id: any) => id.toString() === req.user!.id)
      : false;

    res.status(200).json(postObj);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: Get all posts with pagination, filtering, and sorting
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *       - in: query
 *         name: user
 *         schema:
 *           type: string
 *         description: Filter by username
 *       - in: query
 *         name: cat
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: Filter by tag
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [popular, trending, most_discussed]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published]
 *     responses:
 *       200:
 *         description: List of posts with pagination
 */
router.get("/", optionalToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const { user, cat, tag, sort, status: queryStatus } = req.query;
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(
    PAGE_LIMITS.MAX,
    Math.max(1, parseInt(req.query.limit as string) || PAGE_LIMITS.DEFAULT)
  );
  const skip = (page - 1) * limit;

  try {
    const isDraftRequest = (queryStatus as string) === "draft";
    const status = isDraftRequest && req.user ? "draft" : "published";

    let filter: Record<string, any> = { status };
    if (isDraftRequest && req.user) {
      filter.userId = req.user.id;
    } else if (isDraftRequest && !req.user) {
      res.status(401).json({ message: "Authentication required to view drafts" });
      return;
    }

    if (user) {
      filter.username = user;
    } else if (cat) {
      filter.categories = { $in: [cat] };
    } else if (tag) {
      filter.tags = { $in: [tag] };
    }

    let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
    if (sort === "popular") {
      sortOption = { likes: -1, views: -1 };
    } else if (sort === "trending") {
      const threeDaysAgo = new Date(Date.now() - TRENDING_WINDOW_MS);
      filter.createdAt = { $gte: threeDaysAgo };
      sortOption = { views: -1, likes: -1 };
    }

    const isMostDiscussed = sort === "most_discussed";

    const pipeline: any[] = [
      { $match: filter },
      ...(isMostDiscussed
        ? [{ $addFields: { commentCount: { $size: "$comments" } } }]
        : []),
      { $sort: isMostDiscussed ? { commentCount: -1, createdAt: -1 } : sortOption },
      { $skip: skip },
      { $limit: limit },
    ];

    const countPipeline: any[] = [{ $match: filter }, { $count: "total" }];

    const [posts, countResult] = await Promise.all([
      Post.aggregate(pipeline),
      Post.aggregate(countPipeline),
    ]);

    const total = countResult[0]?.total || 0;

    const response: PaginatedResponse<IPostDocument> = {
      posts,
      total,
      page,
      pages: Math.ceil(total / limit),
    };

    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @swagger
 * /api/posts/feed/for-you:
 *   get:
 *     summary: Get personalized feed for logged-in user
 *     tags: [Posts]
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
 *         description: Personalized feed
 */
router.get("/feed/for-you", verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(
    PAGE_LIMITS.MAX,
    Math.max(1, parseInt(req.query.limit as string) || PAGE_LIMITS.DEFAULT)
  );
  const skip = (page - 1) * limit;

  try {
    const currentUser = await User.findById(req.user!.id);
    const followedIds = currentUser?.followings || [];
    const preferredCategories = currentUser?.preferences?.categories || [];

    const feedFilter: Record<string, any> = {
      status: "published",
      $or: [
        { userId: { $in: followedIds } },
        { categories: { $in: preferredCategories } },
      ],
    };

    const [posts, total] = await Promise.all([
      Post.find(feedFilter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Post.countDocuments(feedFilter),
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

/**
 * @swagger
 * /api/posts/{id}/related:
 *   get:
 *     summary: Get related posts
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of related posts
 *       404:
 *         description: Post not found
 */
router.get("/:id/related", async (req, res: Response): Promise<void> => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    const relatedFilter: Record<string, any> = {
      _id: { $ne: post._id },
      status: "published",
      $or: [
        { categories: { $in: post.categories } },
        { tags: { $in: post.tags } },
        { username: post.username },
      ],
    };

    const related = await Post.find(relatedFilter)
      .sort({ likes: -1, views: -1 })
      .limit(RELATED_POSTS_LIMIT);

    res.status(200).json(related);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @swagger
 * /api/posts/{id}/like:
 *   put:
 *     summary: Like or unlike a post
 *     tags: [Posts]
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
 *         description: Like toggled
 *       404:
 *         description: Post not found
 */
router.put("/:id/like", verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    const result = await Post.findOneAndUpdate(
      { _id: req.params.id, likes: { $ne: req.user!.id } },
      { $push: { likes: req.user!.id } },
      { new: true }
    );

    if (result) {
      res.status(200).json({
        message: "Post liked",
        liked: true,
        likesCount: result.likes.length,
      });
    } else {
      const pullResult = await Post.findByIdAndUpdate(
        req.params.id,
        { $pull: { likes: req.user!.id } },
        { new: true }
      );
      res.status(200).json({
        message: "Post unliked",
        liked: false,
        likesCount: pullResult!.likes.length,
      });
    }
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @swagger
 * /api/posts/{id}/comments:
 *   post:
 *     summary: Add a comment to a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [text]
 *             properties:
 *               text:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment added
 *       400:
 *         description: Comment text required
 *       404:
 *         description: Post not found
 */
router.post("/:id/comments", verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    res.status(400).json({ message: "Comment text is required" });
    return;
  }

  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    const comment = {
      username: req.user!.username,
      userId: req.user!.id as any,
      text: sanitizeText(text.trim()),
    };

    post.comments.push(comment as any);
    await post.save();

    res.status(200).json(post.comments[post.comments.length - 1]);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @swagger
 * /api/posts/{postId}/comments/{commentId}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment deleted
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Post or comment not found
 */
router.delete(
  "/:postId/comments/:commentId",
  verifyToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const post = await Post.findById(req.params.postId);
      if (!post) {
        res.status(404).json({ message: "Post not found" });
        return;
      }

      const comment = (post.comments as any).id(req.params.commentId);
      if (!comment) {
        res.status(404).json({ message: "Comment not found" });
        return;
      }

      if (comment.userId.toString() !== req.user!.id) {
        res.status(401).json({ message: "You can delete only your comments" });
        return;
      }

      (post.comments as any).pull(req.params.commentId);
      await post.save();

      res.status(200).json({ message: "Comment deleted" });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * @swagger
 * /api/posts/user/drafts:
 *   get:
 *     summary: Get user's draft posts
 *     tags: [Posts]
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
 *         description: List of draft posts
 */
router.get("/user/drafts", verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(
    PAGE_LIMITS.MAX,
    Math.max(1, parseInt(req.query.limit as string) || PAGE_LIMITS.DRAFTS)
  );
  const skip = (page - 1) * limit;

  try {
    const [posts, total] = await Promise.all([
      Post.find({ userId: req.user!.id, status: "draft" })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit),
      Post.countDocuments({ userId: req.user!.id, status: "draft" }),
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
