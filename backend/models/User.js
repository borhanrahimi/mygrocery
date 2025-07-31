const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  phone: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  address: {
    street: String,
    city: String,
    state: String,
    zip: String
  },
  stripeCustomerId: String,
  defaultPaymentMethodId: String
});

module.exports = mongoose.model("User", userSchema);
