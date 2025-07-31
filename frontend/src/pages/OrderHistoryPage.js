import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "./OrderHistoryPage.css";

const OrderHistoryPage = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("date-newest");
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (!user || !user.userId) return;

    fetch(`${API_URL}/api/orders/${user.userId}`)
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Failed to fetch orders:", err);
        setLoading(false);
      });
  }, [user, API_URL]);

  const sortedOrders = [...orders].sort((a, b) => {
    if (sortBy === "date-newest") return new Date(b.timestamp) - new Date(a.timestamp);
    if (sortBy === "date-oldest") return new Date(a.timestamp) - new Date(b.timestamp);
    if (sortBy === "amount-high") return b.totalAmount - a.totalAmount;
    if (sortBy === "amount-low") return a.totalAmount - b.totalAmount;
    return 0;
  });

  return (
    <div className="order-history-page">
      <h2>🧾 Order History</h2>

      <div className="sort-bar">
        <span>{orders.length} orders</span>
        <h3>My Orders</h3>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="date-newest">Date ↓</option>
          <option value="date-oldest">Date ↑</option>
          <option value="amount-high">Amount ↓</option>
          <option value="amount-low">Amount ↑</option>
        </select>
      </div>

      {loading ? (
        <p>Loading orders...</p>
      ) : sortedOrders.length === 0 ? (
        <p>You have no past orders.</p>
      ) : (
        <div className="order-list">
          {sortedOrders.map((order) => (
            <div className="order-card" key={order._id}>
              <div className="order-header">
                <p><strong>Date:</strong> {new Date(order.timestamp).toLocaleString()}</p>
                <p><strong>Total:</strong> ${order.totalAmount.toFixed(2)}</p>
                <p><strong>Status:</strong> {order.status}</p>
                <p><strong>Order ID:</strong> {order._id.slice(-6).toUpperCase()}</p>
              </div>

              <div className="order-items">
                {order.items.map((item, i) => (
                  <p key={i}>
                    {item.quantity}x {item.productId?.name || "Deleted Product"}
                  </p>
                ))}
              </div>

              <div className="order-footer">
                <span>Subtotal: ${order.subtotal.toFixed(2)}</span>
                <span>Tax: ${order.taxAmount.toFixed(2)}</span>
                <span>Delivery: ${order.deliveryFee.toFixed(2)}</span>
                {order.discountAmount > 0 && (
                  <span className="discount">Discount: -${order.discountAmount.toFixed(2)}</span>
                )}
                <span className="final-total">Total: ${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;
