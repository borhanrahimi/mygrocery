const Cart = require("../models/ShoppingCart");

// ✅ GET /api/cart/:userId — Return full cart
exports.getCart = async (req, res) => {
  try {
    const userId = req.params.userId;
    const cart = await Cart.findOne({ userId }).populate("items.productId");

    if (!cart) {
      return res.json({ items: [] });
    }

    res.json({ items: cart.items });
  } catch (err) {
    console.error("❌ Failed to fetch cart:", err.message);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
};

// ✅ POST /api/cart/remove — Remove a product from cart
exports.removeFromCart = async (req, res) => {
  const { userId, productId } = req.body;

  try {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    // Find index of the item
    const index = cart.items.findIndex(item => item.productId.toString() === productId);

    if (index !== -1) {
      if (cart.items[index].quantity > 1) {
        cart.items[index].quantity -= 1;
      } else {
        cart.items.splice(index, 1);
      }
    }

    await cart.save();
    await cart.populate("items.productId");
    res.json({ items: cart.items });
  } catch (err) {
    console.error("❌ Failed to remove from cart:", err.message);
    res.status(500).json({ error: "Failed to remove item" });
  }
};

// ✅ GET /api/cart/summary/:userId — Return full cart summary
exports.getCartSummary = async (req, res) => {
  const userId = req.params.userId;
  const deliveryOption = req.query.delivery || "standard";
  const discountCode = req.query.discount || null;

  try {
    const cart = await Cart.findOne({ userId }).populate("items.productId");

    if (!cart || cart.items.length === 0) {
      return res.status(200).json({
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
    else deliveryFee = 5;

    let discountAmount = 0;
    if (discountCode?.toUpperCase() === "STUDENT") {
      discountAmount = parseFloat((subtotal * 0.1).toFixed(2));
    }

    const total = parseFloat((subtotal - discountAmount + tax + deliveryFee).toFixed(2));

    // Debug logs
    console.log("✅ Summary for user:", userId);
    console.log("Cart items:", cart.items.length);
    console.log("Valid items:", validItems.length);
    console.log("Subtotal:", subtotal);
    console.log("Tax:", tax);
    console.log("Delivery Fee:", deliveryFee);
    console.log("Discount:", discountAmount);
    console.log("Total:", total);

    res.json({
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

// ✅ GET /api/cart/debug/:userId — Optional: debug cart contents
exports.debugCart = async (req, res) => {
  const { userId } = req.params;

  try {
    const cart = await Cart.findOne({ userId }).populate("items.productId");

    if (!cart) return res.status(404).json({ error: "Cart not found" });

    const details = cart.items.map((i) => ({
      name: i.productId?.name,
      price: i.productId?.price,
      quantity: i.quantity
    }));

    res.json(details);
  } catch (err) {
    res.status(500).json({ error: "Failed to debug cart" });
  }
};
