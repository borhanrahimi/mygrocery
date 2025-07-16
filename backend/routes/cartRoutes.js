const express = require("express");
const router = express.Router();
const ShoppingCart = require("../models/ShoppingCart");

// ✅ ADD ITEM TO CART
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
    console.error("❌ Add to cart error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ✅ REMOVE ITEM FROM CART (decrease quantity or remove)
router.post("/remove", async (req, res) => {
  const { userId, productId } = req.body;

  try {
    const cart = await ShoppingCart.findOne({ userId });

    if (!cart) {
      console.log("❌ No cart found for user:", userId);
      return res.status(404).json({ error: "Cart not found" });
    }

    console.log("🗑️ Trying to remove productId:", productId);
    console.log("🛒 Cart before:", cart.items.map(i => ({
      pid: i.productId.toString(),
      qty: i.quantity
    })));

    const index = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    console.log("🔍 Matched index:", index);

    if (index !== -1) {
      if (cart.items[index].quantity > 1) {
        cart.items[index].quantity -= 1;
        console.log("➖ Decreased quantity of item:", productId);
      } else {
        cart.items.splice(index, 1);
        console.log("❌ Removed item:", productId);
      }

      await cart.save();
      await cart.populate("items.productId");
    } else {
      console.log("❌ Item not found in cart:", productId);
    }

    res.json({ items: cart.items });
  } catch (err) {
    console.error("❌ Remove from cart error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});


// ✅ GET CART BY USER
router.get("/:userId", async (req, res) => {
  try {
    const cart = await ShoppingCart.findOne({ userId: req.params.userId }).populate(
      "items.productId"
    );

    if (!cart) {
      return res.status(200).json({ items: [] });
    }

    res.json({ items: cart.items });
  } catch (err) {
    console.error("❌ Get cart error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ✅ OPTIONAL: CLEAR WHOLE CART (if needed)
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
    console.error("❌ Clear cart error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = router;
