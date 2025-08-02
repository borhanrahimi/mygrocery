const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require("../models/Order");
const Cart = require("../models/ShoppingCart");

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
        currency: "usd", // ✅ lowercase
        product_data: {
          name: item.productId.name,
        },
        unit_amount: Math.round(item.productId.price * 100), // in cents
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/checkout-success`,
      cancel_url: `${process.env.CLIENT_URL}/cart`,
      metadata: {
        userId,
        deliveryOption,
        discountCode: discountCode || "",
        subtotal,
        discountAmount,
        taxAmount,
        deliveryFee,
        totalAmount,
      },
    });

    console.log("✅ Stripe Session Created:", session.id);
    res.status(200).json({ url: session.url });

  } catch (err) {
    console.error("❌ Stripe Checkout Error:", err.message);
    console.error("💥 Full Stripe Error:", err);
    res.status(500).json({ error: err.message || "Failed to create Stripe session" });
  }
};
