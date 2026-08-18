const router = require("express").Router();
const Newsletter = require("../models/Newsletter");

// SUBSCRIBE
router.post("/", async (req, res) => {
  const { email } = req.body;

  if (!email || !email.trim()) {
    return res.status(400).json({ message: "Email is required" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  try {
    const existing = await Newsletter.findOne({ email: email.toLowerCase() });
    if (existing) {
      if (existing.active) {
        return res.status(400).json({ message: "Already subscribed" });
      }
      existing.active = true;
      await existing.save();
      return res.status(200).json({ message: "Successfully resubscribed" });
    }

    const subscription = new Newsletter({ email: email.toLowerCase() });
    await subscription.save();
    res.status(201).json({ message: "Successfully subscribed to newsletter" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// UNSUBSCRIBE
router.post("/unsubscribe", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const subscription = await Newsletter.findOne({ email: email.toLowerCase() });
    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }
    subscription.active = false;
    await subscription.save();
    res.status(200).json({ message: "Successfully unsubscribed" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
