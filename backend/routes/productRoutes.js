const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// ✅ GET all products OR filter by category
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const products = await Product.find(filter);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ POST create a product
router.post('/', async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ GET /api/products/search?q=...
router.get('/search', async (req, res) => {
  const q = req.query.q;
  try {
    const products = await Product.find({
      name: { $regex: q, $options: 'i' }
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
