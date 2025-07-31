const User = require("../models/User");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const bcrypt = require("bcryptjs");

// ✅ GET /api/user/:userId — Fetch user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      address: user.address,
      stripeCustomerId: user.stripeCustomerId,
      defaultPaymentMethodId: user.defaultPaymentMethodId
    });
  } catch (err) {
    console.error("❌ Error fetching user:", err.message);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
};

// ✅ PUT /api/user/:userId — Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const updates = req.body;
    const updateFields = {};

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // ✅ Handle password change
    if (updates.currentPassword && updates.newPassword) {
      const isMatch = await bcrypt.compare(updates.currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: "❌ Current password is incorrect." });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(updates.newPassword, salt);
      updateFields.password = hashedPassword;
    }

    // ✅ Personal Info
    if (updates.firstName !== undefined) updateFields.firstName = updates.firstName;
    if (updates.lastName !== undefined) updateFields.lastName = updates.lastName;
    if (updates.email !== undefined) updateFields.email = updates.email;
    if (updates.phone !== undefined) updateFields.phone = updates.phone;

    // ✅ Address
    if (updates.address) {
      updateFields.address = {};
      if (updates.address.street !== undefined) updateFields.address.street = updates.address.street;
      if (updates.address.zip !== undefined) updateFields.address.zip = updates.address.zip;
      if (updates.address.city !== undefined) updateFields.address.city = updates.address.city;
      if (updates.address.state !== undefined) updateFields.address.state = updates.address.state;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      { $set: updateFields },
      { new: true }
    ).select("-password");

    res.json({
      message: "✅ Profile updated successfully",
      user: updatedUser
    });

  } catch (err) {
    console.error("❌ Error updating user:", err.message);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

// ✅ POST /api/user/create-stripe-customer — Create Stripe customer if needed
exports.createStripeCustomer = async (req, res) => {
  const { userId, email, firstName, lastName } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.stripeCustomerId) {
      return res.json({
        message: "Stripe customer already exists",
        stripeCustomerId: user.stripeCustomerId
      });
    }

    const customer = await stripe.customers.create({
      email,
      name: `${firstName} ${lastName}`,
      metadata: { mongoUserId: userId }
    });

    user.stripeCustomerId = customer.id;
    await user.save();

    res.json({
      message: "✅ Stripe customer created",
      stripeCustomerId: customer.id
    });
  } catch (err) {
    console.error("❌ Stripe customer creation error:", err.message);
    res.status(500).json({ error: "Failed to create Stripe customer" });
  }
};
