const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const Cart = require('../models/ShoppingCart');

exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('❌ Webhook Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    const {
      userId,
      deliveryOption,
      discountCode,
      subtotal,
      discountAmount,
      taxAmount,
      deliveryFee,
      totalAmount,
    } = session.metadata;

    try {
      const cart = await Cart.findOne({ userId }).populate('items.productId');
      if (!cart || cart.items.length === 0) {
        console.log('⚠️ Cart already empty or missing');
        return res.status(200).end(); // prevent webhook retry
      }

      const validItems = cart.items.filter(item => item.productId);

      const order = new Order({
        userId,
        items: validItems.map(item => ({
          productId: item.productId._id,
          quantity: item.quantity,
        })),
        subtotal,
        discountCode,
        discountAmount,
        taxAmount,
        deliveryOption,
        deliveryFee,
        totalAmount,
        status: 'Paid',
      });

      await order.save();
      await Cart.deleteOne({ userId });

      console.log('✅ Order created after Stripe payment');
    } catch (err) {
      console.error('❌ Failed to save order after payment:', err.message);
    }
  }

  res.status(200).end();
};
