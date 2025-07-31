const mongoose = require("mongoose");

const discountSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  type: { type: String, enum: ["percent", "fixed"], default: "percent" },
  amount: { type: Number, required: true }, // percent (e.g. 10) or fixed (e.g. 5)
  expiresAt: { type: Date, required: false } // optional expiry
});

module.exports = mongoose.model("Discount", discountSchema);
