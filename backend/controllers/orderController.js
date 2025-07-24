const Cart = require("../models/ShoppingCart");
const Order = require("../models/Order");

exports.createOrder = async (req, res) => {
  //  GET THE NEW 'deliveryOption' FROM THE REQUEST BODY, along with userId
  const { userId, deliveryOption } = req.body;
  console.log("Checkout request for:", userId, "with delivery:", deliveryOption);

  try {
    const cart = await Cart.findOne({ userId }).populate("items.productId");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const validItems = cart.items.filter(item => item.productId);

    if (validItems.length === 0) {
      return res.status(400).json({ error: "No valid items in cart" });
    }

    // CALCULATE THE BASE TOTAL AMOUNT FROM THE CART
    let totalAmount = validItems.reduce((sum, item) => {
      // Ensure productId and price exist before multiplying
      return sum + (item.productId ? item.productId.price * item.quantity : 0);
    }, 0);

    //  DETERMINE DELIVERY FEE BASED ON THE OPTION
    let deliveryFee = 0;
    switch (deliveryOption) {
      case 'standard':
        deliveryFee = 5.00;
        break;
      case 'express':
        deliveryFee = 15.00;
        break;
      case 'pickup':
      case 'carryout':
        deliveryFee = 0;
        break;
      default:
        // This handles cases where the user sends an invalid delivery option
        return res.status(400).json({ error: "Invalid delivery option" });
    }
    
    //  ADD THE DELIVERY FEE TO THE TOTAL AMOUNT
    totalAmount += deliveryFee;

    const order = new Order({
      userId,
      items: validItems.map(item => ({
        productId: item.productId._id,
        quantity: item.quantity
      })),
      totalAmount,
      // ADD THE NEW FIELDS TO THE ORDER OBJECT
      deliveryOption,
      deliveryFee,
      status: "Processing",
      timestamp: new Date()
    });

    await order.save();
    await Cart.deleteOne({ userId });

    console.log("✅ Order created:", order._id);
    // Include new details in the response for confirmation
    res.json({ orderId: order._id, totalAmount: order.totalAmount, deliveryFee: order.deliveryFee });

  } catch (err) {
    console.error("Order error:", err);
    res.status(500).json({ error: "Server error" });
  }
};


// Note: The redundant 'const Order' line below has been removed.
exports.getOrdersByUser = async (req, res) => {
  const { userId } = req.params;
  const { sortBy = "timestamp", order = "desc" } = req.query;

  try {
    const sortOptions = {};
    if (["timestamp", "totalAmount"].includes(sortBy)) {
      sortOptions[sortBy] = order === "asc" ? 1 : -1;
    } else {
      sortOptions["timestamp"] = -1;
    }

    const orders = await Order.find({ userId })
      .populate("items.productId")
      .sort(sortOptions);

    res.json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ error: "Could not retrieve orders" });
  }
};