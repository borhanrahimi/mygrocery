const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// ✅ POST /api/auth/login — User Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ Check for missing fields
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Invalid password" });
    }

    return res.status(200).json({
      message: "Login successful",
      userId: user._id,
      email: user.email
    });

  } catch (err) {
    console.error("❌ Login error:", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

// ✅ POST /api/auth/register — User Registration
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, phone, email, password } = req.body;

    if (!firstName || !lastName || !phone || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      firstName,
      lastName,
      phone,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "Registration successful",
      userId: newUser._id,
      email: newUser.email
    });

  } catch (err) {
    console.error("❌ Register error:", err);
    return res.status(500).json({ error: "Registration failed" });
  }
});

// ✅ GET /api/auth/profile/:userId — Get User Profile
router.get("/profile/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(200).json(user);
  } catch (err) {
    console.error("❌ Profile fetch error:", err);
    return res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

// ✅ PUT /api/auth/profile/:userId — Update User Profile
router.put("/profile/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, email, phone, address, password } = req.body;

    const updateFields = { firstName, lastName, email, phone, address };

    if (password && password.trim() !== "") {
      const hashed = await bcrypt.hash(password, 10);
      updateFields.password = hashed;
    }

    const updated = await User.findByIdAndUpdate(userId, updateFields, { new: true }).select("-password");

    if (!updated) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      user: updated
    });

  } catch (err) {
    console.error("❌ Profile update error:", err);
    return res.status(500).json({ error: "Profile update failed" });
  }
});

module.exports = router;
