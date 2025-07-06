import React, { useEffect, useState } from "react";
import axios from "axios";

const OrderHistoryPage = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      axios
        .get(`/api/orders/${user._id}`)
        .then((res) => {
          setOrders(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("❌ Failed to fetch orders:", err);
          setLoading(false);
        });
    }
  }, [user]);

  if (loading) return <p>Loading order history...</p>;
  if (!orders.length) return <p>No orders found.</p>;

  return (
    <div className="order-history">
      <h2>🧾 Your Order History</h2>
      {orders.map((order) => (
        <div key={order._id} className="order-card">
          <p><strong>Order ID:</strong> {order._id}</p>
          <p><strong>Date:</strong> {new Date(order.timestamp).toLocaleString()}</p>
          <p><strong>Status:</strong> {order.status || "N/A"}</p>
          <p><strong>Total:</strong> ${order.totalAmount.toFixed(2)}</p>

          <ul>
            {order.items.map((item, index) => (
              <li key={index}>
                Product ID: {item.productId} | Quantity: {item.quantity}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default OrderHistoryPage;
