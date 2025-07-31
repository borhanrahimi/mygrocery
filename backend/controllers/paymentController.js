const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Order = require("../models/Order");
const Cart = require("../models/ShoppingCart");
const User = require("../models/User");
const PaymentMethod = require("../models/PaymentMethod");

// ✅ 1. Charge saved Stripe card
exports.chargeSavedPaymentMethod = async (req, res) => {
  const { userId, deliveryOption, discountCode } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user?.stripeCustomerId || !user.defaultPaymentMethodId) {
      return res.status(400).json({ error: "Missing Stripe info" });
    }

    const cart = await Cart.findOne({ userId }).populate("items.productId");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const validItems = cart.items.filter((item) => item.productId);
    const subtotal = validItems.reduce((sum, item) =>
      sum + item.productId.price * item.quantity, 0);

    const discountAmount = discountCode?.toUpperCase() === "STUDENT"
      ? parseFloat((subtotal * 0.1).toFixed(2)) : 0;

    const taxAmount = parseFloat(((subtotal - discountAmount) * 0.0825).toFixed(2));

    let deliveryFee = 5;
    if (deliveryOption === "express") deliveryFee = 15;
    else if (deliveryOption === "carryout") deliveryFee = 2.99;
    else if (deliveryOption === "pickup") deliveryFee = 0;

    const totalAmount = parseFloat(
      (subtotal - discountAmount + taxAmount + deliveryFee).toFixed(2)
    );

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency: "usd",
      customer: user.stripeCustomerId,
      payment_method: user.defaultPaymentMethodId,
      off_session: true,
      confirm: true
    });

    const order = new Order({
      userId,
      items: validItems.map((i) => ({
        productId: i.productId._id,
        quantity: i.quantity,
      })),
      subtotal,
      discountCode,
      discountAmount,
      taxAmount,
      totalAmount,
      deliveryOption,
      deliveryFee,
      status: "Paid"
    });

    await order.save();
    await Cart.deleteOne({ userId });

    res.status(201).json({
      orderId: order._id,
      message: "✅ Payment successful",
      paymentIntentId: paymentIntent.id
    });

  } catch (err) {
    console.error("❌ Stripe charge error:", err.message);
    res.status(500).json({ error: "Payment failed" });
  }
};

// ✅ 2. Save a card to Stripe + DB
exports.attachPaymentMethod = async (req, res) => {
  const { userId, paymentMethodId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user?.stripeCustomerId) {
      return res.status(404).json({ error: "User or Stripe ID missing" });
    }

    const method = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: user.stripeCustomerId
    });

    await stripe.customers.update(user.stripeCustomerId, {
      invoice_settings: { default_payment_method: paymentMethodId }
    });

    const saved = new PaymentMethod({
      userId: user._id,
      paymentMethodId,
      brand: method.card.brand,
      last4: method.card.last4,
      expMonth: method.card.exp_month,
      expYear: method.card.exp_year,
      isDefault: true
    });

    await saved.save();
    user.defaultPaymentMethodId = paymentMethodId;
    await user.save();

    res.json({
      message: "✅ Card saved",
      card: {
        brand: saved.brand,
        last4: saved.last4,
        expMonth: saved.expMonth,
        expYear: saved.expYear
      }
    });

  } catch (err) {
    console.error("❌ Save card error:", err.message);
    res.status(500).json({ error: "Failed to save card" });
  }
};

// ✅ 3. (Optional) Get all saved cards for user
exports.getSavedCards = async (req, res) => {
  const userId = req.params.userId;

  try {
    const cards = await PaymentMethod.find({ userId }).sort({ isDefault: -1 });
    res.json(cards);
  } catch (err) {
    console.error("❌ Get cards error:", err.message);
    res.status(500).json({ error: "Failed to get saved cards" });
  }
};
