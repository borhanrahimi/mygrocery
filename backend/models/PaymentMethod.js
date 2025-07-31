const mongoose = require("mongoose");

const paymentMethodSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  paymentMethodId: { type: String, required: true },
  brand: String,
  last4: String,
  expMonth: Number,
  expYear: Number,
  isDefault: { type: Boolean, default: false },
});

module.exports = mongoose.model("PaymentMethod", paymentMethodSchema);
