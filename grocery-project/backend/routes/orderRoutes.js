const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

// Create order
router.post("/create", orderController.createOrder);

// Get order history by user
router.get("/:userId", orderController.getOrdersByUser);

module.exports = router;
