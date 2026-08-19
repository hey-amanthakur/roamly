const router = require("express").Router();
const Post = require("../models/Post");
const { verifyToken } = require("../middleware/auth");
const { PAGE_LIMITS } = require("../constants");

// GET POST ANALITICS (author only)
router.get("/posts/:id", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: "You can only view analytics for your own posts" });
    }

    res.status(200).json({
      postId: post._id,
      title: post.title,
      views: post.views,
      likes: post.likes.length,
      bookmarks: post.bookmarks.length,
      comments: post.comments.length,
      createdAt: post.createdAt,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET ALL POSTS ANALITICS (author dashboard)
router.get("/dashboard", verifyToken, async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(PAGE_LIMITS.MAX, Math.max(1, parseInt(req.query.limit) || PAGE_LIMITS.DASHBOARD));
  const skip = (page - 1) * limit;

  try {
    const [posts, total] = await Promise.all([
      Post.find({ userId: req.user.id })
        .select("title views likes bookmarks comments createdAt status")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Post.countDocuments({ userId: req.user.id }),
    ]);

    const analytics = posts.map((p) => ({
      postId: p._id,
      title: p.title,
      status: p.status,
      views: p.views,
      likes: p.likes.length,
      bookmarks: p.bookmarks.length,
      comments: p.comments.length,
      createdAt: p.createdAt,
    }));

    const totalStats = await Post.aggregate([
      { $match: { userId: req.user.id } },
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

    res.status(200).json({
      posts: analytics,
      total,
      page,
      pages: Math.ceil(total / limit),
      stats: totalStats[0] || { totalViews: 0, totalLikes: 0, totalComments: 0, totalPosts: 0 },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
