const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Auth
router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);

// Profile
router.get("/:userId", userController.getUserProfile);
router.put("/:userId", userController.updateUserProfile);

// Stripe
router.post("/create-stripe-customer", userController.createStripeCustomer);

module.exports = router;
