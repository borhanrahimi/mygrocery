const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: Number,
  category: String,
  image: String,
  stockQuantity: Number
});

module.exports = mongoose.model('Product', productSchema);
