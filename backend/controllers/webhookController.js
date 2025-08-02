const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Order = require("../models/Order");
const Cart = require("../models/ShoppingCart");

exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET // We'll get this from Stripe
    );
  } catch (err) {
    console.error("❌ Webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const metadata = session.metadata;

    try {
      const cart = await Cart.findOne({ userId: metadata.userId }).populate("items.productId");

      if (!cart) {
        console.warn("⚠️ No cart found for user:", metadata.userId);
        return res.status(200).send(); // still respond OK to avoid retries
      }

      const validItems = cart.items.filter(item => item.productId);

      const order = new Order({
        userId: metadata.userId,
        items: validItems.map((item) => ({
          productId: item.productId._id,
          quantity: item.quantity,
        })),
        subtotal: parseFloat(metadata.subtotal),
        discountCode: metadata.discountCode || "",
        discountAmount: parseFloat(metadata.discountAmount),
        taxAmount: parseFloat(metadata.taxAmount),
        deliveryFee: parseFloat(metadata.deliveryFee),
        totalAmount: parseFloat(metadata.totalAmount),
        deliveryOption: metadata.deliveryOption,
        status: "Paid"
      });

      await order.save();
      await Cart.deleteOne({ userId: metadata.userId });

      console.log("✅ Order created and cart cleared for", metadata.userId);
    } catch (err) {
      console.error("❌ Error saving order in webhook:", err.message);
    }
  }

  res.status(200).send(); // Always return 200 to Stripe
};
