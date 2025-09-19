const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

// Manual checkout (not Stripe)
router.post("/create", orderController.createOrder);

// View all orders for a user
router.get("/:userId", orderController.getOrdersByUser);

// Stripe Checkout session
router.post("/create-checkout-session", orderController.createCheckoutSession);

// ✅ Stripe Webhook for finalizing orders
router.post(
  "/webhook",
  express.raw({ type: "application/json" }), // Required for Stripe
  orderController.handleStripeWebhook
);

module.exports = router;
