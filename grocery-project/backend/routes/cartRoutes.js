const express = require('express');
const router = express.Router();
const Cart = require('../models/ShoppingCart');

// GET cart by userId
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  const cart = await Cart.findOne({ userId }).populate('items.productId');
  if (!cart) return res.json({ items: [] });
  res.json(cart);
});

// POST - Add to cart
router.post('/add', async (req, res) => {
  const { userId, productId } = req.body;
  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = new Cart({
      cartId: userId,
      userId,
      items: [{ productId, quantity: 1 }]
    });
  } else {
    const existing = cart.items.find((item) => item.productId.toString() === productId);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.items.push({ productId, quantity: 1 });
    }
  }

  await cart.save();
  res.json(cart);
});

// POST - Remove ONE item from cart
router.post('/remove', async (req, res) => {
  const { userId, productId } = req.body;
  let cart = await Cart.findOne({ userId });

  if (cart) {
    const item = cart.items.find(item => item.productId.toString() === productId);

    if (item) {
      if (item.quantity > 1) {
        item.quantity -= 1;
      } else {
        // Remove the item entirely if quantity is 1
        cart.items = cart.items.filter(item => item.productId.toString() !== productId);
      }

      await cart.save();
      cart = await Cart.findOne({ userId }).populate('items.productId');
    }
  }

  res.json(cart);
});

module.exports = router;
