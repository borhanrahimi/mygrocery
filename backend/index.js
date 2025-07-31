const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Load .env variables

// ✅ Import middleware
const logger = require('./middleware/loggerMiddleware');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ✅ CORS setup — allow localhost, Vercel preview & prod domains
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Allow Postman & direct calls

    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5000',
      'https://mygrocery.vercel.app',
      'https://mygrocery-git-main-borhans-projects-5831680d.vercel.app',
      'https://mygrocery-r02p88t75-borhans-projects-5831680d.vercel.app'
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

// ✅ Middleware
app.use(express.json());
app.use(logger); // Logs every request

// ✅ Load routes
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const discountRoutes = require('./routes/discountRoutes');

// ✅ Use routes
app.use('/api/users', userRoutes);          // login, register, profile update
app.use('/api/products', productRoutes);    // product listing & search
app.use('/api/cart', cartRoutes);           // cart operations
app.use('/api/orders', orderRoutes);        // order creation and history
app.use('/api/payments', paymentRoutes);    // Stripe integration
app.use('/api/discount', discountRoutes);   // student discount & others

// ✅ Root endpoint
app.get('/', (req, res) => {
  res.send('🛒 MyGrocery API is live!');
});

// ✅ Error handler (must come after routes)
app.use(errorHandler);

// ✅ MongoDB connection
console.log("Connecting to:", process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
