const Cart = require("../models/ShoppingCart");
const Order = require("../models/Order");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.createOrder = async (req, res) => {
  const { userId, deliveryOption, discountCode } = req.body;
  console.log("📦 Checkout request for:", userId, "| Delivery:", deliveryOption, "| Discount:", discountCode);

  try {
    const cart = await Cart.findOne({ userId }).populate("items.productId");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const validItems = cart.items.filter(item => item.productId);
    if (validItems.length === 0) {
      return res.status(400).json({ error: "No valid items in cart" });
    }

    // ✅ Step 1: Calculate subtotal
    const subtotal = validItems.reduce((sum, item) => {
      return sum + item.productId.price * item.quantity;
    }, 0);

    // ✅ Step 2: Apply discount
    let discountAmount = 0;
    if (discountCode && discountCode.toUpperCase() === "STUDENT") {
      discountAmount = subtotal * 0.10;
    }

    // ✅ Step 3: Calculate tax on discounted subtotal
    const discountedSubtotal = subtotal - discountAmount;
    const taxAmount = discountedSubtotal * 0.0825;

    // ✅ Step 4: Set delivery fee
    let deliveryFee = 0;
    switch (deliveryOption) {
      case "standard": deliveryFee = 5.00; break;
      case "express": deliveryFee = 15.00; break;
      case "pickup":
      case "carryout": deliveryFee = 0; break;
      default: return res.status(400).json({ error: "Invalid delivery option" });
    }

    // ✅ Step 5: Final total
    let totalAmount = discountedSubtotal + taxAmount + deliveryFee;
    if (totalAmount < 0) totalAmount = 0;

    // ✅ Round numbers
    const roundedSubtotal = Number(subtotal.toFixed(2));
    const roundedDiscountAmount = Number(discountAmount.toFixed(2));
    const roundedTaxAmount = Number(taxAmount.toFixed(2));
    const roundedDeliveryFee = Number(deliveryFee.toFixed(2));
    const roundedTotalAmount = Number(totalAmount.toFixed(2));

    // ✅ Save to DB
    const order = new Order({
      userId,
      items: validItems.map(item => ({
        productId: item.productId._id,
        quantity: item.quantity
      })),
      subtotal: roundedSubtotal,
      discountCode,
      discountAmount: roundedDiscountAmount,
      taxAmount: roundedTaxAmount,
      deliveryOption,
      deliveryFee: roundedDeliveryFee,
      totalAmount: roundedTotalAmount,
      status: "Processing",
      timestamp: new Date()
    });

    await order.save();
    await Cart.deleteOne({ userId });

    // ✅ Log order response before sending to frontend
    console.log("🧾 Sending order to frontend:", {
      orderId: order._id,
      subtotal: roundedSubtotal,
      discountCode,
      discountAmount: roundedDiscountAmount,
      taxAmount: roundedTaxAmount,
      deliveryFee: roundedDeliveryFee,
      totalAmount: roundedTotalAmount
    });

    res.json({
      orderId: order._id,
      subtotal: roundedSubtotal,
      discountCode,
      discountAmount: roundedDiscountAmount,
      taxAmount: roundedTaxAmount,
      deliveryFee: roundedDeliveryFee,
      totalAmount: roundedTotalAmount
    });

  } catch (err) {
    console.error("❌ Order creation error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getOrdersByUser = async (req, res) => {
  const { userId } = req.params;
  const { sortBy = "timestamp", order = "desc" } = req.query;

  try {
    const sortOptions = {};
    if (["timestamp", "totalAmount"].includes(sortBy)) {
      sortOptions[sortBy] = order === "asc" ? 1 : -1;
    } else {
      sortOptions["timestamp"] = -1;
    }

    const orders = await Order.find({ userId })
      .populate("items.productId")
      .sort(sortOptions);

    res.json(orders);
  } catch (err) {
    console.error("❌ Error fetching orders:", err);
    res.status(500).json({ error: "Could not retrieve orders" });
  }
};

// ✅ Stripe Checkout session endpoint
exports.createCheckoutSession = async (req, res) => {
  const { items } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: "No items provided" });
  }

  try {
    const line_items = items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      success_url: "http://localhost:3000/checkout-success",
      cancel_url: "http://localhost:3000/cart",
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("❌ Stripe session error:", err);
    res.status(500).json({ error: "Failed to create Stripe session" });
  }
};
