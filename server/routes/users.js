const router = require("express").Router();
const User = require("../models/User");
const Post = require("../models/Post");
const bcrypt = require("bcrypt");
const { verifyToken } = require("../middleware/auth");

// UPDATE
router.put("/:id", verifyToken, async (req, res) => {
  if (req.user.id !== req.params.id) {
    return res.status(401).json({ message: "You can update only your account!" });
  }

  try {
    const updates = {};
    if (req.body.username) updates.username = req.body.username;
    if (req.body.email) updates.email = req.body.email;
    if (req.body.bio !== undefined) updates.bio = req.body.bio;
    if (req.body.profilePic) updates.profilePic = req.body.profilePic;

    if (req.body.password) {
      if (req.body.password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found!" });
    }

    res.status(200).json(updatedUser);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Username or email already taken" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE
router.delete("/:id", verifyToken, async (req, res) => {
  if (req.user.id !== req.params.id) {
    return res.status(401).json({ message: "You can delete only your account!" });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    await Post.deleteMany({ userId: user._id });
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "User has been deleted..." });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET USER
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// FOLLOW USER
router.put("/:id/follow", verifyToken, async (req, res) => {
  if (req.user.id === req.params.id) {
    return res.status(400).json({ message: "You cannot follow yourself" });
  }

  try {
    const user = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!user || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (currentUser.followings.includes(req.params.id)) {
      return res.status(400).json({ message: "Already following this user" });
    }

    await user.updateOne({ $push: { followers: req.user.id } });
    await currentUser.updateOne({ $push: { followings: req.params.id } });

    res.status(200).json({ message: "User has been followed" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// UNFOLLOW USER
router.put("/:id/unfollow", verifyToken, async (req, res) => {
  if (req.user.id === req.params.id) {
    return res.status(400).json({ message: "You cannot unfollow yourself" });
  }

  try {
    const user = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!user || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!currentUser.followings.includes(req.params.id)) {
      return res.status(400).json({ message: "Not following this user" });
    }

    await user.updateOne({ $pull: { followers: req.user.id } });
    await currentUser.updateOne({ $pull: { followings: req.params.id } });

    res.status(200).json({ message: "User has been unfollowed" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
