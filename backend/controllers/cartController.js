const Cart = require("../models/ShoppingCart");

// ✅ GET /api/cart/summary/:userId — Return full cart summary
exports.getCartSummary = async (req, res) => {
  const userId = req.params.userId;
  const deliveryOption = req.query.delivery || "standard";
  const discountCode = req.query.discount || null;

  try {
    const cart = await Cart.findOne({ userId }).populate("items.productId");

    if (!cart || cart.items.length === 0) {
      return res.status(200).json({
        items: [],
        subtotal: 0,
        tax: 0,
        deliveryFee: 0,
        discountAmount: 0,
        total: 0
      });
    }

    const validItems = cart.items.filter((item) => item.productId);

    const subtotal = validItems.reduce((sum, item) => {
      return sum + item.productId.price * item.quantity;
    }, 0);

    const taxRate = 0.0825;
    const tax = parseFloat((subtotal * taxRate).toFixed(2));

    let deliveryFee = 0;
    if (deliveryOption === "express") deliveryFee = 15;
    else if (deliveryOption === "carryout") deliveryFee = 2.99;
    else if (deliveryOption === "pickup") deliveryFee = 0;
    else deliveryFee = 5; // default for "standard"

    let discountAmount = 0;
    if (discountCode?.toUpperCase() === "STUDENT") {
      discountAmount = parseFloat((subtotal * 0.1).toFixed(2));
    }

    const total = parseFloat((subtotal - discountAmount + tax + deliveryFee).toFixed(2));

    res.json({
      items: validItems,
      subtotal,
      tax,
      deliveryFee,
      discountAmount,
      total
    });
  } catch (err) {
    console.error("❌ Cart summary error:", err.message);
    res.status(500).json({ error: "Failed to get cart summary" });
  }
};
