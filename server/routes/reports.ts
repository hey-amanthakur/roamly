import { Router, Response } from "express";
import mongoose from "mongoose";
import Report from "../models/Report";
import Post from "../models/Post";
import User from "../models/User";
import { verifyToken } from "../middleware/auth";
import { AuthRequest } from "../types";
import { idempotencyRegistry } from "../middleware/idempotency";

const router = Router();

/**
 * @swagger
 * /api/reports:
 *   post:
 *     summary: Submit a report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [targetType, targetId, reason]
 *             properties:
 *               targetType:
 *                 type: string
 *                 enum: [post, comment, user]
 *               targetId:
 *                 type: string
 *               reason:
 *                 type: string
 *                 enum: [spam, inappropriate, harassment, false-information, copyright, other]
 *               description:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       201:
 *         description: Report submitted
 *       400:
 *         description: Validation error or duplicate report
 *       401:
 *         description: Not authenticated
 */
router.post("/", verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const { targetType, targetId, reason, description } = req.body;

  if (!targetType || !targetId || !reason) {
    res.status(400).json({
      message: "Target type, target ID, and reason are required",
    });
    return;
  }

  if (!["post", "comment", "user"].includes(targetType)) {
    res.status(400).json({ message: "Invalid target type" });
    return;
  }

  if (
    !["spam", "inappropriate", "harassment", "false-information", "copyright", "other"].includes(reason)
  ) {
    res.status(400).json({ message: "Invalid reason" });
    return;
  }

  const idempotencyKey = `report:${req.user!.id}:${targetType}:${targetId}`;

  try {
    const { record, replayed } = await idempotencyRegistry.execute(
      idempotencyKey,
      async () => {
        const targetObjectId = new mongoose.Types.ObjectId(targetId);

        if (targetType === "post") {
          const exists = await Post.findById(targetObjectId);
          if (!exists) {
            throw new Error("TARGET_NOT_FOUND");
          }
        } else if (targetType === "user") {
          const exists = await User.findById(targetObjectId);
          if (!exists) {
            throw new Error("TARGET_NOT_FOUND");
          }
        }

        const existingReport = await Report.findOne({
          reporterId: req.user!.id,
          targetType,
          targetId: targetObjectId,
        });

        if (existingReport) {
          throw new Error("ALREADY_REPORTED");
        }

        const report = new Report({
          reporterId: req.user!.id,
          reporterUsername: req.user!.username,
          targetType,
          targetId: targetObjectId,
          reason,
          description: description || "",
        });

        await report.save();
        return { message: "Report submitted" };
      },
      { ttlMs: 60 * 1000 }
    );

    if (replayed && record.state === "completed") {
      res.status(201).json({ message: "Report submitted" });
      return;
    }

    if (record.state === "failed" && record.error) {
      const errorMsg =
        typeof record.error === "object" && record.error !== null && "message" in record.error
          ? String((record.error as { message: unknown }).message)
          : String(record.error);
      if (errorMsg === "TARGET_NOT_FOUND") {
        res.status(404).json({ message: "Target not found" });
        return;
      }
      if (errorMsg === "ALREADY_REPORTED") {
        res.status(400).json({ message: "You have already reported this" });
        return;
      }
      res.status(500).json({ message: "Server error" });
      return;
    }

    res.status(201).json({ message: "Report submitted" });
  } catch (err: any) {
    if (err.message === "TARGET_NOT_FOUND") {
      res.status(404).json({ message: "Target not found" });
      return;
    }
    if (err.message === "ALREADY_REPORTED") {
      res.status(400).json({ message: "You have already reported this" });
      return;
    }
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
