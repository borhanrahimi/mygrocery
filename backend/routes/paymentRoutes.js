const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

// 💳 Charge card
router.post("/charge-saved-method", paymentController.chargeSavedPaymentMethod);

// 💾 Save card
router.post("/save-card", paymentController.attachPaymentMethod);

// 📥 Get saved cards (optional UI)
router.get("/saved-cards/:userId", paymentController.getSavedCards);

// ✅ Stripe Webhook (required for successful order + cart clear)
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  paymentController.handleStripeWebhook
);

module.exports = router;
