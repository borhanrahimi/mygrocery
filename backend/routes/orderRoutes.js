const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

// Create order (used for internal DB orders)
router.post("/create", orderController.createOrder);

// Get order history by user
router.get("/:userId", orderController.getOrdersByUser);

// ✅ Create Stripe Checkout session
router.post("/create-checkout-session", orderController.createCheckoutSession);

module.exports = router;
