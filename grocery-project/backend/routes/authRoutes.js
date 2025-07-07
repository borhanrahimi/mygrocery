const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs"); // Compatible with Windows

// ✅ POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid password" });

    res.json({ userId: user._id });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ✅ POST /api/auth/register
router.post("/register", async (req, res) => {
  const { firstName, lastName, phone, email, password } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      firstName,
      lastName,
      phone,
      email,
      password: hashedPassword,
    });

    res.json({ userId: newUser._id });
  } catch (err) {
    console.error("❌ Register error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

// ✅ GET /api/auth/profile/:userId
router.get("/profile/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("❌ Profile fetch error:", err);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

// ✅ PUT /api/auth/profile/:userId — update user profile
router.put("/profile/:userId", async (req, res) => {
  const { userId } = req.params;
  const { firstName, lastName, email, phone, address, password } = req.body;

  try {
    const updateFields = { firstName, lastName, email, phone, address };

    if (password && password.trim() !== "") {
      const hashed = await bcrypt.hash(password, 10);
      updateFields.password = hashed;
    }

    const updated = await User.findByIdAndUpdate(userId, updateFields, { new: true });

    if (!updated) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("❌ Profile update error:", err);
    res.status(500).json({ error: "Profile update failed" });
  }
});

module.exports = router;
