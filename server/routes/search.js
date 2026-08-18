const router = require("express").Router();
const Post = require("../models/Post");

router.get("/", async (req, res) => {
  const { q, page = 1, limit = 10 } = req.query;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  if (!q || !q.trim()) {
    return res.status(400).json({ message: "Search query is required" });
  }

  const searchRegex = new RegExp(q.trim(), "i");

  try {
    const filter = {
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
      Post.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Post.countDocuments(filter),
    ]);

    res.status(200).json({
      posts,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      query: q.trim(),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
