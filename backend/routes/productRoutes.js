const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// GET /api/products → all products or filtered/sorted
router.get('/', productController.getAllProducts);

// GET /api/products/search?q=banana → search by name
router.get('/search', productController.searchProducts);

// POST /api/products → add new product
router.post('/', productController.createProduct);

module.exports = router;
