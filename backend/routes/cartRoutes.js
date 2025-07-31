const express = require("express");
const router = express.Router();
const ShoppingCart = require("../models/ShoppingCart");
const cartController = require("../controllers/cartController");

// ✅ Add item to cart
router.post("/add", async (req, res) => {
  const { userId, productId } = req.body;

  try {
    let cart = await ShoppingCart.findOne({ userId });

    if (!cart) {
      cart = new ShoppingCart({
        userId,
        cartId: Date.now().toString(),
        items: [],
      });
    }

    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.items.push({ productId, quantity: 1 });
    }

    await cart.save();
    await cart.populate("items.productId");

    res.json({ items: cart.items });
  } catch (err) {
    console.error("❌ Add to cart error:", err.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ✅ Remove ONE unit or entire item from cart
router.post("/remove", async (req, res) => {
  const { userId, productId } = req.body;

  try {
    const cart = await ShoppingCart.findOne({ userId });

    if (!cart) return res.status(404).json({ error: "Cart not found" });

    const index = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (index !== -1) {
      if (cart.items[index].quantity > 1) {
        cart.items[index].quantity -= 1; // 👈 decrease quantity
      } else {
        cart.items.splice(index, 1); // 👈 remove item
      }

      await cart.save();
      await cart.populate("items.productId");
    }

    res.json({ items: cart.items });
  } catch (err) {
    console.error("❌ Remove item error:", err.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ✅ Get all items in user's cart
router.get("/:userId", async (req, res) => {
  try {
    const cart = await ShoppingCart.findOne({ userId: req.params.userId }).populate(
      "items.productId"
    );

    if (!cart) return res.status(200).json({ items: [] });

    res.json({ items: cart.items });
  } catch (err) {
    console.error("❌ Fetch cart error:", err.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ✅ Clear entire cart
router.post("/clear", async (req, res) => {
  const { userId } = req.body;

  try {
    const cart = await ShoppingCart.findOne({ userId });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.json({ items: [] });
  } catch (err) {
    console.error("❌ Clear cart error:", err.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ✅ Get cart summary (subtotal, tax, delivery, discount, total)
router.get("/summary/:userId", cartController.getCartSummary);

module.exports = router;
