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

// ✅ Automatically update 'available' based on stockQuantity
productSchema.pre('save', function (next) {
  this.available = this.stockQuantity > 0;
  next();
});

module.exports = mongoose.model('Product', productSchema);
