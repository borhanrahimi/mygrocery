const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// ✅ GET /api/user/:userId — Fetch user profile
router.get("/:userId", userController.getUserProfile);

// ✅ PUT /api/user/:userId — Update user profile
router.put("/:userId", userController.updateUserProfile);

// ✅ POST /api/user/create-stripe-customer — Create Stripe customer
router.post("/create-stripe-customer", userController.createStripeCustomer);

module.exports = router;
