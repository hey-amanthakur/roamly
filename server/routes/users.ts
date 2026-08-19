import { Router, Response } from "express";
import User from "../models/User";
import Post from "../models/Post";
import bcrypt from "bcrypt";
import { verifyToken } from "../middleware/auth";
import {
  BCRYPT_SALT_ROUNDS,
  PASSWORD_MIN_LENGTH,
  ALLOWED_USER_FIELDS,
} from "../constants";
import { AuthRequest } from "../types";
import { sanitizeText } from "../utils/sanitize";

const router = Router();

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
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
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               bio:
 *                 type: string
 *               profilePic:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       401:
 *         description: Not authorized
 *       404:
 *         description: User not found
 */
router.put("/:id", verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  if (req.user!.id !== req.params.id) {
    res.status(401).json({ message: "You can update only your account!" });
    return;
  }

  try {
    const updates: Record<string, any> = {};
    for (const field of ALLOWED_USER_FIELDS) {
      if (req.body[field] !== undefined) {
        updates[field] = typeof req.body[field] === "string"
          ? sanitizeText(req.body[field])
          : req.body[field];
      }
    }

    if (req.body.password) {
      if (req.body.password.length < PASSWORD_MIN_LENGTH) {
        res.status(400).json({ message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters` });
        return;
      }
      updates.password = await bcrypt.hash(req.body.password, BCRYPT_SALT_ROUNDS);
    }

    if (updates.username) {
      await Post.updateMany({ userId: req.params.id }, { $set: { username: updates.username } });
      await Post.updateMany(
        { "comments.userId": req.params.id },
        { $set: { "comments.$[elem].username": updates.username } },
        { arrayFilters: [{ "elem.userId": req.params.id }] }
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      res.status(404).json({ message: "User not found!" });
      return;
    }

    res.status(200).json(updatedUser);
  } catch (err: any) {
    if (err.code === 11000) {
      res.status(400).json({ message: "Username or email already taken" });
      return;
    }
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user account
 *     tags: [Users]
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
 *         description: User deleted successfully
 *       401:
 *         description: Not authorized
 *       404:
 *         description: User not found
 */
router.delete("/:id", verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  if (req.user!.id !== req.params.id) {
    res.status(401).json({ message: "You can delete only your account!" });
    return;
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ message: "User not found!" });
      return;
    }

    await Post.deleteMany({ userId: user._id });
    await User.updateMany({ followers: user._id }, { $pull: { followers: user._id } });
    await User.updateMany({ followings: user._id }, { $pull: { followings: user._id } });
    await User.updateMany({ bookmarks: { $in: user._id } }, { $pull: { bookmarks: user._id } });
    await Post.updateMany({ likes: user._id }, { $pull: { likes: user._id } });
    await Post.updateMany({ bookmarks: user._id }, { $pull: { bookmarks: user._id } });
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "User has been deleted..." });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User found
 *       404:
 *         description: User not found
 */
router.get("/:id", async (req, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @swagger
 * /api/users/{id}/follow:
 *   put:
 *     summary: Follow a user
 *     tags: [Users]
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
 *         description: User followed
 *       400:
 *         description: Already following or cannot follow yourself
 *       404:
 *         description: User not found
 */
router.put("/:id/follow", verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  if (req.user!.id === req.params.id) {
    res.status(400).json({ message: "You cannot follow yourself" });
    return;
  }

  try {
    const user = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user!.id);

    if (!user || !currentUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (currentUser.followings.includes(user._id)) {
      res.status(400).json({ message: "Already following this user" });
      return;
    }

    await user.updateOne({ $push: { followers: req.user!.id } });
    await currentUser.updateOne({ $push: { followings: req.params.id } });

    res.status(200).json({ message: "User has been followed" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @swagger
 * /api/users/{id}/unfollow:
 *   put:
 *     summary: Unfollow a user
 *     tags: [Users]
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
 *         description: User unfollowed
 *       400:
 *         description: Not following or cannot unfollow yourself
 *       404:
 *         description: User not found
 */
router.put("/:id/unfollow", verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  if (req.user!.id === req.params.id) {
    res.status(400).json({ message: "You cannot unfollow yourself" });
    return;
  }

  try {
    const user = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user!.id);

    if (!user || !currentUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (!currentUser.followings.includes(user._id)) {
      res.status(400).json({ message: "Not following this user" });
      return;
    }

    await user.updateOne({ $pull: { followers: req.user!.id } });
    await currentUser.updateOne({ $pull: { followings: req.params.id } });

    res.status(200).json({ message: "User has been unfollowed" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @swagger
 * /api/users/username/{username}:
 *   get:
 *     summary: Get user by username
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User found
 *       404:
 *         description: User not found
 */
router.get("/username/:username", async (req, res: Response): Promise<void> => {
  try {
    const user = await User.findOne({ username: req.params.username }).select("-password");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
