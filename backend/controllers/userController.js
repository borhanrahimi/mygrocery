const User = require("../models/User");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const bcrypt = require("bcryptjs");

// ✅ Register a new user
exports.registerUser = async (req, res) => {
  try {
    const { firstName, lastName, phone, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    const newUser = new User({
      firstName,
      lastName,
      phone,
      email,
      password,
      address: {
        street: "",
        city: "",
        state: "",
        zip: "",
      },
    });

    await newUser.save();

    res.status(201).json({ message: "✅ User registered successfully" });
  } catch (err) {
    console.error("❌ Registration error:", err.message);
    res.status(500).json({ error: "Failed to register user" });
  }
};

// ✅ Log in
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid email or password" });

    res.json({
      message: "✅ Login successful",
      userId: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
    });
  } catch (err) {
    console.error("❌ Login error:", err.message);
    res.status(500).json({ error: "Login failed" });
  }
};

// ✅ Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      address: user.address,
      stripeCustomerId: user.stripeCustomerId,
      defaultPaymentMethodId: user.defaultPaymentMethodId,
    });
  } catch (err) {
    console.error("❌ Error fetching user:", err.message);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
};

// ✅ Update profile and password
exports.updateUserProfile = async (req, res) => {
  try {
    const updates = req.body;

    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // ✅ Password change
    if (updates.currentPassword && updates.newPassword) {
      const isMatch = await bcrypt.compare(updates.currentPassword, user.password);
      if (!isMatch) return res.status(401).json({ error: "❌ Current password is incorrect." });

      user.password = updates.newPassword; // ✅ Let the pre('save') middleware hash this
    }

    // ✅ Other fields
    if (updates.firstName !== undefined) user.firstName = updates.firstName;
    if (updates.lastName !== undefined) user.lastName = updates.lastName;
    if (updates.email !== undefined) user.email = updates.email;
    if (updates.phone !== undefined) user.phone = updates.phone;

    if (updates.address) {
      user.address = {
        street: updates.address.street || user.address.street,
        city: updates.address.city || user.address.city,
        state: updates.address.state || user.address.state,
        zip: updates.address.zip || user.address.zip,
      };
    }

    await user.save(); // ✅ Triggers pre('save') which hashes password if it changed

    const sanitizedUser = { ...user._doc };
    delete sanitizedUser.password;

    res.json({
      message: "✅ Profile updated successfully",
      user: sanitizedUser,
    });
  } catch (err) {
    console.error("❌ Error updating user:", err.message);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

// ✅ Create Stripe customer
exports.createStripeCustomer = async (req, res) => {
  const { userId, email, firstName, lastName } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.stripeCustomerId) {
      return res.json({
        message: "Stripe customer already exists",
        stripeCustomerId: user.stripeCustomerId,
      });
    }

    const customer = await stripe.customers.create({
      email,
      name: `${firstName} ${lastName}`,
      metadata: { mongoUserId: userId },
    });

    user.stripeCustomerId = customer.id;
    await user.save();

    res.json({
      message: "✅ Stripe customer created",
      stripeCustomerId: customer.id,
    });
  } catch (err) {
    console.error("❌ Stripe customer creation error:", err.message);
    res.status(500).json({ error: "Failed to create Stripe customer" });
  }
};
