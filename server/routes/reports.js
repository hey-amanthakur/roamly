const router = require("express").Router();
const Report = require("../models/Report");
const { verifyToken } = require("../middleware/auth");

// CREATE REPORT
router.post("/", verifyToken, async (req, res) => {
  const { targetType, targetId, reason, description } = req.body;

  if (!targetType || !targetId || !reason) {
    return res.status(400).json({ message: "Target type, target ID, and reason are required" });
  }

  if (!["post", "comment", "user"].includes(targetType)) {
    return res.status(400).json({ message: "Invalid target type" });
  }

  if (!["spam", "inappropriate", "harassment", "false-information", "copyright", "other"].includes(reason)) {
    return res.status(400).json({ message: "Invalid reason" });
  }

  try {
    const existingReport = await Report.findOne({
      reporterId: req.user.id,
      targetType,
      targetId,
    });

    if (existingReport) {
      return res.status(400).json({ message: "You have already reported this" });
    }

    const report = new Report({
      reporterId: req.user.id,
      reporterUsername: req.user.username,
      targetType,
      targetId,
      reason,
      description: description || "",
    });

    await report.save();
    res.status(201).json({ message: "Report submitted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
