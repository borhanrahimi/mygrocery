const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

router.post("/create", orderController.createOrder);
router.get("/:userId", orderController.getOrdersByUser);
router.post("/create-checkout-session", orderController.createCheckoutSession);

module.exports = router;
