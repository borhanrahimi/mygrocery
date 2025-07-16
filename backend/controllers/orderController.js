const Cart = require("../models/ShoppingCart");
const Order = require("../models/Order");

exports.createOrder = async (req, res) => {
  const { userId } = req.body;
  console.log("✅ Checkout request for:", userId);

  try {
    const cart = await Cart.findOne({ userId }).populate("items.productId");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const validItems = cart.items.filter(item => item.productId);

    if (validItems.length === 0) {
      return res.status(400).json({ error: "No valid items in cart" });
    }

    const totalAmount = validItems.reduce((sum, item) => {
      return sum + item.productId.price * item.quantity;
    }, 0);

    const order = new Order({
      userId,
      items: validItems.map(item => ({
        productId: item.productId._id,
        quantity: item.quantity
      })),
      totalAmount,
      status: "Processing",
      timestamp: new Date()
    });

    await order.save();
    await Cart.deleteOne({ userId });

    console.log("✅ Order created:", order._id);
    res.json({ orderId: order._id });

  } catch (err) {
    console.error("❌ Order error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getOrdersByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const orders = await Order.find({ userId })
      .populate("items.productId") // ✅ This will include full product data
      .sort({ timestamp: -1 });    // Optional: latest orders first

    res.json(orders);
  } catch (err) {
    console.error("❌ Error fetching orders:", err);
    res.status(500).json({ error: "Could not retrieve orders" });
  }
};
