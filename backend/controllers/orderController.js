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

    // ✅ Subtotal
    const subtotal = validItems.reduce((sum, item) => {
      return sum + item.productId.price * item.quantity;
    }, 0);

    // ✅ Discount
    const discountAmount =
      discountCode?.toUpperCase() === "STUDENT"
        ? parseFloat((subtotal * 0.1).toFixed(2))
        : 0;

    // ✅ Tax
    const taxRate = 0.0825;
    const taxAmount = parseFloat(((subtotal - discountAmount) * taxRate).toFixed(2));

    // ✅ Delivery fee
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

    // ✅ Total
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
    await Cart.deleteOne({ userId }); // clear cart

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

// (Optional) placeholder for Stripe checkout
exports.createCheckoutSession = (req, res) => {
  res.status(501).json({ message: "Stripe not implemented yet" });
};
