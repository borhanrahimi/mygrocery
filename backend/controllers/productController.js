const Product = require("../models/Product");

// Get all products with optional filter/sort
exports.getAllProducts = async (req, res) => {
  try {
    const { category, sortBy, order = "asc" } = req.query;
    const filter = category ? { category } : {};

    const sortOptions = {};
    if (sortBy === "price") sortOptions.price = order === "desc" ? -1 : 1;
    else if (sortBy === "availability") sortOptions.stockQuantity = order === "desc" ? -1 : 1;
    else if (sortBy === "name") sortOptions.name = order === "desc" ? -1 : 1;

    const products = await Product.find(filter).sort(sortOptions);
    res.json(products);
  } catch (err) {
    console.error("❌ Error getting products:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

// Search products by name (case-insensitive)
exports.searchProducts = async (req, res) => {
  try {
    const q = req.query.q || "";
    const products = await Product.find({
      name: { $regex: q, $options: "i" }
    });
    res.json(products);
  } catch (err) {
    console.error("❌ Search error:", err);
    res.status(500).json({ error: "Search failed" });
  }
};

// Create new product (admin)
exports.createProduct = async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const saved = await newProduct.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("❌ Create error:", err);
    res.status(400).json({ error: "Could not save product" });
  }
};
