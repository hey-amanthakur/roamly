const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { BCRYPT_SALT_ROUNDS, JWT_EXPIRY, PASSWORD_MIN_LENGTH } = require("../constants");

const generateToken = (userId, username) => {
  return jwt.sign({ id: userId, username }, process.env.JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
  });
};

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });
    if (existingUser) {
      const field = existingUser.email === email ? "Email" : "Username";
      return res.status(400).json({ message: `${field} already exists` });
    }

    const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
    const hashedPass = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPass,
    });

    const savedUser = await newUser.save();
    const { password: _, ...userWithoutPassword } = savedUser._doc;

    res.status(201).json(userWithoutPassword);
  } catch (err) {
    res.status(500).json({ message: "Server error during registration" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Wrong credentials!" });
    }

    const validated = await bcrypt.compare(password, user.password);
    if (!validated) {
      return res.status(400).json({ message: "Wrong credentials!" });
    }

    const token = generateToken(user._id, user.username);
    const { password: _, ...userWithoutPassword } = user._doc;

    res.status(200).json({ ...userWithoutPassword, token });
  } catch (err) {
    res.status(500).json({ message: "Server error during login" });
  }
});

module.exports = router;
