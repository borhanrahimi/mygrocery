const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");

// ✅ Routes
router.get("/:userId", cartController.getCart);
router.post("/add", cartController.addToCart); // ✅ Add this line
router.post("/remove", cartController.removeFromCart);
router.get("/summary/:userId", cartController.getCartSummary);
router.get("/debug/:userId", cartController.debugCart);

module.exports = router;
