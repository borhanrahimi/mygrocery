const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true
  },
  image: {
    type: String
  },
  stockQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  available: {
    type: Boolean,
    default: true,
    required: true
  }
});

module.exports = mongoose.model('Product', productSchema);
