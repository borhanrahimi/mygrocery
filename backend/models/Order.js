const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number, required: true }
    }
  ],
  subtotal: { type: Number, required: true },
  discountCode: { type: String },
  discountAmount: { type: Number, default: 0 },
  taxAmount: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  deliveryOption: {
    type: String,
    required: true,
    enum: ['standard', 'express', 'pickup', 'carryout']
  },
  deliveryFee: { type: Number, required: true },
  status: { type: String, default: "Processing" },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", orderSchema);
