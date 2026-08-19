import { Router, Request, Response } from "express";
import Newsletter from "../models/Newsletter";

const router = Router();

/**
 * @swagger
 * /api/newsletter:
 *   post:
 *     summary: Subscribe to newsletter
 *     tags: [Newsletter]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       201:
 *         description: Successfully subscribed
 *       400:
 *         description: Already subscribed or invalid email
 */
router.post("/", async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  if (!email || !email.trim()) {
    res.status(400).json({ message: "Email is required" });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: "Invalid email format" });
    return;
  }

  try {
    const existing = await Newsletter.findOne({ email: email.toLowerCase() });
    if (existing) {
      if (existing.active) {
        res.status(400).json({ message: "Already subscribed" });
        return;
      }
      existing.active = true;
      await existing.save();
      res.status(200).json({ message: "Successfully resubscribed" });
      return;
    }

    const subscription = new Newsletter({ email: email.toLowerCase() });
    await subscription.save();
    res.status(201).json({ message: "Successfully subscribed to newsletter" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @swagger
 * /api/newsletter/unsubscribe:
 *   post:
 *     summary: Unsubscribe from newsletter
 *     tags: [Newsletter]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Successfully unsubscribed
 *       400:
 *         description: Email required
 *       404:
 *         description: Subscription not found
 */
router.post("/unsubscribe", async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ message: "Email is required" });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: "Invalid email format" });
    return;
  }

  try {
    const subscription = await Newsletter.findOne({ email: email.toLowerCase() });
    if (!subscription) {
      res.status(404).json({ message: "Subscription not found" });
      return;
    }
    subscription.active = false;
    await subscription.save();
    res.status(200).json({ message: "Successfully unsubscribed" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
