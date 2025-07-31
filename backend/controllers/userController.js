const User = require("../models/User");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

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

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      updates,
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: "✅ Profile updated successfully",
      user
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
