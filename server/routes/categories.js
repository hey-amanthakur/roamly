const router = require("express").Router();
const Category = require("../models/Category");

router.post("/", async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ message: "Category name is required" });
  }

  try {
    const newCat = new Category({ name: name.trim() });
    const savedCat = await newCat.save();
    res.status(201).json(savedCat);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Category already exists" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const cats = await Category.find().sort({ name: 1 });
    res.status(200).json(cats);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
