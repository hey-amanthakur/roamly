const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");
const { verifyToken, optionalToken } = require("../middleware/auth");

// CREATE POST
router.post("/", verifyToken, async (req, res) => {
  const { title, desc, photos, photo, categories, tags, location, status } = req.body;

  if (!title || !desc) {
    return res.status(400).json({ message: "Title and description are required" });
  }

  const newPost = new Post({
    title,
    desc,
    photos: photos || [],
    photo: photo || "",
    username: req.user.username,
    userId: req.user.id,
    categories: categories || [],
    tags: tags || [],
    location: location || {},
    status: status || "published",
  });

  try {
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "A post with this title already exists" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE POST
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: "You can update only your post!" });
    }

    const allowedFields = ["title", "desc", "photos", "photo", "categories", "tags", "location", "status"];
    const updates = {};
    for (const field of allowedFields) {
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
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "A post with this title already exists" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE POST
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: "You can delete only your post!" });
    }

    await post.deleteOne();
    res.status(200).json({ message: "Post has been deleted..." });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET POST (with view count)
router.get("/:id", optionalToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    await Post.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    const postObj = post.toObject();
    postObj.views = (postObj.views || 0) + 1;
    postObj.isLiked = req.user
      ? post.likes.some((id) => id.toString() === req.user.id)
      : false;
    postObj.isBookmarked = req.user
      ? post.bookmarks.some((id) => id.toString() === req.user.id)
      : false;

    res.status(200).json(postObj);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET ALL POSTS (with pagination, filtering, sorting)
router.get("/", async (req, res) => {
  const { user, cat, tag, sort, status: queryStatus } = req.query;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 5));
  const skip = (page - 1) * limit;

  try {
    let filter = { status: queryStatus || "published" };

    if (user) {
      filter.username = user;
    } else if (cat) {
      filter.categories = { $in: [cat] };
    } else if (tag) {
      filter.tags = { $in: [tag] };
    }

    let sortOption = { createdAt: -1 };
    if (sort === "popular") {
      sortOption = { likes: -1, views: -1 };
    } else if (sort === "trending") {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      filter.createdAt = { $gte: threeDaysAgo };
      sortOption = { views: -1, likes: -1 };
    } else if (sort === "most_discussed") {
      sortOption = { "comments": -1 };
    }

    const [posts, total] = await Promise.all([
      Post.find(filter).sort(sortOption).skip(skip).limit(limit),
      Post.countDocuments(filter),
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

// PERSONALIZED FEED (for logged-in users)
router.get("/feed/for-you", verifyToken, async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 5));
  const skip = (page - 1) * limit;

  try {
    const currentUser = await User.findById(req.user.id);
    const followedIds = currentUser.followings || [];
    const preferredCategories = currentUser.preferences?.categories || [];

    const feedFilter = {
      status: "published",
      $or: [
        { userId: { $in: followedIds } },
        { categories: { $in: preferredCategories } },
      ],
    };

    const [posts, total] = await Promise.all([
      Post.find(feedFilter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
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

// RELATED POSTS
router.get("/:id/related", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const relatedFilter = {
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
      .limit(5);

    res.status(200).json(related);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// LIKE / UNLIKE POST
router.put("/:id/like", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const alreadyLiked = post.likes.some(
      (id) => id.toString() === req.user.id
    );

    if (alreadyLiked) {
      await post.updateOne({ $pull: { likes: req.user.id } });
      res.status(200).json({ message: "Post unliked", liked: false, likesCount: post.likes.length - 1 });
    } else {
      await post.updateOne({ $push: { likes: req.user.id } });
      res.status(200).json({ message: "Post liked", liked: true, likesCount: post.likes.length + 1 });
    }
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ADD COMMENT
router.post("/:id/comments", verifyToken, async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ message: "Comment text is required" });
  }

  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = {
      username: req.user.username,
      userId: req.user.id,
      text: text.trim(),
    };

    post.comments.push(comment);
    await post.save();

    res.status(200).json(post.comments[post.comments.length - 1]);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE COMMENT
router.delete("/:postId/comments/:commentId", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.userId.toString() !== req.user.id && comment.username !== req.user.username) {
      return res.status(401).json({ message: "You can delete only your comments" });
    }

    post.comments.pull(req.params.commentId);
    await post.save();

    res.status(200).json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET DRAFTS (author's own drafts)
router.get("/user/drafts", verifyToken, async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
  const skip = (page - 1) * limit;

  try {
    const [posts, total] = await Promise.all([
      Post.find({ userId: req.user.id, status: "draft" })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit),
      Post.countDocuments({ userId: req.user.id, status: "draft" }),
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
