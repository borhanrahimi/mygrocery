const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.get("/:userId", userController.getUserProfile);
router.put("/:userId", userController.updateUserProfile);
router.post("/create-stripe-customer", userController.createStripeCustomer);

module.exports = router;
