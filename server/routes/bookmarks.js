const router = require("express").Router();
const User = require("../models/User");
const Post = require("../models/Post");
const { verifyToken } = require("../middleware/auth");
const { PAGE_LIMITS } = require("../constants");

// TOGGLE BOOKMARK
router.put("/posts/:id", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const user = await User.findById(req.user.id);
    const alreadyBookmarked = user.bookmarks.some(
      (id) => id.toString() === req.params.id
    );

    if (alreadyBookmarked) {
      await user.updateOne({ $pull: { bookmarks: req.params.id } });
      await post.updateOne({ $pull: { bookmarks: req.user.id } });
      res.status(200).json({ message: "Bookmark removed", bookmarked: false });
    } else {
      await user.updateOne({ $push: { bookmarks: req.params.id } });
      await post.updateOne({ $push: { bookmarks: req.user.id } });
      res.status(200).json({ message: "Post bookmarked", bookmarked: true });
    }
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET USER BOOKMARKS
router.get("/", verifyToken, async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(PAGE_LIMITS.MAX, Math.max(1, parseInt(req.query.limit) || PAGE_LIMITS.BOOKMARKS));
  const skip = (page - 1) * limit;

  try {
    const user = await User.findById(req.user.id);
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

module.exports = router;
