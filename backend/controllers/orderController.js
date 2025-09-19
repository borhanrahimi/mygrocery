const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require("../models/Order");
const Cart = require("../models/ShoppingCart");

// ✅ Create Order (manual checkout)
exports.createOrder = async (req, res) => {
  const { userId, deliveryOption, discountCode } = req.body;

  try {
    const cart = await Cart.findOne({ userId }).populate("items.productId");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const validItems = cart.items.filter(item => item.productId);
    if (validItems.length === 0) {
      return res.status(400).json({ error: "No valid items in cart" });
    }

    const subtotal = validItems.reduce((sum, item) => {
      return sum + item.productId.price * item.quantity;
    }, 0);

    const discountAmount =
      discountCode?.toUpperCase() === "STUDENT"
        ? parseFloat((subtotal * 0.1).toFixed(2))
        : 0;

    const taxRate = 0.0825;
    const taxAmount = parseFloat(((subtotal - discountAmount) * taxRate).toFixed(2));

    let deliveryFee = 0;
    switch (deliveryOption) {
      case "express":
        deliveryFee = 15;
        break;
      case "carryout":
        deliveryFee = 2.99;
        break;
      case "pickup":
        deliveryFee = 0;
        break;
      default:
        deliveryFee = 5;
    }

    const totalAmount = parseFloat(
      (subtotal - discountAmount + taxAmount + deliveryFee).toFixed(2)
    );

    const order = new Order({
      userId,
      items: validItems.map((item) => ({
        productId: item.productId._id,
        quantity: item.quantity,
      })),
      subtotal,
      discountCode,
      discountAmount,
      taxAmount,
      totalAmount,
      deliveryOption,
      deliveryFee,
    });

    await order.save();
    await Cart.deleteOne({ userId });

    res.status(201).json({ orderId: order._id, message: "✅ Order placed!" });
  } catch (err) {
    console.error("❌ Error creating order:", err);
    res.status(500).json({ error: "Failed to place order" });
  }
};

// ✅ Get all orders for user
exports.getOrdersByUser = async (req, res) => {
  const userId = req.params.userId;
  try {
    const orders = await Order.find({ userId })
      .sort({ timestamp: -1 })
      .populate("items.productId");
    res.json(orders);
  } catch (err) {
    console.error("❌ Error fetching orders:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// ✅ Stripe Checkout session (with tax, discount, delivery)
exports.createCheckoutSession = async (req, res) => {
  const { userId, deliveryOption, discountCode } = req.body;
  console.log("✅ Stripe Checkout HIT:", req.body);

  try {
    const cart = await Cart.findOne({ userId }).populate("items.productId");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const validItems = cart.items.filter(item => item.productId);
    if (validItems.length === 0) {
      return res.status(400).json({ error: "No valid items in cart" });
    }

    const subtotal = validItems.reduce((sum, item) => {
      return sum + item.productId.price * item.quantity;
    }, 0);

    const discountAmount =
      discountCode?.toUpperCase() === "STUDENT"
        ? parseFloat((subtotal * 0.1).toFixed(2))
        : 0;

    const taxRate = 0.0825;
    const taxAmount = parseFloat(((subtotal - discountAmount) * taxRate).toFixed(2));

    let deliveryFee = 0;
    switch (deliveryOption) {
      case "express":
        deliveryFee = 15;
        break;
      case "carryout":
        deliveryFee = 2.99;
        break;
      case "pickup":
        deliveryFee = 0;
        break;
      default:
        deliveryFee = 5;
    }

    const totalAmount = parseFloat(
      (subtotal - discountAmount + taxAmount + deliveryFee).toFixed(2)
    );

    const line_items = validItems.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: { name: item.productId.name },
        unit_amount: Math.round(item.productId.price * 100),
      },
      quantity: item.quantity,
    }));

    if (deliveryFee > 0) {
      line_items.push({
        price_data: {
          currency: "usd",
          product_data: { name: `Delivery (${deliveryOption})` },
          unit_amount: Math.round(deliveryFee * 100),
        },
        quantity: 1,
      });
    }

    if (taxAmount > 0) {
      line_items.push({
        price_data: {
          currency: "usd",
          product_data: { name: "Sales Tax" },
          unit_amount: Math.round(taxAmount * 100),
        },
        quantity: 1,
      });
    }

    if (discountAmount > 0) {
      line_items.push({
        price_data: {
          currency: "usd",
          product_data: { name: "Student Discount" },
          unit_amount: Math.round(discountAmount * -100),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
    });

    console.log("✅ Stripe Session Created:", session.id);
    res.status(200).json({ url: session.url });

  } catch (err) {
    console.error("❌ Stripe Checkout Error:", err.message);
    console.error("💥 Full Stripe Error:", err);
    res.status(500).json({ error: err.message || "Failed to create Stripe session" });
  }
};

// ✅ Stripe Webhook (called after successful payment)
exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Stripe webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const metadata = session.metadata;

    try {
      const cart = await Cart.findOne({ userId: metadata.userId }).populate("items.productId");
      if (!cart || cart.items.length === 0) {
        console.log("❌ Webhook: Cart empty or not found");
        return res.status(400).send("Cart not found");
      }

      const validItems = cart.items.filter(item => item.productId);
      if (validItems.length === 0) {
        console.log("❌ Webhook: No valid items in cart");
        return res.status(400).send("No valid items");
      }

      const order = new Order({
        userId: metadata.userId,
        items: validItems.map(item => ({
          productId: item.productId._id,
          quantity: item.quantity
        })),
        subtotal: metadata.subtotal,
        discountCode: metadata.discountCode,
        discountAmount: metadata.discountAmount,
        taxAmount: metadata.taxAmount,
        deliveryOption: metadata.deliveryOption,
        deliveryFee: metadata.deliveryFee,
        totalAmount: metadata.totalAmount,
        status: "Paid"
      });

      await order.save();
      await Cart.deleteOne({ userId: metadata.userId });

      console.log("✅ Webhook: Order saved and cart cleared");
      res.status(200).send("Order processed");
    } catch (err) {
      console.error("❌ Webhook processing error:", err);
      res.status(500).send("Internal Error");
    }
  } else {
    res.status(200).send("Unhandled event type");
  }
};