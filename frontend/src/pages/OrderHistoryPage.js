import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "./OrderHistoryPage.css";

const OrderHistoryPage = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (user) {
      axios
        .get(`${API_URL}/api/orders/${user}`)
        .then((res) => {
          setOrders(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("❌ Failed to fetch orders:", err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [user, API_URL]);

  if (loading) return <p>Loading order history...</p>;
  if (!orders.length) return <p>No orders found.</p>;

  return (
    <div className="order-history-container">
      <h2>🧾 Your Order History</h2>
      {orders.map((order) => {
        const subtotal = order.items.reduce(
          (sum, item) => sum + item.productId.price * item.quantity,
          0
        );
        const tax = subtotal * 0.0825;
        const total = subtotal + tax;
        const totalQuantity = order.items.reduce(
          (sum, item) => sum + item.quantity,
          0
        );

        return (
          <div key={order._id} className="order-card">
            <div className="order-header">
              <p><strong>Order ID:</strong> {order._id}</p>
              <p><strong>Date:</strong> {new Date(order.timestamp).toLocaleString()}</p>
              <p><strong>Status:</strong> {order.status || "N/A"}</p>
              <p><strong>Total Items:</strong> {totalQuantity}</p>
            </div>

            <div className="order-items">
              {order.items.map((item, index) => (
                <div key={index} className="order-item">
                  <img
                    src={item.productId.image}
                    alt={item.productId.name}
                    className="item-image"
                  />
                  <span>
                    {item.quantity}x {item.productId.name} — ${item.productId.price.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ textAlign: "right", marginTop: "1rem" }}>
              <p><strong>Subtotal:</strong> ${subtotal.toFixed(2)}</p>
              <p><strong>Tax (8.25%):</strong> ${tax.toFixed(2)}</p>
              <p><strong>Total:</strong> ${total.toFixed(2)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrderHistoryPage;
