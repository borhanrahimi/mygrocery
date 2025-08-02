const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const logger = require('./middleware/loggerMiddleware');
const errorHandler = require('./middleware/errorHandler');
require('dotenv').config();

const app = express();

// ✅ CORS setup — allow localhost & Vercel
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:5000',
        'https://mygrocery.vercel.app',
        'https://mygrocery-git-main-borhans-projects-5831680d.vercel.app',
        'https://mygrocery-r02p88t75-borhans-projects-5831680d.vercel.app',
      ];

      const isAllowed =
        allowedOrigins.includes(origin) ||
        /^https:\/\/mygrocery-.*\.vercel\.app$/.test(origin);

      if (isAllowed) {
        callback(null, true);
      } else {
        console.log('❌ Blocked by CORS:', origin);
        callback(new Error('CORS not allowed'));
      }
    },
    credentials: true,
  })
);

// ✅ Stripe webhook raw body route (must come BEFORE express.json)
app.use(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  require('./routes/webhookRoutes') // ⬅️ Make sure this file exists
);

// ✅ Normal JSON middleware
app.use(express.json());
app.use(logger);

// ✅ Route imports
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const discountRoutes = require('./routes/discountRoutes');

// ✅ Route mounting
app.use('/api/users', userRoutes);         // Auth, profile
app.use('/api/products', productRoutes);   // Products & search
app.use('/api/cart', cartRoutes);          // Shopping cart
app.use('/api/orders', orderRoutes);       // Order create + history + Stripe checkout
app.use('/api/payments', paymentRoutes);   // Card save + charge
app.use('/api/discount', discountRoutes);  // Discount codes

// ✅ Root route
app.get('/', (req, res) => {
  res.send('🛒 MyGrocery API is live!');
});

// ✅ Error handler
app.use(errorHandler);

// ✅ MongoDB connection
console.log('🔌 Connecting to MongoDB...');
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
