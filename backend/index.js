const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Load .env variables

const app = express();

// ✅ CORS setup — allow localhost, Vercel preview & prod domains
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // ✅ Allow Postman & direct calls

    const allowedOrigins = [
      'http://localhost:3000', // local dev
      'https://mygrocery-frontend.vercel.app', // production frontend
      'https://mygrocery-2n9p5bg55-borhans-projects-5831680d.vercel.app' // your preview frontend
    ];

    const isAllowed =
      allowedOrigins.includes(origin) ||
      /^https:\/\/mygrocery-.*\.vercel\.app$/.test(origin); // Vercel preview URLs

    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('❌ Blocked by CORS:', origin);
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true
}));

app.use(express.json());

// ✅ Load routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');

// ✅ Use routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// ✅ MongoDB connection
console.log("Connecting to:", process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ Default route
app.get('/', (req, res) => {
  res.send('🛒 Grocery API is live!');
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
