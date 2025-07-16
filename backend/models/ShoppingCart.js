const mongoose = require('mongoose');

const shoppingCartSchema = new mongoose.Schema({
  cartId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: { type: Number, default: 1 }
    }
  ]
});

module.exports = mongoose.model('ShoppingCart', shoppingCartSchema);
